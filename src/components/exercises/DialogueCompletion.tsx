import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/hooks/useAudio';
import type { DialogueExercise } from '@/services/exerciseGenerator';

interface DialogueCompletionProps {
  exercise: DialogueExercise;
  onAnswer: (correct: boolean) => void;
}

export function DialogueCompletion({ exercise, onAnswer }: DialogueCompletionProps) {
  const [currentBlank, setCurrentBlank] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(exercise.exchanges.map(() => null));
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[]>(exercise.exchanges.map(() => null));
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  const blanks = exercise.exchanges.map((ex, i) => ({ ex, i })).filter(({ ex }) => ex.isBlank);
  const currentBlankInfo = blanks[currentBlank];

  const handleSelect = (option: string) => {
    if (!currentBlankInfo || done || waitingForContinue) return;
    const { ex, i } = currentBlankInfo;
    const isCorrect = option === ex.answer;

    const newAnswers = [...answers];
    newAnswers[i] = option;
    setAnswers(newAnswers);

    const newResults = [...results];
    newResults[i] = isCorrect ? 'correct' : 'incorrect';
    setResults(newResults);

    if (isCorrect) setCorrectCount((c) => c + 1);

    if (isCorrect) {
      // Auto-advance on correct
      if (currentBlank < blanks.length - 1) {
        setTimeout(() => setCurrentBlank((c) => c + 1), 600);
      } else {
        setTimeout(() => {
          setDone(true);
          onAnswer(correctCount + 1 >= blanks.length / 2);
        }, 800);
      }
    } else {
      // Wrong: stop and wait for Continue
      setWaitingForContinue(true);
    }
  };

  const handleContinue = useCallback(() => {
    setWaitingForContinue(false);
    if (currentBlank < blanks.length - 1) {
      setCurrentBlank((c) => c + 1);
    } else {
      setDone(true);
      onAnswer(correctCount >= blanks.length / 2);
    }
  }, [currentBlank, blanks.length, correctCount, onAnswer]);

  // Enter/Space to continue after wrong answer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (waitingForContinue && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [waitingForContinue, handleContinue]);

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-8">
      <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2 text-center">Dialogue</p>
      <p className="text-sm text-text-secondary mb-6 text-center">{exercise.context}</p>

      <div className="max-w-lg mx-auto space-y-3 mb-6">
        {exercise.exchanges.map((ex, i) => {
          const isBlank = ex.isBlank;
          const answered = answers[i];
          const isYou = ex.speaker === 'You';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn('flex', isYou ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5',
                isYou
                  ? 'bg-accent/10 border border-accent/20 rounded-br-sm'
                  : 'bg-bg-primary border border-border rounded-bl-sm'
              )}>
                <p className="text-[10px] text-text-tertiary mb-0.5">{ex.speaker}</p>
                {isBlank && !answered ? (
                  <p className="text-base text-accent font-medium">___</p>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <p className={cn(
                      'text-base jp-text',
                      results[i] === 'correct' ? 'text-matcha-600' :
                      results[i] === 'incorrect' ? 'text-sakura-600 line-through' :
                      'text-text-primary'
                    )}>
                      {answered ?? ex.text}
                    </p>
                    {(answered ?? ex.text) && <AudioButton text={(answered ?? ex.text) as string} />}
                  </div>
                )}
                {/* Show correct answer inline when wrong */}
                {results[i] === 'incorrect' && ex.answer && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-sm text-matcha-600 jp-text font-medium">{ex.answer}</p>
                    <AudioButton text={ex.answer} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Options for current blank */}
      {currentBlankInfo && !done && !waitingForContinue && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto"
          >
            {currentBlankInfo.ex.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                className="p-3 rounded-xl border border-border bg-bg-primary hover:border-accent hover:bg-accent/5 transition-all cursor-pointer text-left"
              >
                <span className="text-sm jp-text text-text-primary">{option}</span>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Wrong answer feedback + Continue button */}
      {waitingForContinue && currentBlankInfo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)] rounded-xl p-4"
        >
          <p className="text-sm font-semibold text-[var(--color-feedback-error-text)] mb-1">
            Incorrect — the correct response was:
          </p>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-base font-bold text-text-primary jp-text">{currentBlankInfo.ex.answer}</p>
            {currentBlankInfo.ex.answer && <AudioButton text={currentBlankInfo.ex.answer} showSlow />}
          </div>
          <button
            onClick={handleContinue}
            className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium cursor-pointer"
          >
            Continue <span className="text-[10px] opacity-60 ml-1">Enter</span>
          </button>
        </motion.div>
      )}

      {done && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-text-secondary mt-4">
          {correctCount}/{blanks.length} correct
        </motion.p>
      )}
    </div>
  );
}
