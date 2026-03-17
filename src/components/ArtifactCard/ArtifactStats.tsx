'use client';

import { Fragment, useMemo } from 'react';

import { ArtifactSubstats } from '@/components/ArtifactCard';
import { Separator } from '@/components/ui/Separator';
import { useFilter } from '@/context/FilterProvider';
import { useSearch } from '@/context/SearchProvider';
import { AggregatedData } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  aggregatedData: AggregatedData;
  isSearchResult: boolean;
};

export function ArtifactStats({ aggregatedData, isSearchResult }: Props) {
  const { filterActive, filteredCharacterIDs } = useFilter();

  const hasFilteredCharacters = useMemo(
    () =>
      aggregatedData.substats.some(({ characters }) =>
        characters.some((characterID) => filteredCharacterIDs.has(characterID))
      ),
    [aggregatedData, filteredCharacterIDs]
  );

  const searchText = useSearch();

  const userCount = useMemo(() => {
    const activeUsers = new Set(
      aggregatedData.substats.flatMap(({ characters }) => characters)
    );

    return activeUsers.size;
  }, [aggregatedData]);

  const isExcludedFromFilter = filterActive && !hasFilteredCharacters;
  const isExcludedFromSearch = !!searchText && !isSearchResult;
  if (isExcludedFromFilter || isExcludedFromSearch) {
    return null;
  }

  return (
    <Fragment>
      <div className="border-t gap-1 flex flex-col items-start justify-center p-5 text-xs">
        <span className={cn('font-medium', isSearchResult && 'text-primary')}>
          {aggregatedData.main}
        </span>
        <span className="font-light text-muted-foreground">
          {userCount} Character{userCount === 1 ? '' : 's'}
        </span>
      </div>
      <Separator className="border-t" orientation="vertical" />
      <div className="border-t gap-1.5 flex flex-col p-3 w-full">
        {aggregatedData.substats.map((substatData, groupIndex) => (
          <ArtifactSubstats key={groupIndex} {...substatData} />
        ))}
      </div>
    </Fragment>
  );
}
