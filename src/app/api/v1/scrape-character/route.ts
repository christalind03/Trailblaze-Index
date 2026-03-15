import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';

import { Database } from '@/../supabase/database.types';
import {
  assertSupabaseResponse,
  catchError,
  createSupabaseClient,
  verifyAccess,
} from '@/app/api/v1/utils/common';
import { PRYDWEN_URL } from '@/app/api/v1/utils/constants';
import { RemoteError } from '@/app/api/v1/utils/RemoteError';
import { CharacterMetadata } from '@/lib/types';

enum ArtifactSet {
  Cavern = 0,
  Planar = 1,
}

const MILLISECONDS_PER_DAY = 86400000 as const;

export async function POST(httpRequest: Request) {
  try {
    verifyAccess(httpRequest);

    const { avatarURL } = await httpRequest.json();
    if (!avatarURL) {
      throw new RemoteError(
        'INVALID_REQUEST',
        "'avatarURL' must be a non-empty string",
        400
      );
    }

    const { data: axiosData, headers: axiosHeaders } = await axios.get(
      `${PRYDWEN_URL}${avatarURL}`
    );

    if (!axiosData) {
      throw new RemoteError(
        'NOT_FOUND',
        'No data returned from upstream service',
        404
      );
    }

    const $ = cheerio.load(axiosData);
    const supabaseClient = createSupabaseClient();

    if (!supabaseClient) {
      throw new RemoteError(
        'SERVICE_UNAVAILABLE',
        'Unable to initialize database client',
        503
      );
    }

    const { characterMetadata, hasExisted } = await fetchMetadata(
      $,
      supabaseClient,
      avatarURL
    );

    if (!characterMetadata) {
      throw new RemoteError(
        'NOT_FOUND',
        'Metadata for the requested character was not found',
        404
      );
    }

    const recentlyModified =
      hasExisted &&
      (() => {
        const lastFetched = new Date(characterMetadata.fetched_at);
        const lastModified = new Date(axiosHeaders['Last-Modified']);
        const timeDifference = Math.abs(
          lastFetched.getTime() - lastModified.getTime()
        );

        return timeDifference <= MILLISECONDS_PER_DAY;
      });

    if (!hasExisted || recentlyModified) {
      await updateCharacterRecords(
        $,
        supabaseClient,
        characterMetadata.character_id
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Action Successful',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (errorData) {
    return catchError(errorData);
  }
}

async function deleteCharacterRecords(
  supabaseClient: SupabaseClient,
  characterID: number
) {
  await fromTable('character_artifacts');
  await fromTable('character_stats');
  await fromTable('character_substats');

  async function fromTable(databaseTable: keyof Database['public']['Tables']) {
    assertSupabaseResponse(
      await supabaseClient
        .from(databaseTable)
        .delete()
        .match({ character_id: characterID })
    );
  }
}

async function fetchMetadata(
  $: cheerio.CheerioAPI,
  supabaseClient: SupabaseClient,
  sourceURL: string
) {
  let characterMetadata: CharacterMetadata | null;
  let hasExisted = true;

  // Check to see if this character already has existing metadata...
  characterMetadata = assertSupabaseResponse(
    await supabaseClient
      .from('character_metadata')
      .select()
      .match({ source: sourceURL })
      .maybeSingle()
  );

  if (characterMetadata) {
    return {
      characterMetadata,
      hasExisted,
    };
  }

  // Otherwise, scrape and insert data...
  const characterIntro = $('div.character-intro h2 strong');
  const characterData = assertSupabaseResponse(
    await supabaseClient
      .from('characters')
      .upsert(
        {
          element: $(characterIntro[3]).text().trim(),
          name: $(characterIntro[0]).text().trim(),
          path: $(characterIntro[4]).text().trim().split(/\s+/)[2],
          quality: $(characterIntro[2]).text().trim(),
        },
        { onConflict: 'name' } // Using `upsert` protects previously generated data, if it exists
      )
      .select()
      .single()
  );

  characterMetadata = assertSupabaseResponse(
    await supabaseClient
      .from('character_metadata')
      .insert({
        character_id: characterData.id,
        fetched_at: new Date().toUTCString(),
        source: sourceURL,
      })
      .select()
      .single()
  );

  hasExisted = false;

  return {
    characterMetadata: characterMetadata!,
    hasExisted,
  };
}

async function insertArtifacts(
  $: cheerio.CheerioAPI,
  supabaseClient: SupabaseClient,
  characterID: number
) {
  const artifactsContainer = $('.build-relics .detailed-cones');
  const artifactRecords = assertSupabaseResponse(
    await supabaseClient.from('artifacts').select('id, name')
  );

  const existingArtifacts = artifactRecords.reduce(
    (artifactsCache, currRecord) => {
      artifactsCache[currRecord.name] = currRecord.id;
      return artifactsCache;
    },
    {} as Record<string, number>
  );

  await extractArtifacts(ArtifactSet.Cavern);
  await extractArtifacts(ArtifactSet.Planar);

  async function extractArtifacts(artifactSet: ArtifactSet) {
    const alternativeArtifacts = $(artifactsContainer[artifactSet])
      .find('.information:nth-child(2) .hsr-name span')
      .map((_, cheerioElement) => scrapeText($, cheerioElement))
      .get();

    const optimalArtifacts = $(artifactsContainer[artifactSet])
      .find('.single-cone:first button')
      .map((_, cheerioElement) => scrapeText($, cheerioElement))
      .get();

    const setCombo =
      0 < alternativeArtifacts.length || 1 < optimalArtifacts.length
        ? 'dual-set'
        : 'full-set';

    await registerArtifacts(artifactSet, alternativeArtifacts, false, setCombo);
    await registerArtifacts(artifactSet, optimalArtifacts, true, setCombo);
  }

  async function registerArtifacts(
    artifactSet: ArtifactSet,
    artifactSets: string[],
    hasPriority: boolean,
    setCombo: string
  ) {
    for (const activeSet of artifactSets) {
      const artifactID = await resolveArtifact(artifactSet, activeSet);
      if (artifactID) {
        assertSupabaseResponse(
          await supabaseClient.from('character_artifacts').insert({
            artifact_id: artifactID,
            character_id: characterID,
            has_priority: hasPriority,
            type: setCombo,
          })
        );
      }
    }
  }

  async function resolveArtifact(artifactSet: ArtifactSet, activeSet: string) {
    if (activeSet in existingArtifacts) {
      return existingArtifacts[activeSet];
    }

    const artifactRecord = assertSupabaseResponse(
      await supabaseClient
        .from('artifacts')
        .upsert({
          name: activeSet,
          type:
            artifactSet === ArtifactSet.Cavern
              ? 'Cavern Relic'
              : 'Planar Ornament',
        })
        .select()
        .single()
    );

    return artifactRecord.id;
  }
}

async function insertStatistics(
  $: cheerio.CheerioAPI,
  supabaseClient: SupabaseClient,
  characterID: number
) {
  const masterContainer = $('.build-stats')[0];

  await insertStats();
  await insertSubstats();

  async function insertStats() {
    const statsContainers = $(masterContainer)
      .find('.main-stats div.box')
      .get();

    for (const statContainer of statsContainers) {
      const artifactSlot = $(statContainer).find('.stats-header').text();
      const statsList = $(statContainer)
        .find('.hsr-stat span')
        .map((_, cheerioElement) => scrapeText($, cheerioElement))
        .get();

      if (artifactSlot && statsList) {
        for (const [priorityIndex, statLabel] of statsList.entries()) {
          assertSupabaseResponse(
            await supabaseClient.from('character_stats').insert({
              character_id: characterID,
              label: statLabel,
              priority: priorityIndex,
              slot: artifactSlot,
            })
          );
        }
      }
    }
  }

  async function insertSubstats() {
    const substatsContainer = $(masterContainer)
      .find('.sub-stats p')
      .text()
      .split(/\bor\b/);

    for (const [groupIndex, statList] of substatsContainer.entries()) {
      const statLabels = statList
        .replace(/^\s*\[|]\s*$/g, '')
        .split(/\s*[>=]\s*/g)
        .filter((statLabel) => statLabel !== '');

      for (const [priorityIndex, activeStat] of statLabels.entries()) {
        let statLabel = activeStat;
        const statCondition = activeStat.match(/\((.*?)\)/g);
        if (statCondition) {
          statLabel = activeStat
            .substring(0, activeStat.indexOf(statCondition[0][0]))
            .trim();
        }

        assertSupabaseResponse(
          await supabaseClient.from('character_substats').insert({
            character_id: characterID,
            condition: statCondition ? statCondition[0].trim() : null,
            group: groupIndex,
            label: statLabel,
            priority: priorityIndex,
          })
        );
      }
    }
  }
}

// eslint-disable-next-line
function scrapeText($: cheerio.CheerioAPI, cheerioElement: any) {
  return $(cheerioElement)
    .contents()
    .filter((_, elementObject) => elementObject.type === 'text')
    .text()
    .trim();
}

async function updateCharacterRecords(
  $: cheerio.CheerioAPI,
  supabaseClient: SupabaseClient,
  characterID: number
) {
  await deleteCharacterRecords(supabaseClient, characterID);

  await insertArtifacts($, supabaseClient, characterID);
  await insertStatistics($, supabaseClient, characterID);
}
