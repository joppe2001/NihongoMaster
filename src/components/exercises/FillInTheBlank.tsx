import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { QuizFeedback } from '@/components/kana/QuizFeedback';
import { FuriganaLine, FuriganaToggle } from '@/components/shared/FuriganaText';
import { useUserStore } from '@/stores/userStore';
import { awardXp, recordReviewSession } from '@/services/progressService';
import type { FillBlankExercise } from '@/data/sentenceExercises';

interface FillInTheBlankProps {
  exercises: FillBlankExercise[];
  onComplete: () => void;
}

export function FillInTheBlank({ exercises, onComplete }: FillInTheBlankProps) {
  const { user, addXp } = useUserStore();
  const [index, setIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [currentBlankIdx, setCurrentBlankIdx] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);

  const current = exercises[index];
  const isFinished = index >= exercises.length;

  // Reset for new question
  useEffect(() => {
    if (!current) return;
    setSelectedAnswers(current.blanks.map(() => null));
    setResult(null);
    setCurrentBlankIdx(0);
  }, [index, current]);

  const handleOptionSelect = useCallback((option: string) => {
    if (result) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentBlankIdx] = option;
      return next;
    });
    // Auto-advance to next blank
    if (current && currentBlankIdx < current.blanks.length - 1) {
      setCurrentBlankIdx((i) => i + 1);
    }
  }, [result, currentBlankIdx, current]);

  const checkAnswer = useCallback(async () => {
    if (!current || result) return;
    const allCorrect = current.blanks.every((b, i) => selectedAnswers[i] === b.answer);
    setResult(allCorrect ? 'correct' : 'incorrect');
    if (allCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + 10);
    }
  }, [current, selectedAnswers, result]);

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
  }, []);

  // Keyboard: 1-4 for options, Enter to check/continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished || !current) return;
      if (!result && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const options = current.blanks[currentBlankIdx]?.options;
        if (options) {
          const idx = parseInt(e.key) - 1;
          if (idx < options.length) handleOptionSelect(options[idx]);
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (result) advance();
        else if (selectedAnswers.every((a) => a !== null)) checkAnswer();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFinished, current, result, currentBlankIdx, selectedAnswers, handleOptionSelect, checkAnswer, advance]);

  // Save XP on completion
  useEffect(() => {
    if (!isFinished || !user) return;
    async function save() {
      if (!user) return;
      const xp = correctCount * 10;
      const accuracy = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
      await recordReviewSession(user.id, exercises.length, 0, 0, accuracy, xp);
      await awardXp(user.id, xp);
      addXp(xp);
    }
    save();
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
        <h3 className="text-2xl font-bold text-text-primary mb-2">Practice Complete!</h3>
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

  // Split sentence and reading on ___ so each text part pairs with its reading
  const parts = current.sentence.split('___');
  const readingParts = current.reading ? current.reading.split('___') : parts;
  const allFilled = selectedAnswers.every((a) => a !== null);

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

          {/* Scenario */}
          {current.scenarioIcon && (
            <p className="text-center text-xs text-text-tertiary mb-4">{current.scenario}</p>
          )}

          {/* Sentence with blanks + furigana on each text part */}
          <div className="text-center mb-3" style={{ lineHeight: showFurigana ? 2.6 : 1.8 }}>
            <span className="text-2xl inline">
              {parts.map((part, i) => (
                <span key={i}>
                  <FuriganaLine
                    japanese={part}
                    reading={readingParts[i]}
                    show={showFurigana}
                    className="text-text-primary"
                  />
                  {i < parts.length - 1 && (
                    <button
                      onClick={() => setCurrentBlankIdx(i)}
                      className={cn(
                        'inline-block min-w-[60px] mx-1 px-2 py-0.5 rounded-lg border-2 transition-colors align-baseline',
                        selectedAnswers[i]
                          ? result === 'correct'
                            ? 'border-matcha-500 bg-matcha-50 text-matcha-700'
                            : result === 'incorrect' && selectedAnswers[i] !== current.blanks[i].answer
                              ? 'border-sakura-500 bg-sakura-50 text-sakura-700'
                              : result === 'incorrect'
                                ? 'border-matcha-500 bg-matcha-50 text-matcha-700'
                                : currentBlankIdx === i
                                  ? 'border-accent bg-accent/10 text-accent'
                                  : 'border-border bg-bg-primary text-text-primary'
                          : currentBlankIdx === i
                            ? 'border-accent border-dashed bg-accent/5'
                            : 'border-border border-dashed bg-bg-primary'
                      )}
                    >
                      <span className="jp-text">{selectedAnswers[i] ?? '\u00A0\u00A0\u00A0'}</span>
                    </button>
                  )}
                </span>
              ))}
            </span>
          </div>

          {/* English translation */}
          <p className="text-center text-sm text-text-secondary mb-6">{current.english}</p>

          {/* Options for current blank — with furigana on kanji options */}
          {!result && (() => {
            const blank = current.blanks[currentBlankIdx];
            if (!blank) return null;
            const readings = blank.optionReadings ?? {};
            return (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {blank.options.map((option, i) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-base font-medium border transition-colors cursor-pointer',
                      selectedAnswers[currentBlankIdx] === option
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-bg-primary text-text-primary hover:border-accent hover:bg-accent/5'
                    )}
                    style={{ lineHeight: showFurigana && readings[option] ? 2.4 : 1.4 }}
                  >
                    <FuriganaLine
                      japanese={option}
                      reading={readings[option]}
                      show={showFurigana}
                    />
                    <span className="text-[9px] text-text-secondary/50 ml-1">{i + 1}</span>
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Check button */}
          {!result && allFilled && (
            <div className="text-center">
              <button onClick={checkAnswer} className="px-8 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer">
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
          correctAnswer={current.blanks.map((b) => b.answer).join(', ')}
          onContinue={advance}
        />
      )}
    </div>
  );
}
