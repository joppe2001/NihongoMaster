import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/hooks/useAudio';
import type { MatchingExercise } from '@/services/exerciseGenerator';

interface MatchingPairsProps {
  exercise: MatchingExercise;
  onAnswer: (correct: boolean) => void;
}

interface Card {
  id: string;
  text: string;
  pairId: number;
  type: 'jp' | 'en';
}

export function MatchingPairs({ exercise, onAnswer }: MatchingPairsProps) {
  const [cards] = useState<Card[]>(() => {
    const c: Card[] = [];
    exercise.pairs.forEach((p, i) => {
      c.push({ id: `jp-${i}`, text: p.japanese, pairId: i, type: 'jp' });
      c.push({ id: `en-${i}`, text: p.english, pairId: i, type: 'en' });
    });
    return c.sort(() => Math.random() - 0.5);
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const handleCardClick = useCallback((card: Card) => {
    if (matched.has(card.pairId)) return;

    if (!selected) {
      setSelected(card.id);
      setWrong(new Set());
      return;
    }

    const firstCard = cards.find((c) => c.id === selected);
    if (!firstCard || firstCard.id === card.id) {
      setSelected(card.id);
      return;
    }

    // Check if same type (both JP or both EN)
    if (firstCard.type === card.type) {
      setSelected(card.id);
      return;
    }

    // Check match
    if (firstCard.pairId === card.pairId) {
      setMatched((prev) => new Set([...prev, card.pairId]));
      setSelected(null);
    } else {
      setWrong(new Set([firstCard.id, card.id]));
      setMistakes((m) => m + 1);
      // Show hint: what each card actually pairs with
      const firstPair = exercise.pairs[firstCard.pairId];
      const secondPair = exercise.pairs[card.pairId];
      const hint1 = firstCard.type === 'jp'
        ? `${firstPair.japanese} = ${firstPair.english}`
        : `${firstPair.english} = ${firstPair.japanese}`;
      const hint2 = card.type === 'jp'
        ? `${secondPair.japanese} = ${secondPair.english}`
        : `${secondPair.english} = ${secondPair.japanese}`;
      setHintMessage(`${hint1}  ·  ${hint2}`);
      setTimeout(() => { setWrong(new Set()); setSelected(null); setHintMessage(null); }, 1800);
    }
  }, [selected, matched, cards]);

  // Check completion
  useEffect(() => {
    if (matched.size === exercise.pairs.length) {
      setTimeout(() => onAnswer(mistakes < exercise.pairs.length), 600);
    }
  }, [matched, exercise.pairs.length, mistakes, onAnswer]);

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-8">
      <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2 text-center">Match the Pairs</p>
      <p className="text-sm text-text-secondary mb-6 text-center">Tap a Japanese word, then its English meaning</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xl mx-auto">
        {cards.map((card) => {
          const isMatched = matched.has(card.pairId);
          const isSelected = selected === card.id;
          const isWrong = wrong.has(card.id);

          return (
            <motion.button
              key={card.id}
              whileTap={!isMatched ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card)}
              disabled={isMatched}
              className={cn(
                'p-3 rounded-xl border-2 transition-all cursor-pointer min-h-[60px] flex flex-col items-center justify-center gap-1 relative',
                isMatched ? 'border-matcha-400 bg-[var(--color-feedback-success-bg)] opacity-60' :
                isWrong ? 'border-sakura-500 bg-[var(--color-feedback-error-bg)] animate-pulse' :
                isSelected ? 'border-accent bg-accent/10' :
                'border-border bg-bg-primary hover:border-accent/50'
              )}
            >
              <span className={cn(
                'text-sm font-medium',
                card.type === 'jp' ? 'jp-text text-text-primary' : 'text-text-secondary',
                isMatched && 'line-through'
              )}>
                {card.text}
              </span>
              {card.type === 'jp' && !isMatched && (
                <span onClick={(e) => e.stopPropagation()}>
                  <AudioButton text={card.text} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Wrong match hint */}
      {hintMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 mx-auto max-w-xl bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)] rounded-lg px-3 py-2 text-center"
        >
          <p className="text-xs text-[var(--color-feedback-error-text)] jp-text">{hintMessage}</p>
        </motion.div>
      )}

      <p className="text-center text-[10px] text-text-tertiary mt-4">
        {matched.size}/{exercise.pairs.length} matched
        {mistakes > 0 && ` · ${mistakes} mistake${mistakes !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
}
