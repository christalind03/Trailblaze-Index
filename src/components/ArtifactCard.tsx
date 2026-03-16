import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';

import CharacterAvatarGroup from '@/components/CharacterAvatarGroup';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/Collapsible';
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
  artifactData: {
    artifactDetails: Artifact;
    userIDs: number[];
  };
  disabled: boolean;
};

const MAX_CHARACTERS = 5 as const;

export default function ArtifactCard({
  artifactData: {
    artifactDetails: { id, name },
    userIDs,
  },
  disabled,
}: Props) {
  // eslint-disable-next-line
  const [activeSelection, setActiveSelection] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const hasOverflow = useMemo(() => {
    return MAX_CHARACTERS < userIDs.length;
  }, [userIDs]);

  const {
    data: statisticsData,
    error: statisticsError,
    isPending: statisticsPending,
  } = useQuery({
    enabled: cardOpen,
    queryFn: () => fetchStatistics(id),
    queryKey: ['statistics', id],
  });

  const statisticEntries = useMemo(() => {
    if (statisticsData) {
      return Object.entries(statisticsData).map(
        ([statisticKey, statisticValue]) => ({
          statisticsKey: statisticKey.replace(/\s+/g, '_'),
          statisticsValue: statisticValue,
        })
      );
    }

    return null;
  }, [statisticsData]);

  // Derived from activeSelection rather than a useEffect to avoid cascading renders
  const activeSlot =
    activeSelection ?? statisticEntries?.[0]?.statisticsKey ?? '';

  return (
    <Collapsible
      className={cn(
        'bg-secondary ring-1 ring-border rounded-xl',
        disabled && 'brightness-50 pointer-events-none'
      )}
      onOpenChange={setCardOpen}
      open={cardOpen}
    >
      <CollapsibleTrigger asChild>
        <Card
          className={cn(
            'bg-transparent ring-0 hover:bg-border hover:cursor-pointer',
            cardOpen && 'rounded-t-xl rounded-b-none'
          )}
        >
          <CardHeader>
            <div className="flex flex-row gap-3 items-center">
              <img
                alt={name}
                className="size-12"
                src={`${STORAGE_URL}/artifacts/${id}.png`}
              />
              <div className="flex flex-col gap-1">
                <CardTitle className="line-clamp-1 text-sm">{name}</CardTitle>
                {userIDs.length === 0 ? (
                  <span className="text-muted-foreground text-xs">
                    No Characters
                  </span>
                ) : (
                  <CharacterAvatarGroup
                    characterList={userIDs.slice(0, MAX_CHARACTERS)}
                    {...(hasOverflow && {
                      groupCount: userIDs.length - MAX_CHARACTERS,
                    })}
                  />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
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
                {statisticEntries.map(({ statisticsKey, statisticsValue }) => (
                  <TabsContent key={statisticsKey} value={statisticsKey}>
                    <div className="px-2.5 py-3">
                      <InputGroup className="border-border bg-background/50 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:ring-0">
                        <InputGroupInput placeholder="Search..." />
                        <InputGroupAddon>
                          <SearchIcon />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr]">
                      {statisticsValue.map(({ main, substats }, slotIndex) => {
                        const activeUsers = new Set(
                          substats.flatMap(({ characters }) => characters)
                        ).size;

                        const singleUser = activeUsers === 1;

                        return (
                          <Fragment key={`${statisticsKey}_${slotIndex}`}>
                            <div className="border-t gap-1 flex flex-col items-start justify-center p-5 text-xs">
                              <span className="font-medium">{main}</span>
                              <span className="font-light text-muted-foreground">
                                {activeUsers} Character{singleUser ? '' : 's'}
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
                                        (currentStat, statIndex) => (
                                          <span
                                            className="bg-accent border px-3 py-1 rounded-lg text-accent-foreground"
                                            key={`${statisticsKey}_${slotIndex}_${groupIndex}_${statIndex}`}
                                          >
                                            {currentStat}
                                          </span>
                                        )
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
                ))}
              </Tabs>
            );
          })()}
        {statisticsError && <div>{statisticsError.message}</div>}
        {statisticsPending && <div>Loading...</div>}
      </CollapsibleContent>
    </Collapsible>
  );
}
