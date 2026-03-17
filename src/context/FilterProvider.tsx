import { createContext, useContext, useMemo } from 'react';

import { Character } from '@/lib/types';

type FilterContextType = null | {
  filterActive: boolean;
  filteredCharacterIDs: Set<number>;
};

const FilterContext = createContext<FilterContextType>(null);

type Props = Readonly<{
  children: React.ReactNode;
  filterActive: boolean;
  filteredCharacters: Character[];
}>;

export function FilterProvider({
  children,
  filterActive,
  filteredCharacters,
}: Props) {
  const filteredCharacterIDs = useMemo(
    () => new Set(filteredCharacters.map(({ id }) => id)),
    [filteredCharacters]
  );

  return (
    <FilterContext.Provider value={{ filterActive, filteredCharacterIDs }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const filterContext = useContext(FilterContext);
  if (!filterContext) {
    throw new Error("'useFilter' must be used within <FilterProvider>");
  }

  return filterContext;
}
