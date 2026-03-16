import { forwardRef, useMemo } from 'react';

import CharacterAvatarGroup from '@/components/CharacterAvatarGroup';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
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

const MAX_CHARACTERS = 5 as const;

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
    const hasOverflow = useMemo(() => {
      return MAX_CHARACTERS < userIDs.length;
    }, [userIDs]);

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
    );
  }
);
