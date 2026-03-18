import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/hooks/useAudio';
import { useHighlightStore } from '@/stores/highlightStore';
import type { StoryWord } from '@/data/interactiveStories';

interface ClickableWordProps {
  word: StoryWord;
  onReveal?: () => void;
  /** Character offset of this word from the start of the sentence. */
  charOffset?: number;
  /** Highlight instance ID — must match the AudioButton's highlightId. */
  highlightId?: string;
}

const POS_LABELS: Record<string, string> = {
  noun: 'Noun',
  verb: 'Verb',
  adj: 'Adj',
  adv: 'Adv',
  particle: 'Particle',
  expr: 'Expression',
  counter: 'Counter',
  conj: 'Conjunction',
};

export function ClickableWord({ word, onReveal, charOffset, highlightId }: ClickableWordProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [wasRevealed, setWasRevealed] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Highlight state — check if this word's character range overlaps with
  // the current timing segment's character range.
  const isHighlighted = useHighlightStore((s) => {
    if (!highlightId || charOffset == null || s.activeId !== highlightId) return false;
    if (s.currentIndex < 0 || s.timings.length === 0) return false;

    // Character range of the current timing segment
    let segStart = 0;
    for (let i = 0; i < s.currentIndex; i++) {
      segStart += s.timings[i].text.length;
    }
    const segEnd = segStart + (s.timings[s.currentIndex]?.text.length ?? 0);

    // This word's character range
    const wordEnd = charOffset + word.text.length;

    // Overlap check: word overlaps if it starts before segment ends AND ends after segment starts
    return charOffset < segEnd && wordEnd > segStart;
  });

  // Punctuation — just render it
  if (word.isPunct) {
    return <span className="text-text-primary jp-text">{word.text}</span>;
  }

  const handleClick = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      if (!wasRevealed) {
        setWasRevealed(true);
        onReveal?.();
      }
    } else {
      setIsRevealed(false);
    }
  };

  // Close tooltip when clicking elsewhere
  useEffect(() => {
    if (!isRevealed) return;
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        wordRef.current && !wordRef.current.contains(e.target as Node)
      ) {
        setIsRevealed(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isRevealed]);

  return (
    <span className="relative inline-block">
      <span
        ref={wordRef}
        onClick={handleClick}
        className={cn(
          'jp-text cursor-pointer transition-all duration-150 rounded-sm px-[1px]',
          isHighlighted && 'bg-accent/25 text-accent shadow-[0_0_8px_rgba(var(--color-accent-rgb,99,102,241),0.3)] scale-[1.02]',
          !isHighlighted && wasRevealed && !isRevealed && 'bg-accent/5',
          !isHighlighted && (isRevealed
            ? 'bg-accent/15 text-accent'
            : 'text-text-primary hover:bg-accent/8')
        )}
      >
        {word.text}
      </span>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 bg-bg-secondary border border-border rounded-lg shadow-lg p-2.5 min-w-[140px] text-center"
          >
            {/* Arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-bg-secondary border-l border-t border-border" />

            {/* Reading (if kanji) */}
            {word.reading && (
              <p className="text-xs text-accent font-medium jp-text mb-0.5">{word.reading}</p>
            )}

            {/* Meaning */}
            <p className="text-sm font-medium text-text-primary">{word.meaning}</p>

            {/* Part of speech */}
            {word.pos && (
              <p className="text-[10px] text-text-tertiary mt-0.5">{POS_LABELS[word.pos] ?? word.pos}</p>
            )}

            {/* Audio */}
            <div className="flex justify-center mt-1.5" onClick={(e) => e.stopPropagation()}>
              <AudioButton text={word.text} showSlow />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
