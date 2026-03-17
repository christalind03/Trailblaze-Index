import { ArrowDown, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { russoOne } from '@/lib/common';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen overflow-hidden px-5 relative"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 255, 255, 0.055) 0%, transparent 70%), var(--background)',
      }}
    >
      {/* Stars */}
      <div
        style={{
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      >
        {Array.from({ length: 100 }, (_, starIndex) => {
          const animationDuration = starIndex % 3;
          const animationDelay = (starIndex % 0.5) * 5;
          const starOpacity = (starIndex % 5) * 0.15;
          const xPosition = (starIndex * 5) % 100;
          const yPosition = (starIndex * 35) % 85;

          return (
            <div
              key={starIndex}
              style={{
                animation: `star-twinkle ${animationDuration}s ease-in-out infinite`,
                animationDelay: `${animationDelay}s`,
                background: `rgba(255, 255, 255, ${starOpacity})`,
                borderRadius: '50%',
                height: 1,
                left: `${xPosition}%`,
                position: 'absolute',
                top: `${yPosition}%`,
                width: 1,
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center max-w-96 text-center relative">
        <div className="bg-secondary border gap-1.5 inline-flex items-center px-3.5 py-1.5 rounded-full tracking-wide">
          <Ticket className="text-primary" size={11} />
          <span className="font-medium text-muted-foreground text-xs uppercase">
            Honkai: Star Rail
          </span>
        </div>
        <h1
          className={cn(
            'font-bold inline-block leading-none mt-7.5 mb-5 text-center tracking-widest',
            russoOne.className
          )}
          style={{
            fontSize: 'clamp(48px, 9vw, 72px)',
          }}
        >
          Trailblaze
          <br />
          <span className="text-primary">Index</span>
        </h1>
        <p className="text-muted-foreground text-pretty text-sm tracking-wide">
          Know what to keep. Discard the rest.
          <br />
          Build your <span className="font-medium">Honkai: Star Rail</span>{' '}
          roster with confidence.
        </p>
        <Button
          className="px-7.5 py-5.5 mt-12 shadow-(color:--primary) shadow-lg/35 hover:cursor-pointer"
          size="lg"
        >
          Browse Relic Sets
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute animate-bounce bottom-7 flex flex-col gap-1.5 items-center text-muted-foreground">
        <span className="text-xs uppercase">Scroll</span>
        <ArrowDown size={14} />
      </div>
    </div>
  );
}
