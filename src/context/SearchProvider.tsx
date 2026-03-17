import { createContext, useContext } from 'react';

type SearchContextType = null | string;

const SearchContext = createContext<SearchContextType>(null);

type Props = Readonly<{
  children: React.ReactNode;
  searchText: string;
}>;

export function SearchProvider({ children, searchText }: Props) {
  return (
    <SearchContext.Provider value={searchText}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const searchContext = useContext(SearchContext);
  if (searchContext === null) {
    throw new Error("'useSearch' must be used within <SearchProvider>");
  }

  return searchContext;
}
