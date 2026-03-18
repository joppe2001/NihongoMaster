import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConfettiEffect } from '@/components/kana/ConfettiEffect';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { AudioButton } from '@/hooks/useAudio';
import type { StudyModeProps, StudyItem, LearnItemState } from './types';

interface LearnItem {
  item: StudyItem;
  state: LearnItemState;
  correctStreak: number; // needs 2 correct (1 MC + 1 written) to master
  nextQuestionType: 'multiple_choice' | 'written';
}

/**
 * Quizlet-style adaptive Learn mode.
 * - Items start as "not_studied"
 * - First encounter: multiple choice
 * - If correct MC: mark "familiar", next time present as written
 * - If correct written: mark "mastered"
 * - Wrong answers re-queue the item
 * - Session ends when all items are mastered
 */
export function LearnMode({ items, onBack }: StudyModeProps) {
  const [learnItems, setLearnItems] = useState<LearnItem[]>([]);
  const [queue, setQueue] = useState<number[]>([]); // indices into learnItems
  const [queueIndex, setQueueIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const initial: LearnItem[] = items.map((item) => ({
      item,
      state: 'not_studied',
      correctStreak: 0,
      nextQuestionType: 'multiple_choice',
    }));
    setLearnItems(initial);
    // First round: all items
    const indices = initial.map((_, i) => i).sort(() => Math.random() - 0.5);
    setQueue(indices);
    setQueueIndex(0);
  }, [items]);

  // Generate MC choices when question changes
  const currentIdx = queue[queueIndex];
  const currentLearnItem = currentIdx !== undefined ? learnItems[currentIdx] : undefined;

  useEffect(() => {
    if (!currentLearnItem || currentLearnItem.nextQuestionType !== 'multiple_choice') return;

    const correctDef = currentLearnItem.item.definition;
    const otherDefs = items
      .filter((it) => it.id !== currentLearnItem.item.id)
      .map((it) => it.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Ensure exactly 4 choices, pad with variations if needed
    while (otherDefs.length < 3) {
      otherDefs.push(`(other ${otherDefs.length + 1})`);
    }

    const allChoices = [correctDef, ...otherDefs].sort(() => Math.random() - 0.5);
    setChoices(allChoices);
  }, [currentLearnItem, items, queueIndex]);

  // Focus input for written questions
  useEffect(() => {
    if (currentLearnItem?.nextQuestionType === 'written' && !result) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentLearnItem?.nextQuestionType, result, queueIndex]);

  const handleMCSelect = useCallback((choiceIdx: number) => {
    if (result || !currentLearnItem) return;
    setSelectedChoice(choiceIdx);
    const isCorrect = choices[choiceIdx] === currentLearnItem.item.definition;
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalAnswered((t) => t + 1);

    if (isCorrect) {
      setTotalCorrect((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [result, currentLearnItem, choices]);

  const handleWrittenSubmit = useCallback(() => {
    if (result || !currentLearnItem) return;
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed) return;

    const correct = currentLearnItem.item.definition.toLowerCase();
    // Accept if it matches any comma-separated meaning
    const meanings = correct.split(',').map((m) => m.trim());
    const isCorrect = meanings.some((m) => m === trimmed || trimmed.includes(m) || m.includes(trimmed));

    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalAnswered((t) => t + 1);

    if (isCorrect) {
      setTotalCorrect((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [result, currentLearnItem, answer]);

  const advance = useCallback(() => {
    if (!currentLearnItem || currentIdx === undefined) return;

    // Update the item's state based on result
    setLearnItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[currentIdx] };

      if (result === 'correct') {
        item.correctStreak += 1;
        if (item.correctStreak >= 2) {
          item.state = 'mastered';
        } else {
          item.state = 'familiar';
          item.nextQuestionType = 'written';
        }
      } else {
        // Wrong: reset to familiar with MC
        item.correctStreak = 0;
        item.state = 'familiar';
        item.nextQuestionType = 'multiple_choice';
      }

      updated[currentIdx] = item;
      return updated;
    });

    // Move to next in queue
    const nextQueueIdx = queueIndex + 1;

    if (nextQueueIdx >= queue.length) {
      // End of current round — check if we need another
      // Use a callback form to get latest state
      setLearnItems((prev) => {
        const unmasteredIndices = prev
          .map((li, i) => ({ li, i }))
          .filter(({ li }) => li.state !== 'mastered')
          .map(({ i }) => i);

        if (unmasteredIndices.length === 0) {
          setIsComplete(true);
        } else {
          // Start new round with unmastered items
          const shuffled = unmasteredIndices.sort(() => Math.random() - 0.5);
          setQueue(shuffled);
          setQueueIndex(0);
          setRound((r) => r + 1);
        }
        return prev;
      });
    } else {
      setQueueIndex(nextQueueIdx);
    }

    setResult(null);
    setSelectedChoice(null);
    setAnswer('');
  }, [currentLearnItem, currentIdx, result, queueIndex, queue.length]);

  // Keyboard: Enter to submit/advance, 1-4 for MC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (result) advance();
          else handleWrittenSubmit();
        }
        return;
      }

      if (currentLearnItem?.nextQuestionType === 'multiple_choice' && !result) {
        if (e.key >= '1' && e.key <= '4') {
          e.preventDefault();
          handleMCSelect(parseInt(e.key) - 1);
        }
      }

      if (result && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [result, advance, handleMCSelect, handleWrittenSubmit, currentLearnItem]);

  // Counts for progress bar
  const counts = learnItems.reduce(
    (acc, li) => {
      acc[li.state] += 1;
      return acc;
    },
    { not_studied: 0, familiar: 0, mastered: 0 } as Record<LearnItemState, number>
  );

  // ── Completion Screen ──
  if (isComplete) {
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-secondary rounded-2xl border border-border p-12 text-center"
      >
        <ConfettiEffect trigger={true} />
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-1">All items mastered!</h3>
        <p className="text-sm text-text-secondary mb-6">
          Completed in {round} round{round !== 1 ? 's' : ''} &middot; {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
          <div>
            <p className="text-3xl font-bold text-matcha-500">{items.length}</p>
            <p className="text-xs text-text-secondary">Mastered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">{accuracy}%</p>
            <p className="text-xs text-text-secondary">Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold-500">{totalAnswered}</p>
            <p className="text-xs text-text-secondary">Answers</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-bg-muted text-text-primary rounded-xl font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
            >
              Done
            </button>
          )}
          <button
            onClick={() => {
              // Reset and start over
              const initial: LearnItem[] = items.map((item) => ({
                item,
                state: 'not_studied' as const,
                correctStreak: 0,
                nextQuestionType: 'multiple_choice' as const,
              }));
              setLearnItems(initial);
              const indices = initial.map((_, i) => i).sort(() => Math.random() - 0.5);
              setQueue(indices);
              setQueueIndex(0);
              setRound(1);
              setStreak(0);
              setTotalCorrect(0);
              setTotalAnswered(0);
              setIsComplete(false);
              setResult(null);
            }}
            className="px-6 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer"
          >
            Learn Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentLearnItem) return null;

  const isMC = currentLearnItem.nextQuestionType === 'multiple_choice';

  return (
    <div className="space-y-4">
      {/* Progress bar — Quizlet-style tri-color */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-text-secondary hover:text-text-primary cursor-pointer">
                Back
              </button>
            )}
            <span className="text-text-tertiary">Round {round}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bg-muted" />
              <span className="text-text-tertiary">{counts.not_studied}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              <span className="text-gold-600">{counts.familiar}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-matcha-500" />
              <span className="text-matcha-600">{counts.mastered}</span>
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-bg-muted rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-matcha-500"
            animate={{ width: `${(counts.mastered / items.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="h-full bg-gold-500"
            animate={{ width: `${(counts.familiar / items.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak indicator */}
      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-xs font-semibold text-gold-500">
            {streak >= 10 ? 'UNSTOPPABLE ' : streak >= 5 ? 'ON FIRE ' : ''}
            {streak} streak!
          </span>
        </motion.div>
      )}

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${queueIndex}-${round}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-bg-secondary rounded-2xl border border-border p-10 text-center"
        >
          {/* Item state badge */}
          <div className="flex justify-center mb-4">
            <span className={cn(
              'px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
              currentLearnItem.state === 'not_studied' && 'bg-bg-muted text-text-tertiary',
              currentLearnItem.state === 'familiar' && 'bg-gold-500/10 text-gold-600',
            )}>
              {currentLearnItem.state === 'not_studied' ? 'New' : 'Learning'}
            </span>
          </div>

          {/* Term */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-text-primary jp-text leading-tight">
              {currentLearnItem.item.term}
            </span>
            <AudioButton text={currentLearnItem.item.term} showSlow />
          </div>
          {currentLearnItem.item.termExtra && (
            <p className="text-lg text-text-secondary mt-1 jp-text">
              {currentLearnItem.item.termExtra}
            </p>
          )}

          <p className="text-sm text-text-tertiary mt-4 mb-6">
            {isMC ? 'Choose the correct meaning' : 'Type the meaning'}
          </p>

          {/* Multiple Choice */}
          {isMC && (
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {choices.map((choice, i) => {
                const isSelected = selectedChoice === i;
                const isCorrectChoice = choice === currentLearnItem.item.definition;
                let cls = 'border-border hover:border-accent/50 hover:bg-bg-subtle';
                if (result) {
                  if (isCorrectChoice) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                  else if (isSelected && !isCorrectChoice) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                  else cls = 'border-border opacity-40';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleMCSelect(i)}
                    disabled={result !== null}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all cursor-pointer text-left',
                      cls
                    )}
                  >
                    <span className="text-[10px] text-text-tertiary font-mono">{i + 1}</span>
                    <p className="text-sm font-medium text-text-primary mt-0.5">{choice}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Written input */}
          {!isMC && (
            <div className="max-w-sm mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={result !== null}
                placeholder="Type your answer..."
                className={cn(
                  'w-full text-center text-lg py-3 px-4 rounded-xl border-2 outline-none transition-colors',
                  result === 'correct' && 'border-matcha-500 bg-[var(--color-feedback-success-bg)] text-matcha-700',
                  result === 'incorrect' && 'border-sakura-500 bg-[var(--color-feedback-error-bg)] text-sakura-700',
                  !result && 'border-border focus:border-accent bg-bg-primary text-text-primary'
                )}
              />
              {!result && (
                <button
                  onClick={handleWrittenSubmit}
                  disabled={!answer.trim()}
                  className="mt-4 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer"
                >
                  Check
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              {result === 'correct' ? (
                <div className="flex items-center justify-center gap-2 text-matcha-600">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="w-8 h-8 rounded-full bg-matcha-500 flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <span className="font-semibold">Correct!</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sakura-600 mb-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="w-8 h-8 rounded-full bg-sakura-500 flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </motion.div>
                    <span className="font-semibold">Not quite</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Correct answer: <strong className="text-text-primary">{currentLearnItem.item.definition}</strong>
                  </p>
                </div>
              )}
              <button
                onClick={advance}
                className="mt-4 px-8 py-2.5 bg-accent text-white rounded-xl font-medium cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Queue position */}
      <div className="text-center text-xs text-text-tertiary">
        {queueIndex + 1} of {queue.length} this round
        {isMC && !result && <span className="ml-3">Press 1-4 to choose</span>}
      </div>
    </div>
  );
}
