import { cn } from '@/lib/utils';

interface MasteryIndicatorProps {
  level: number; // 0-5
  size?: 'sm' | 'md';
}

const DOT_COUNT = 5;

export function MasteryIndicator({ level, size = 'sm' }: MasteryIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';

  return (
    <div className={cn('flex items-center', gap)}>
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <div
          key={i}
          className={cn(
            dotSize,
            'rounded-full transition-colors',
            i < level
              ? level >= 5
                ? 'bg-gold-500'
                : level >= 3
                  ? 'bg-matcha-500'
                  : 'bg-accent'
              : 'bg-bg-muted'
          )}
        />
      ))}
    </div>
  );
}
