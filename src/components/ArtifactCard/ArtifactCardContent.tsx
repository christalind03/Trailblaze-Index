import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ArtifactStats } from '@/components/ArtifactCard';
import Loading from '@/components/Loading';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/InputGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useFilter } from '@/context/FilterProvider';
import { SearchProvider } from '@/context/SearchProvider';
import { STORAGE_URL } from '@/lib/constants';
import { Artifact } from '@/lib/types';
import { cn } from '@/lib/utils';
import fetchStatistics from '@/services/fetchStatistics';

type Props = {
  artifactDetails: Artifact;
  isOpen: boolean;
};

export function ArtifactCardContent({
  artifactDetails: { id },
  isOpen,
}: Props) {
  const [activeSlot, setActiveSlot] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const { filteredCharacterIDs } = useFilter();

  const { data: statisticsData, error: statisticsError } = useQuery({
    enabled: isOpen,
    queryFn: () => fetchStatistics(id),
    queryKey: ['statistics', id],
  });

  const searchResults = useMemo(() => {
    if (!searchText?.trim() || !statisticsData) {
      return [];
    }

    return Object.entries(statisticsData).flatMap(
      ([statisticsKey, statisticsValue]) => {
        if (activeSlot === statisticsKey) {
          return statisticsValue.filter(
            (currentEntry) =>
              currentEntry.main.toLowerCase().includes(searchText) ||
              currentEntry.substats.some(
                (substatData) =>
                  substatData.characters.some((characterID) =>
                    filteredCharacterIDs.has(characterID)
                  ) &&
                  substatData.stats.some((currentStat) =>
                    currentStat.toLowerCase().includes(searchText)
                  )
              )
          );
        }

        return [];
      }
    );
  }, [activeSlot, searchText, filteredCharacterIDs, statisticsData]);

  useEffect(() => {
    if (statisticsData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSlot(Object.keys(statisticsData)[0]);
    }
  }, [setActiveSlot, statisticsData]);

  if (statisticsData) {
    return (
      <Tabs className="gap-0" onValueChange={setActiveSlot} value={activeSlot}>
        <div className="bg-background/50 border-y flex flex-col h-9.5 items-center justify-center">
          <TabsList className="bg-transparent rounded-none w-full">
            {Object.keys(statisticsData).map((statisticsKey) => {
              const activeTab = activeSlot === statisticsKey;
              const imageURL = `${STORAGE_URL}/artifacts/${statisticsKey}.png`;

              return (
                <TabsTrigger
                  className="bg-transparent data-active:bg-transparent hover:cursor-pointer"
                  key={statisticsKey}
                  value={statisticsKey}
                >
                  <span
                    className={cn(
                      'bg-muted-foreground size-7.5',
                      activeTab && 'bg-foreground'
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
        {Object.entries(statisticsData).map(
          ([statisticsKey, statisticsValue]) => (
            <TabsContent key={statisticsKey} value={statisticsKey}>
              <SearchProvider searchText={searchText}>
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
                {!!searchText && searchResults.length === 0 ? (
                  <div className="flex items-center justify-center p-5 text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <div className="grid grid-cols-[auto_auto_1fr]">
                    {statisticsValue.map((aggregatedData, slotIndex) => (
                      <ArtifactStats
                        aggregatedData={aggregatedData}
                        isSearchResult={searchResults.includes(aggregatedData)}
                        key={slotIndex}
                      />
                    ))}
                  </div>
                )}
              </SearchProvider>
            </TabsContent>
          )
        )}
      </Tabs>
    );
  }

  if (statisticsError) {
    return <div>{statisticsError.message}</div>;
  }

  return <Loading />;
}
