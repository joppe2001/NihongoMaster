import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/hooks/useAudio';
import { HighlightableText } from '@/components/shared/HighlightableText';
import type { ErrorCorrectionExercise } from '@/services/exerciseGenerator';

interface ErrorCorrectionProps {
  exercise: ErrorCorrectionExercise;
  onAnswer: (correct: boolean) => void;
}

export function ErrorCorrection({ exercise, onAnswer }: ErrorCorrectionProps) {
  const [selected, setSelected] = useState<'has-error' | 'no-error' | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const hasError = exercise.errorType !== 'none';

  const handleSelect = (choice: 'has-error' | 'no-error') => {
    if (result) return;
    setSelected(choice);
    const isCorrect = (choice === 'has-error') === hasError;
    setResult(isCorrect ? 'correct' : 'incorrect');
    setShowExplanation(true);
    // Only auto-advance on correct
    if (isCorrect) {
      setTimeout(() => onAnswer(true), 2000);
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
      <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-4">Error Correction</p>
      <p className="text-sm text-text-secondary mb-6">Does this sentence have an error?</p>

      <div className="bg-bg-primary rounded-xl border border-border p-6 mb-6 max-w-lg mx-auto">
        <div className="flex items-start gap-2">
          <HighlightableText text={exercise.incorrectSentence} highlightId={`errcor-${exercise.incorrectSentence}`} className="text-xl text-text-primary font-medium flex-1" />
          <AudioButton text={exercise.incorrectSentence} showSlow highlightId={`errcor-${exercise.incorrectSentence}`} />
        </div>
      </div>

      <div className="flex gap-3 justify-center mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('has-error')}
          disabled={result !== null}
          className={cn(
            'px-6 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer',
            result && selected === 'has-error' && hasError ? 'border-matcha-500 bg-matcha-50 text-matcha-700' :
            result && selected === 'has-error' && !hasError ? 'border-sakura-500 bg-sakura-50 text-sakura-700' :
            'border-border hover:border-sakura-400 text-text-primary'
          )}
        >
          Has Error
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('no-error')}
          disabled={result !== null}
          className={cn(
            'px-6 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer',
            result && selected === 'no-error' && !hasError ? 'border-matcha-500 bg-matcha-50 text-matcha-700' :
            result && selected === 'no-error' && hasError ? 'border-sakura-500 bg-sakura-50 text-sakura-700' :
            'border-border hover:border-matcha-400 text-text-primary'
          )}
        >
          Correct as is
        </motion.button>
      </div>

      {showExplanation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 max-w-lg mx-auto text-left">
          {hasError && (
            <div className="bg-[var(--color-feedback-success-bg)] rounded-lg p-3 mb-2 border border-[var(--color-feedback-success-border)]">
              <p className="text-xs font-semibold text-[var(--color-feedback-success-text)] mb-1">Correct version:</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[var(--color-feedback-success-text)] jp-text font-medium">{exercise.correctSentence}</p>
                <AudioButton text={exercise.correctSentence} showSlow />
              </div>
            </div>
          )}
          <p className="text-sm text-text-secondary">{exercise.explanation}</p>
          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-bg-subtle text-text-tertiary">{exercise.errorType}</span>

          {/* Continue button for wrong answers */}
          {result === 'incorrect' && (
            <div className="mt-4">
              <button
                onClick={handleContinue}
                className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Continue <span className="text-[10px] opacity-60 ml-1">Enter</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
