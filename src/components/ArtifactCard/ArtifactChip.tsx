import { useMemo } from 'react';

import { useSearch } from '@/context/SearchProvider';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
};

export function ArtifactChip({ label }: Props) {
  const searchText = useSearch();
  const isMatch = useMemo(
    () =>
      searchText?.trim() ? label.toLowerCase().includes(searchText) : false,
    [label, searchText]
  );

  return (
    <span
      className={cn(
        'bg-accent border px-3 py-1 rounded-lg text-accent-foreground',
        isMatch && 'bg-primary/15 border-primary/35 text-primary'
      )}
    >
      {label}
    </span>
  );
}
