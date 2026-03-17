import { forwardRef, Fragment, useMemo } from 'react';

import CharacterAvatarGroup from '@/components/CharacterAvatarGroup';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useFilter } from '@/context/FilterProvider';
import { STORAGE_URL } from '@/lib/constants';
import { Artifact } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  artifactData: {
    artifactDetails: Artifact;
    userIDs: number[];
  };
  isOpen: boolean;
};

const MAX_DISPLAYABLE_CHARACTERS = 5;

export const ArtifactCardTrigger = forwardRef<HTMLDivElement, Props>(
  function CardTrigger(
    {
      artifactData: {
        artifactDetails: { id, name },
        userIDs,
      },
      isOpen,
      ...remainingProps
    },
    ref
  ) {
    const { filterActive, filteredCharacterIDs } = useFilter();
    const hasFilteredCharacters = useMemo(
      () =>
        userIDs.some((characterID) => filteredCharacterIDs.has(characterID)),
      [filteredCharacterIDs, userIDs]
    );

    return (
      <Card
        className={cn(
          'bg-transparent ring-0 hover:bg-border hover:cursor-pointer',
          isOpen && 'rounded-t-xl rounded-b-none'
        )}
        ref={ref}
        {...remainingProps}
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
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const showFiltered = filterActive && hasFilteredCharacters;
                    const characterList = showFiltered
                      ? Array.from(filteredCharacterIDs)
                      : userIDs;

                    return (
                      <Fragment>
                        <CharacterAvatarGroup
                          characterList={characterList.slice(
                            0,
                            MAX_DISPLAYABLE_CHARACTERS
                          )}
                          {...(MAX_DISPLAYABLE_CHARACTERS <
                            characterList.length && {
                            groupCount:
                              characterList.length - MAX_DISPLAYABLE_CHARACTERS,
                          })}
                        />
                        {showFiltered && (
                          <span className="text-primary text-xs">
                            {filteredCharacterIDs.size} Match
                            {filteredCharacterIDs.size === 1 ? '' : 'es'}
                          </span>
                        )}
                      </Fragment>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }
);
