'use client';

import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';

import ArtifactCard from '@/components/ArtifactCard';
import CharacterFilter from '@/components/CharacterFilter';
import Hero from '@/components/Hero';
import { russoOne } from '@/lib/common';
import { cn } from '@/lib/utils';
import fetchArtifacts from '@/services/fetchArtifacts';
import fetchCharacters from '@/services/fetchCharacters';

export default function Home() {
  const {
    data: artifactData,
    error: artifactError,
    isPending: artifactPending,
  } = useQuery({
    queryFn: () => fetchArtifacts(),
    queryKey: ['artifacts'],
  });

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
        {artifactData && characterData && (
          <Fragment>
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
            <div className="gap-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 m-7.5 w-full">
              {artifactData.map((activeArtifact) => {
                const {
                  artifactDetails: { id },
                  userIDs,
                } = activeArtifact;
                const isDisabled = userIDs.length === 0;

                return (
                  <div key={id}>
                    <ArtifactCard
                      artifactData={activeArtifact}
                      disabled={isDisabled}
                    />
                  </div>
                );
              })}
            </div>
          </Fragment>
        )}
        {(artifactError || characterError) && (
          <div>
            {artifactError?.message}
            <br />
            {characterError?.message}
          </div>
        )}
        {(artifactPending || characterPending) && <div>Loading...</div>}
      </div>
    </Fragment>
  );
}
