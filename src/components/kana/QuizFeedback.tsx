import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConfettiEffect } from './ConfettiEffect';

interface QuizFeedbackProps {
  isVisible: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  /** Optional extra explanation shown on wrong answers */
  explanation?: string;
  onContinue: () => void;
}

/**
 * Inline feedback panel that appears directly inside the lesson card.
 *
 * Previously used `position: fixed` which broke inside Framer Motion's
 * scale-transformed page wrapper. Now renders inline so it's always visible
 * right where the user is looking.
 */
export function QuizFeedback({
  isVisible,
  isCorrect,
  correctAnswer,
  explanation,
  onContinue,
}: QuizFeedbackProps) {
  // Auto-advance ONLY on correct answers
  useEffect(() => {
    if (isVisible && isCorrect) {
      const timer = setTimeout(onContinue, 1400);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isCorrect, onContinue]);

  // Enter/Space to continue after wrong answer
  useEffect(() => {
    if (!isVisible || isCorrect) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, isCorrect, onContinue]);

  if (!isVisible) return null;

  return (
    <>
      <ConfettiEffect trigger={isVisible && isCorrect} />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className={`mt-6 rounded-2xl border-2 p-5 ${
          isCorrect
            ? 'bg-[var(--color-feedback-success-bg)] border-[var(--color-feedback-success-border)]'
            : 'bg-[var(--color-feedback-error-bg)] border-[var(--color-feedback-error-border)]'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          {isCorrect ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.05 }}
              className="w-10 h-10 rounded-full bg-matcha-500 flex items-center justify-center shrink-0 mt-0.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="w-10 h-10 rounded-full bg-sakura-500 flex items-center justify-center shrink-0 mt-0.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.div>
          )}

          {/* Message */}
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-base font-bold ${
                isCorrect
                  ? 'text-[var(--color-feedback-success-text)]'
                  : 'text-[var(--color-feedback-error-text)]'
              }`}
            >
              {isCorrect ? '正解！ Correct!' : '不正解 Incorrect'}
            </motion.p>

            {!isCorrect && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
              >
                <p className="text-sm text-[var(--color-feedback-error-text)] mt-1">
                  Correct answer:{' '}
                  <strong className="text-base jp-text">{correctAnswer}</strong>
                </p>
                {explanation && (
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                    {explanation}
                  </p>
                )}
              </motion.div>
            )}

            {isCorrect && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-[var(--color-feedback-success-text)] mt-1"
              >
                Continuing in a moment…
              </motion.p>
            )}
          </div>

          {/* Continue button — only for wrong answers */}
          {!isCorrect && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22 }}
              onClick={onContinue}
              className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-white bg-sakura-500 hover:bg-sakura-600 active:scale-95 transition-all cursor-pointer shadow-sm text-sm"
            >
              Continue
              <span className="block text-[9px] font-normal opacity-60 -mt-0.5">Enter ↵</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </>
  );
}
