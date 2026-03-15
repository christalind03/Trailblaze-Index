import { useState } from 'react';

import CharacterAvatarGroup from '@/components/CharacterAvatarGroup';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/Collapsible';
import { STORAGE_URL } from '@/lib/constants';
import { Artifact } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  const [cardOpen, setCardOpen] = useState(false);
  const hasOverflow = MAX_CHARACTERS < userIDs.length;

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
      <CollapsibleContent className="border-t p-3">
        <div>Collapsible Content</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
