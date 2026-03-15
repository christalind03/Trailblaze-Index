import { supabaseClient } from '@/lib/common';

export default async function fetchArtifacts() {
  const { data: artifactData, error: artifactError } = await supabaseClient
    .from('artifacts')
    .select(
      `
      *,
      character_artifacts(character_id)
    `
    )
    .order('name', { ascending: true });

  if (artifactError) {
    throw artifactError;
  }

  return artifactData?.map(({ character_artifacts, ...artifactDetails }) => ({
    artifactDetails,
    userIDs: character_artifacts.map(({ character_id }) => character_id),
  }));
}
