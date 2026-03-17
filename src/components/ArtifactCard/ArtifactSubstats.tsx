'use client';

import { useMemo } from 'react';

import { ArtifactChip } from '@/components/ArtifactCard';
import CharacterAvatarGroup from '@/components/CharacterAvatarGroup';
import { useFilter } from '@/context/FilterProvider';

type Props = {
  characters: number[];
  stats: string[];
};

const MAX_DISPLAYABLE_CHARACTERS = 3;

export function ArtifactSubstats({ characters, stats }: Props) {
  const { filterActive, filteredCharacterIDs } = useFilter();
  const filteredCharacters = useMemo(
    () =>
      characters.filter((characterID) => filteredCharacterIDs.has(characterID)),
    [characters, filteredCharacterIDs]
  );

  const hasOverflow = useMemo(
    () => MAX_DISPLAYABLE_CHARACTERS < filteredCharacters.length,
    [filteredCharacters]
  );

  if (filterActive && !filteredCharacters?.length) {
    return null;
  }

  return (
    <div className="flex items-start justify-between">
      <div className="gap-1 flex flex-wrap text-xs">
        {stats.map((currentStat, currentIndex) => (
          <ArtifactChip key={currentIndex} label={currentStat} />
        ))}
      </div>
      <div className="mt-1">
        <CharacterAvatarGroup
          characterList={(filterActive ? filteredCharacters : characters).slice(
            0,
            MAX_DISPLAYABLE_CHARACTERS
          )}
          {...(hasOverflow && {
            groupCount: filteredCharacters.length - MAX_DISPLAYABLE_CHARACTERS,
          })}
        />
      </div>
    </div>
  );
}
