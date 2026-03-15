import { supabaseClient } from '@/lib/common';

export default async function fetchCharacters() {
  const { data: characterData, error: characterError } = await supabaseClient
    .from('characters')
    .select(
      `
      *,
      character_artifacts(count)
    `
    )
    .order('name', { ascending: true });

  if (characterError) {
    throw characterError;
  }

  return characterData?.map(({ character_artifacts, ...characterDetails }) => ({
    characterDetails,
    hasData: 0 < character_artifacts[0].count,
  }));
}
