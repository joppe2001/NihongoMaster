import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { QuizFeedback } from '@/components/kana/QuizFeedback';
import { FuriganaLine, FuriganaToggle } from '@/components/shared/FuriganaText';
import { AudioButton } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { awardXp, recordReviewSession } from '@/services/progressService';
import type { TranslationExercise } from '@/services/sentenceGenerator';

interface TranslationChallengeProps {
  exercises: TranslationExercise[];
  onComplete: () => void;
}

export function TranslationChallenge({ exercises, onComplete }: TranslationChallengeProps) {
  const { user, addXp } = useUserStore();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = exercises[index];
  const isFinished = index >= exercises.length;

  useEffect(() => {
    if (inputRef.current && !result) inputRef.current.focus();
  }, [index, result]);

  const checkAnswer = useCallback(() => {
    if (!current || result) return;
    const trimmed = answer.trim().toLowerCase();

    let isCorrect = false;
    if (current.direction === 'jp-to-en') {
      // English answer: lenient matching
      isCorrect = current.acceptedAnswers.some((a) => {
        const clean = a.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        return clean === trimmed || clean.includes(trimmed) || trimmed.includes(clean);
      });
    } else {
      // Japanese answer: exact match on kanji or reading
      isCorrect = current.acceptedAnswers.some((a) => a === answer.trim());
    }

    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + 10);
    }
  }, [current, answer, result]);

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
    setAnswer('');
    setResult(null);
  }, []);

  // Save XP on completion
  useEffect(() => {
    if (!isFinished || !user) return;
    const xp = correctCount * 10;
    const accuracy = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
    recordReviewSession(user.id, exercises.length, 0, 0, accuracy, xp).then(() => awardXp(user.id, xp));
    addXp(xp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (exercises.length === 0) {
    return <div className="text-center py-12 text-text-secondary">No exercises available.</div>;
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / exercises.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Translation Complete!</h3>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">+{xpEarned}</p><p className="text-xs text-text-secondary">XP</p></div>
        </div>
        <button onClick={onComplete} className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer">Done</button>
      </motion.div>
    );
  }

  if (!current) return null;

  const isJpToEn = current.direction === 'jp-to-en';

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-bg-secondary rounded-2xl border border-border p-8 pb-24"
        >
          {/* Progress + furigana toggle */}
          <div className="flex items-center gap-3 mb-6 max-w-sm mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((index + 1) / exercises.length) * 100}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{index + 1}/{exercises.length}</span>
            <FuriganaToggle show={showFurigana} onToggle={() => setShowFurigana((v) => !v)} />
          </div>

          {/* Direction label */}
          <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-4 text-center">
            {isJpToEn ? 'Translate to English' : 'Translate to Japanese'}
          </p>

          {/* Prompt */}
          <div className="text-center mb-6">
            {isJpToEn ? (
              <div className="inline-flex flex-col items-center gap-2">
                <div style={{ lineHeight: showFurigana ? 2.4 : 1.6 }}>
                  <FuriganaLine
                    japanese={current.japanese}
                    reading={current.reading}
                    show={showFurigana}
                    className="text-2xl font-bold text-text-primary"
                  />
                </div>
                <AudioButton text={current.japanese} showSlow highlightId={`trans-${current.japanese}`} />
              </div>
            ) : (
              <p className="text-2xl font-bold text-text-primary">{current.english}</p>
            )}
          </div>

          {/* Input */}
          <div className="max-w-md mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (result) advance();
                  else if (answer.trim()) checkAnswer();
                }
              }}
              disabled={result !== null}
              autoFocus
              className={cn(
                'w-full text-center text-xl py-3 px-4 rounded-xl border-2 outline-none transition-colors',
                !isJpToEn && 'jp-text',
                result === 'correct' && 'border-matcha-500 bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-text)]',
                result === 'incorrect' && 'border-sakura-500 bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-text)]',
                !result && 'border-border focus:border-accent bg-bg-primary text-text-primary'
              )}
              placeholder={isJpToEn ? 'English translation...' : 'Japanese...'}
              lang={isJpToEn ? 'en' : 'ja'}
            />
          </div>

          {!result && (
            <div className="text-center mt-5">
              <button
                onClick={checkAnswer}
                disabled={!answer.trim()}
                className="px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer"
              >
                Check
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {result && (
        <QuizFeedback
          isVisible={result !== null}
          isCorrect={result === 'correct'}
          correctAnswer={isJpToEn ? current.english : `${current.japanese} (${current.reading})`}
          onContinue={advance}
        />
      )}
    </div>
  );
}
