import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';

import CharacterAvatarGroup from '@/components/CharacterAvatarGroup';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/InputGroup';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { STORAGE_URL } from '@/lib/constants';
import { Artifact } from '@/lib/types';
import { cn } from '@/lib/utils';
import fetchStatistics from '@/services/fetchStatistics';

type Props = {
  artifactDetails: Artifact;
  isOpen: boolean;
};

export default function ArtifactCardContent({
  artifactDetails: { id },
  isOpen,
}: Props) {
  const [activeSelection, setActiveSelection] = useState<null | string>(null);
  const [searchText, setSearchText] = useState<null | string>(null);

  const {
    data: statisticsData,
    error: statisticsError,
    isPending: statisticsPending,
  } = useQuery({
    enabled: isOpen,
    queryFn: () => fetchStatistics(id),
    queryKey: ['statistics', id],
  });

  const statisticEntries = useMemo(() => {
    if (statisticsData) {
      return Object.entries(statisticsData).map(
        ([statisticsKey, statisticsValue]) => ({
          statisticsKey: statisticsKey.replace(/\s+/g, '_'),
          statisticsValue,
        })
      );
    }

    return null;
  }, [statisticsData]);

  const filteredEntries = useMemo(() => {
    if (!searchText || searchText === '') {
      return [];
    }

    const filteredResults = statisticEntries?.flatMap(({ statisticsValue }) => {
      return statisticsValue.filter(
        (currentEntry) =>
          currentEntry.main.toLowerCase().includes(searchText) ||
          currentEntry.substats.some((currentSubstat) =>
            currentSubstat.stats.some((currentStat) =>
              currentStat.toLowerCase().includes(searchText)
            )
          )
      );
    });

    console.log(filteredResults);

    return filteredResults ?? [];
  }, [searchText, statisticEntries]);

  // Derived from activeSelection rather than a useEffect to avoid cascading renders
  const activeSlot =
    activeSelection ?? statisticEntries?.[0]?.statisticsKey ?? '';

  return (
    <Fragment>
      {statisticEntries &&
        (() => {
          return (
            <Tabs
              className="gap-0"
              onValueChange={setActiveSelection}
              value={activeSlot}
            >
              <div className="bg-background/50 border-y flex flex-col h-9.5 items-center justify-center">
                <TabsList className="bg-transparent rounded-none w-full">
                  {statisticEntries.map(({ statisticsKey }) => {
                    const imageURL = `${STORAGE_URL}/artifacts/${statisticsKey}.png`;
                    const isActive = activeSlot === statisticsKey;

                    return (
                      <TabsTrigger
                        className="bg-transparent data-active:bg-transparent hover:cursor-pointer"
                        key={statisticsKey}
                        value={statisticsKey}
                      >
                        <span
                          className={cn(
                            'bg-muted-foreground size-7.5',
                            isActive && 'bg-foreground'
                          )}
                          style={{
                            maskImage: `url(${imageURL})`,
                            maskPosition: 'center',
                            maskRepeat: 'no-repeat',
                            maskSize: '72.5%',
                            WebkitMaskImage: `url(${imageURL})`,
                            WebkitMaskPosition: 'center',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskSize: '72.5%',
                          }}
                        />
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              {statisticEntries.map((currentEntry) => {
                const { statisticsKey, statisticsValue } = currentEntry;

                return (
                  <TabsContent key={statisticsKey} value={statisticsKey}>
                    <div className="px-2.5 py-3">
                      <InputGroup className="border-border bg-background/50 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:ring-0">
                        <InputGroupInput
                          onChange={(changeEvent) =>
                            setSearchText(
                              changeEvent.target.value.toLowerCase().trim()
                            )
                          }
                          placeholder="Search..."
                          value={searchText ?? ''}
                        />
                        <InputGroupAddon>
                          <SearchIcon />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr]">
                      {statisticsValue.map((aggregatedData, slotIndex) => {
                        const { main, substats } = aggregatedData;

                        const activeUsers = new Set(
                          substats.flatMap(({ characters }) => characters)
                        ).size;

                        const isFilteredEntry =
                          filteredEntries.includes(aggregatedData);
                        const isSingle = activeUsers === 1;

                        if (!isFilteredEntry && !!searchText) return;

                        return (
                          <Fragment key={`${statisticsKey}_${slotIndex}`}>
                            <div className="border-t gap-1 flex flex-col items-start justify-center p-5 text-xs">
                              <span
                                className={cn(
                                  'font-medium',
                                  isFilteredEntry && 'text-primary'
                                )}
                              >
                                {main}
                              </span>
                              <span className="font-light text-muted-foreground">
                                {activeUsers} Character{isSingle ? '' : 's'}
                              </span>
                            </div>
                            <Separator
                              className="border-t h-full"
                              orientation="vertical"
                            />
                            <div className="border-t gap-1.5 flex flex-col p-3 w-full">
                              {substats.map(
                                (
                                  {
                                    characters: characterList,
                                    stats: statsList,
                                  },
                                  groupIndex
                                ) => (
                                  <div
                                    className="flex items-start justify-between"
                                    key={`${statisticsKey}_${slotIndex}_${groupIndex}`}
                                  >
                                    <div className="gap-1 flex flex-wrap text-xs">
                                      {statsList.map(
                                        (currentStat, statIndex) => {
                                          const isMatch = searchText?.trim()
                                            ? currentStat
                                                .toLowerCase()
                                                .includes(searchText)
                                            : false;

                                          return (
                                            <span
                                              className={cn(
                                                'bg-accent border px-3 py-1 rounded-lg' +
                                                  ' text-accent-foreground',
                                                isMatch &&
                                                  'bg-primary/15 border-primary/35' +
                                                    ' text-primary'
                                              )}
                                              key={`${statisticsKey}_${slotIndex}_${groupIndex}_${statIndex}`}
                                            >
                                              {currentStat}
                                            </span>
                                          );
                                        }
                                      )}
                                    </div>
                                    <div className="mt-1">
                                      <CharacterAvatarGroup
                                        characterList={characterList}
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          );
        })()}
      {statisticsError && <div>{statisticsError.message}</div>}
      {statisticsPending && <div>Loading...</div>}
    </Fragment>
  );
}
