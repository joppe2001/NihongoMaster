import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/hooks/useAudio';
import type { ConjugationExercise } from '@/services/exerciseGenerator';

interface ConjugationDrillProps {
  exercise: ConjugationExercise;
  onAnswer: (correct: boolean) => void;
}

export function ConjugationDrill({ exercise, onAnswer }: ConjugationDrillProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSelect = (idx: number) => {
    if (result) return;
    setSelected(idx);
    const isCorrect = exercise.options[idx] === exercise.correctAnswer;
    setResult(isCorrect ? 'correct' : 'incorrect');
    // Only auto-advance on correct
    if (isCorrect) {
      setTimeout(() => onAnswer(true), 800);
    }
  };

  const handleContinue = useCallback(() => {
    onAnswer(false);
  }, [onAnswer]);

  // Enter/Space to continue after wrong answer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (result === 'incorrect' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [result, handleContinue]);

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-8 text-center">
      <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-4">Conjugation Drill</p>
      <p className="text-sm text-text-secondary mb-2">Convert to <span className="font-bold text-text-primary">{exercise.targetFormLabel}</span></p>
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-4xl font-bold text-text-primary jp-text">{exercise.verb}</span>
        <span className="text-sm text-text-tertiary jp-text">{exercise.reading}</span>
        <AudioButton text={exercise.verb} showSlow />
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {exercise.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrectChoice = opt === exercise.correctAnswer;
          let cls = 'border-border hover:border-accent hover:bg-accent/5';
          if (result) {
            if (isCorrectChoice) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
            else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
            else cls = 'border-border opacity-40';
          }
          return (
            <motion.button
              key={i}
              whileTap={!result ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(i)}
              disabled={result !== null}
              className={cn('p-4 rounded-xl border-2 transition-all cursor-pointer', cls)}
            >
              <span className="text-lg jp-text font-medium text-text-primary">{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Wrong answer: show correct form + explanation + Continue */}
      {result === 'incorrect' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)] rounded-xl p-4 text-left"
        >
          <p className="text-sm font-semibold text-[var(--color-feedback-error-text)] mb-1">
            Incorrect — the correct {exercise.targetFormLabel} form is:
          </p>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-lg font-bold text-text-primary jp-text">{exercise.correctAnswer}</p>
            <AudioButton text={exercise.correctAnswer} showSlow />
          </div>
          <p className="text-xs text-text-secondary mb-3">
            <span className="jp-text">{exercise.verb}</span> ({exercise.reading}) → <span className="jp-text">{exercise.correctAnswer}</span> ({exercise.targetFormLabel})
          </p>
          <button
            onClick={handleContinue}
            className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium cursor-pointer"
          >
            Continue <span className="text-[10px] opacity-60 ml-1">Enter</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
