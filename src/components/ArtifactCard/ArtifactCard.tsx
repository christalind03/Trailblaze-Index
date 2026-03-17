import { useEffect, useState } from 'react';

import { ArtifactCardContent } from '@/components/ArtifactCard';
import { ArtifactCardTrigger } from '@/components/ArtifactCard';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/Collapsible';
import { useFilter } from '@/context/FilterProvider';
import { Artifact } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  artifactData: {
    artifactDetails: Artifact;
    userIDs: number[];
  };
  isDisabled: boolean;
};

export function ArtifactCard({ artifactData, isDisabled }: Props) {
  const [cardOpen, setCardOpen] = useState(false);
  const { filterActive, filteredCharacterIDs } = useFilter();

  useEffect(() => {
    if (filterActive) {
      const hasFilteredCharacters = artifactData.userIDs.some((characterID) =>
        filteredCharacterIDs.has(characterID)
      );
      if (!hasFilteredCharacters) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardOpen(false);
      }
    }
  }, [artifactData.userIDs, filterActive, filteredCharacterIDs, setCardOpen]);

  return (
    <Collapsible
      className={cn(
        'bg-secondary ring-1 ring-border rounded-xl',
        isDisabled && 'brightness-50 pointer-events-none'
      )}
      onOpenChange={setCardOpen}
      open={cardOpen}
    >
      <CollapsibleTrigger asChild>
        <ArtifactCardTrigger artifactData={artifactData} isOpen={cardOpen} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ArtifactCardContent
          artifactDetails={artifactData.artifactDetails}
          isOpen={cardOpen}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
