'use client';

import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';

import CharacterFilter from '@/components/CharacterFilter';
import Hero from '@/components/Hero';
import { russoOne } from '@/lib/common';
import { cn } from '@/lib/utils';
import fetchCharacters from '@/services/fetchCharacters';

export default function Home() {
  const {
    data: characterData,
    error: characterError,
    isPending: characterPending,
  } = useQuery({
    queryFn: () => fetchCharacters(),
    queryKey: ['characters'],
  });

  return (
    <Fragment>
      <Hero />
      <div className="flex flex-col items-center justify-center pb-15 pt-5 px-5">
        {characterData && (
          <div className="flex flex-col gap-1.5 max-w-[475px] w-full">
            <span
              className={cn(
                'font-bold text-muted-foreground text-xl tracking-widest',
                russoOne.className
              )}
            >
              Relic Sets
            </span>
            <CharacterFilter characterList={characterData} />
          </div>
        )}
        {characterError && <div>{characterError.message}</div>}
        {characterPending && <div>Loading...</div>}
      </div>
    </Fragment>
  );
}
