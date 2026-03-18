import { useEffect, useState } from 'react';

export function useDebounce<T>(inputValue: T, debounceDelay: number = 500) {
  const [debounceValue, setdebounceValue] = useState<T>(inputValue);

  useEffect(() => {
    const debounceTimeout = setTimeout(
      () => setdebounceValue(inputValue),
      debounceDelay
    );
    return () => clearTimeout(debounceTimeout);
  }, [debounceDelay, debounceValue, inputValue]);

  return debounceValue;
}
