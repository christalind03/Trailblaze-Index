'use client';

import { PostgrestError } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useMemo, useState } from 'react';

import { ArtifactCard } from '@/components/ArtifactCard';
import CharacterFilter from '@/components/CharacterFilter';
import Error from '@/components/Error';
import Hero from '@/components/Hero';
import Loading from '@/components/Loading';
import { FilterProvider } from '@/context/FilterProvider';
import { russoOne } from '@/lib/common';
import { Character } from '@/lib/types';
import { cn } from '@/lib/utils';
import fetchArtifacts from '@/services/fetchArtifacts';
import fetchCharacters from '@/services/fetchCharacters';

export default function Home() {
  const {
    data: artifactData,
    error: artifactError,
    isPending: artifactPending,
  } = useQuery({
    queryFn: () => fetchArtifacts(),
    queryKey: ['artifacts'],
  });

  const {
    data: characterData,
    error: characterError,
    isPending: characterPending,
  } = useQuery({
    queryFn: () => fetchCharacters(),
    queryKey: ['characters'],
  });

  const [characterFilter, setCharacterFilter] = useState<Character[]>([]);
  const artifactFilter = useMemo(() => {
    if (!artifactData) {
      return [];
    }

    if (!characterFilter?.length) {
      return artifactData.map(({ artifactDetails: { id } }) => id);
    }

    return artifactData
      .filter(({ userIDs }) =>
        characterFilter.some(({ id }) => userIDs.includes(id))
      )
      .map(({ artifactDetails: { id } }) => id);
  }, [artifactData, characterFilter]);

  const orderedArtifacts = useMemo(() => {
    if (!artifactData) {
      return [];
    }

    const filterSet = new Set(artifactFilter);
    return [...artifactData].sort((artifactOne, artifactTwo) => {
      const matchOne = filterSet.has(artifactOne.artifactDetails.id);
      const matchTwo = filterSet.has(artifactTwo.artifactDetails.id);

      return Number(matchTwo) - Number(matchOne);
    });
  }, [artifactData, artifactFilter]);

  return (
    <Fragment>
      <Hero />
      <div className="flex flex-col items-center justify-center pb-15 pt-5 px-5">
        {artifactData && characterData && (
          <Fragment>
            <div className="flex flex-col gap-1.5 max-w-[475px] w-full">
              <span
                className={cn(
                  'font-bold text-muted-foreground text-xl tracking-widest',
                  russoOne.className
                )}
              >
                Relic Sets
              </span>
              <CharacterFilter
                characterList={characterData}
                onChange={setCharacterFilter}
              />
            </div>
            <FilterProvider
              filterActive={0 < characterFilter.length}
              filteredCharacters={characterFilter}
            >
              <div className="gap-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 m-7.5 w-full">
                {orderedArtifacts.map((activeArtifact) => {
                  const {
                    artifactDetails: { id },
                    userIDs,
                  } = activeArtifact;

                  const isDisabled =
                    !artifactFilter?.includes(id) || userIDs.length === 0;

                  return (
                    <div key={id}>
                      <ArtifactCard
                        artifactData={activeArtifact}
                        isDisabled={isDisabled}
                      />
                    </div>
                  );
                })}
              </div>
            </FilterProvider>
          </Fragment>
        )}
        {(artifactError || characterError) && (
          <div className="max-w-lg">
            <Error
              errorObj={(artifactError || characterError) as PostgrestError}
            />
          </div>
        )}
        {(artifactPending || characterPending) && <Loading />}
      </div>
    </Fragment>
  );
}
