import { useState } from 'react';

import ArtifactCardContent from '@/components/ArtifactCardContent';
import { ArtifactCardTrigger } from '@/components/ArtifactCardTrigger';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/Collapsible';
import { Artifact } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  artifactData: {
    artifactDetails: Artifact;
    userIDs: number[];
  };
  isDisabled: boolean;
};

export default function ArtifactCard({ artifactData, isDisabled }: Props) {
  const [cardOpen, setCardOpen] = useState(false);

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
