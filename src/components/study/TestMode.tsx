import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import type { StudyModeProps, StudyItem, TestQuestion, QuestionType } from './types';

// ─────────────────────────────────────────────────────────────
// Config Screen
// ─────────────────────────────────────────────────────────────

interface TestConfig {
  questionCount: number;
  includeTypes: QuestionType[];
}

function TestConfigScreen({
  maxQuestions,
  onStart,
  onBack,
}: {
  maxQuestions: number;
  onStart: (config: TestConfig) => void;
  onBack?: () => void;
}) {
  const [questionCount, setQuestionCount] = useState(Math.min(20, maxQuestions));
  const [includeTypes, setIncludeTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'written',
    'true_false',
  ]);

  const toggleType = (type: QuestionType) => {
    setIncludeTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Must have at least one
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary rounded-2xl border border-border p-8 max-w-md mx-auto"
    >
      <h3 className="text-lg font-bold text-text-primary mb-1">Practice Test</h3>
      <p className="text-sm text-text-secondary mb-6">Configure your test settings</p>

      {/* Question count */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
          Number of questions
        </label>
        <div className="flex gap-2">
          {[10, 20, maxQuestions].filter((v, i, a) => a.indexOf(v) === i && v <= maxQuestions).map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                questionCount === count
                  ? 'bg-accent text-white'
                  : 'bg-bg-primary border border-border text-text-secondary hover:text-text-primary'
              )}
            >
              {count === maxQuestions ? `All (${count})` : count}
            </button>
          ))}
        </div>
      </div>

      {/* Question types */}
      <div className="mb-8">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
          Question types
        </label>
        <div className="space-y-2">
          {[
            { type: 'multiple_choice' as const, label: 'Multiple Choice', desc: 'Pick from 4 options' },
            { type: 'written' as const, label: 'Written', desc: 'Type your answer' },
            { type: 'true_false' as const, label: 'True / False', desc: 'Judge if the pairing is correct' },
          ].map(({ type, label, desc }) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={cn(
                'w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3',
                includeTypes.includes(type)
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-border/80'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                includeTypes.includes(type)
                  ? 'border-accent bg-accent'
                  : 'border-border'
              )}>
                {includeTypes.includes(type) && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-[11px] text-text-tertiary">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => onStart({ questionCount, includeTypes })}
          className="flex-1 py-2.5 bg-accent text-white rounded-xl font-bold cursor-pointer"
        >
          Start Test
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Test Question Generation
// ─────────────────────────────────────────────────────────────

function generateQuestions(
  items: StudyItem[],
  config: TestConfig
): TestQuestion[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, config.questionCount);
  const questions: TestQuestion[] = [];
  const typeCycle = config.includeTypes;
  let typeIdx = 0;

  for (const item of shuffled) {
    const type = typeCycle[typeIdx % typeCycle.length];
    typeIdx++;

    const q: TestQuestion = {
      id: `${item.id}-${type}-${Math.random().toString(36).slice(2)}`,
      type,
      item,
    };

    if (type === 'multiple_choice') {
      const correctDef = item.definition;
      const distractors = items
        .filter((it) => it.id !== item.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((it) => it.definition);
      while (distractors.length < 3) distractors.push('—');
      q.choices = [correctDef, ...distractors].sort(() => Math.random() - 0.5);
      q.correctIndex = q.choices.indexOf(correctDef);
    }

    if (type === 'true_false') {
      const showCorrect = Math.random() > 0.4; // 60% correct, 40% false
      if (showCorrect) {
        q.statement = `${item.term} = ${item.definition}`;
        q.statementIsCorrect = true;
      } else {
        const wrongDef = items
          .filter((it) => it.id !== item.id)
          .sort(() => Math.random() - 0.5)[0]?.definition ?? 'incorrect';
        q.statement = `${item.term} = ${wrongDef}`;
        q.statementIsCorrect = false;
      }
    }

    questions.push(q);
  }

  return questions;
}

// ─────────────────────────────────────────────────────────────
// Main Test Mode
// ─────────────────────────────────────────────────────────────

export function TestMode({ items, onBack }: StudyModeProps) {
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start test
  const handleStart = useCallback((cfg: TestConfig) => {
    setConfig(cfg);
    setQuestions(generateQuestions(items, cfg));
    setCurrentIdx(0);
    setIsSubmitted(false);
    setStartTime(Date.now());
  }, [items]);

  // Config screen
  if (!config) {
    return <TestConfigScreen maxQuestions={items.length} onStart={handleStart} onBack={onBack} />;
  }

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx >= questions.length - 1;

  // Submit the entire test
  const submitTest = () => {
    // Grade all questions
    setQuestions((prev) =>
      prev.map((q) => {
        const graded = { ...q };
        if (q.type === 'multiple_choice') {
          graded.isCorrect = q.userAnswer === q.correctIndex;
        } else if (q.type === 'written') {
          const typed = (String(q.userAnswer ?? '')).trim().toLowerCase();
          const correct = q.item.definition.toLowerCase();
          const meanings = correct.split(',').map((m) => m.trim());
          graded.isCorrect = meanings.some(
            (m) => m === typed || typed.includes(m) || m.includes(typed)
          );
        } else if (q.type === 'true_false') {
          graded.isCorrect = q.userAnswer === q.statementIsCorrect;
        }
        return graded;
      })
    );
    setIsSubmitted(true);
  };

  // Answer the current question then move to next
  const answerAndNext = (answer: string | number | boolean) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIdx] = { ...updated[currentIdx], userAnswer: answer };
      return updated;
    });

    if (isLastQuestion) {
      // Will grade on submit
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  // ── Results Screen ──
  if (isSubmitted) {
    const correctCount = questions.filter((q) => q.isCorrect).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const missedQuestions = questions.filter((q) => !q.isCorrect);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center">
          <ResultIcon accuracy={accuracy} />
          <h3 className="text-2xl font-bold text-text-primary mb-1">Test Complete!</h3>
          <p className="text-sm text-text-secondary mb-6">
            {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
          </p>

          {/* Score circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-bg-muted)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={accuracy >= 80 ? 'var(--color-matcha-500)' : accuracy >= 60 ? 'var(--color-gold-500)' : 'var(--color-sakura-500)'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - accuracy / 100) }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-text-primary">{accuracy}%</span>
              <span className="text-[10px] text-text-secondary">{correctCount}/{questions.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div>
              <p className="text-2xl font-bold text-matcha-500">{correctCount}</p>
              <p className="text-xs text-text-secondary">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sakura-500">{missedQuestions.length}</p>
              <p className="text-xs text-text-secondary">Incorrect</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{questions.length}</p>
              <p className="text-xs text-text-secondary">Total</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer"
              >
                Done
              </button>
            )}
            {missedQuestions.length > 0 && (
              <button
                onClick={() => {
                  const missedItems = missedQuestions.map((q) => q.item);
                  const retakeConfig: TestConfig = {
                    questionCount: missedItems.length,
                    includeTypes: config.includeTypes,
                  };
                  setQuestions(generateQuestions(missedItems, retakeConfig));
                  setCurrentIdx(0);
                  setIsSubmitted(false);
                  setStartTime(Date.now());
                }}
                className="px-6 py-2.5 bg-sakura-500 text-white rounded-xl font-medium cursor-pointer"
              >
                Retake Missed ({missedQuestions.length})
              </button>
            )}
            <button
              onClick={() => {
                setConfig(null);
                setQuestions([]);
                setCurrentIdx(0);
                setIsSubmitted(false);
              }}
              className="px-6 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer"
            >
              New Test
            </button>
          </div>
        </div>

        {/* Missed items review */}
        {missedQuestions.length > 0 && (
          <div className="bg-bg-secondary rounded-2xl border border-border p-6">
            <h4 className="text-sm font-bold text-text-primary mb-3">Review Missed Items</h4>
            <div className="space-y-2">
              {missedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)]"
                >
                  <span className="text-lg font-semibold text-text-primary jp-text min-w-[80px]">
                    {q.item.term}
                  </span>
                  {q.item.termExtra && (
                    <span className="text-sm text-text-secondary jp-text min-w-[60px]">
                      {q.item.termExtra}
                    </span>
                  )}
                  <span className="text-sm text-text-primary flex-1">
                    {q.item.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ── Active Question ──
  if (!currentQ) return null;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-xs text-text-secondary hover:text-text-primary cursor-pointer">
            Back
          </button>
        )}
        <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-text-secondary tabular-nums">{currentIdx + 1}/{questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="bg-bg-secondary rounded-2xl border border-border p-10"
        >
          {/* Question type badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-bg-muted text-text-tertiary uppercase">
              {currentQ.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-text-tertiary">Q{currentIdx + 1}</span>
          </div>

          {/* ── Multiple Choice ── */}
          {currentQ.type === 'multiple_choice' && (
            <div className="text-center">
              <span className="text-4xl font-bold text-text-primary jp-text inline-block">
                {currentQ.item.term}
              </span>
              {currentQ.item.termExtra && (
                <p className="text-base text-text-secondary mt-1 jp-text">{currentQ.item.termExtra}</p>
              )}
              <p className="text-sm text-text-tertiary mt-3 mb-6">Choose the correct meaning</p>
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {currentQ.choices!.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => answerAndNext(i)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all cursor-pointer text-left',
                      currentQ.userAnswer === i
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    <span className="text-[10px] text-text-tertiary font-mono">{i + 1}</span>
                    <p className="text-sm font-medium text-text-primary mt-0.5">{choice}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Written ── */}
          {currentQ.type === 'written' && (
            <div className="text-center">
              <span className="text-4xl font-bold text-text-primary jp-text inline-block">
                {currentQ.item.term}
              </span>
              {currentQ.item.termExtra && (
                <p className="text-base text-text-secondary mt-1 jp-text">{currentQ.item.termExtra}</p>
              )}
              <p className="text-sm text-text-tertiary mt-3 mb-6">Type the meaning</p>
              <div className="max-w-sm mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  placeholder="Your answer..."
                  className="w-full text-center text-lg py-3 px-4 rounded-xl border-2 border-border focus:border-accent bg-bg-primary text-text-primary outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      answerAndNext((e.target as HTMLInputElement).value.trim());
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <p className="text-[10px] text-text-tertiary mt-2">Press Enter to submit</p>
              </div>
            </div>
          )}

          {/* ── True / False ── */}
          {currentQ.type === 'true_false' && (
            <div className="text-center">
              <p className="text-sm text-text-tertiary mb-4">Is this pairing correct?</p>
              <div className="bg-bg-primary rounded-xl p-6 mb-6 border border-border">
                <span className="text-3xl font-bold text-text-primary jp-text">
                  {currentQ.statement}
                </span>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => answerAndNext(true)}
                  className="px-8 py-3 rounded-xl border-2 border-matcha-400 bg-[var(--color-feedback-success-bg)] text-matcha-700 font-semibold cursor-pointer hover:bg-matcha-100 transition-colors"
                >
                  True
                </button>
                <button
                  onClick={() => answerAndNext(false)}
                  className="px-8 py-3 rounded-xl border-2 border-sakura-400 bg-[var(--color-feedback-error-bg)] text-sakura-700 font-semibold cursor-pointer hover:bg-sakura-100 transition-colors"
                >
                  False
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Submit button (appears on last question after answering) */}
      {isLastQuestion && currentQ.userAnswer !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={submitTest}
            className="px-10 py-3 bg-accent text-white rounded-xl font-bold cursor-pointer text-lg"
          >
            Submit Test
          </button>
        </motion.div>
      )}
    </div>
  );
}
