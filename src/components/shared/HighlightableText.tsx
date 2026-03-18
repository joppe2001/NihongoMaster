/**
 * HighlightableText — renders Japanese text with karaoke-style word highlighting.
 *
 * When an AudioButton with a matching highlightId plays audio,
 * this component highlights words one-by-one in sync with the speech.
 *
 * While highlighting is active, uses the timing segments from the TTS provider
 * (e.g. VOICEVOX accent phrases) to split the text — these match the audio perfectly.
 * When not highlighting, renders the text as-is.
 */
import { cn } from '@/lib/utils';
import { useHighlightStore } from '@/stores/highlightStore';

interface HighlightableTextProps {
  /** The Japanese text to render. */
  text: string;
  /** Must match the highlightId passed to the corresponding AudioButton. */
  highlightId: string;
  /** Additional CSS classes for the container span. */
  className?: string;
}

export function HighlightableText({
  text,
  highlightId,
  className = '',
}: HighlightableTextProps) {
  const activeId = useHighlightStore((s) => s.activeId);
  const currentIndex = useHighlightStore((s) => s.currentIndex);
  const timings = useHighlightStore((s) => s.timings);
  const isOurs = activeId === highlightId;

  // Not active — render plain text
  if (!isOurs || timings.length === 0) {
    return <span className={cn('jp-text', className)}>{text}</span>;
  }

  // Active — render using the timing segments from the TTS provider.
  // These segments match the audio perfectly (e.g. VOICEVOX accent phrases).
  return (
    <span className={cn('jp-text', className)}>
      {timings.map((timing, i) => {
        const isHighlighted = i === currentIndex;
        const isPast = i < currentIndex;

        return (
          <span
            key={`${i}-${timing.text}`}
            className={cn(
              'transition-all duration-150 ease-out rounded-sm',
              isHighlighted && 'bg-accent/25 text-accent shadow-[0_0_8px_rgba(var(--color-accent-rgb,99,102,241),0.3)] scale-[1.02] inline-block',
              isPast && 'opacity-60',
            )}
            style={isHighlighted ? { display: 'inline-block' } : undefined}
          >
            {timing.text}
          </span>
        );
      })}
    </span>
  );
}
