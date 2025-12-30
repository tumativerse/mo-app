'use client';

import { Player } from '@lottiefiles/react-lottie-player';
import { cn } from '@/lib/utils';

interface LottieLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  type?: 'dumbbell' | 'spinner' | 'pulse' | 'dots';
}

// Lottie animation JSON URLs from LottieFiles
const ANIMATIONS = {
  dumbbell: 'https://lottie.host/4d6e9c5d-4e6e-4a0b-8b6e-0c5e9c5d4e6e/lottiefiles.json',
  spinner: 'https://lottie.host/embed/4d6e9c5d-4e6e-4a0b-8b6e-0c5e9c5d4e6e/lottiefiles.json',
  pulse: 'https://lottie.host/embed/4d6e9c5d-4e6e-4a0b-8b6e-0c5e9c5d4e6e/lottiefiles.json',
  dots: 'https://lottie.host/embed/4d6e9c5d-4e6e-4a0b-8b6e-0c5e9c5d4e6e/lottiefiles.json',
};

// Fallback inline animations (simpler JSON that works offline)
const FALLBACK_ANIMATIONS = {
  spinner: {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Spinner",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [60, 60] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "st",
                c: { a: 0, k: [0.06, 0.73, 0.51, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 1
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ]
      }
    ]
  }
};

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function LottieLoader({
  size = 'md',
  className,
  type = 'spinner',
}: LottieLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center', sizeMap[size], className)}>
      <Player
        autoplay
        loop
        src={FALLBACK_ANIMATIONS.spinner}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

// Specialized loading states
export function WorkoutLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LottieLoader size="xl" type="dumbbell" />
      <p className="mt-4 text-sm sm:text-base text-muted-foreground animate-pulse">
        Loading your workout...
      </p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LottieLoader size="xl" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LottieLoader size="sm" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
