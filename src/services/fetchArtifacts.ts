import { supabaseClient } from '@/lib/common';

export default async function fetchArtifacts() {
  const { data: artifactData, error: artifactError } = await supabaseClient
    .from('artifacts')
    .select(
      `
      *,
      character_artifacts(character_id)
    `
    );

  if (artifactError) {
    throw artifactError;
  }

  return (artifactData ?? [])
    .map(({ character_artifacts, ...artifactDetails }) => ({
      artifactDetails,
      userIDs: character_artifacts.map(({ character_id }) => character_id),
    }))
    .sort((firstArtifact, secondArtifact) => {
      const firstHasUsers = firstArtifact.userIDs.length > 0;
      const secondHasUsers = secondArtifact.userIDs.length > 0;

      if (firstHasUsers !== secondHasUsers) return firstHasUsers ? -1 : 1;

      return firstArtifact.artifactDetails.name
        .toLowerCase()
        .localeCompare(secondArtifact.artifactDetails.name.toLowerCase());
    });
}
