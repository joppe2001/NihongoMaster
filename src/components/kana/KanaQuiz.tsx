import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { QuizFeedback } from './QuizFeedback';
import { useUserStore } from '@/stores/userStore';
import { recordQuizAnswer, recordQuizSession } from '@/services/kanaMasteryService';
import { XP_REWARDS } from '@/lib/constants';

interface KanaItem {
  id: number;
  character: string;
  romaji: string;
  row_group: string;
  stroke_count: number;
}

export interface QuizState {
  questions: KanaItem[];
  currentIndex: number;
  correctCount: number;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
}

interface KanaQuizProps {
  state: QuizState;
  setState: (s: QuizState | null) => void;
}

export function KanaQuiz({ state, setState }: KanaQuizProps) {
  const { user, addXp } = useUserStore();
  const currentQuestion = state.questions[state.currentIndex];
  const isFinished = state.currentIndex >= state.questions.length;
  const inputRef = useRef<HTMLInputElement>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const sessionSaved = useRef(false);

  // Refocus input when moving to next question
  useEffect(() => {
    if (!state.showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.currentIndex, state.showResult]);

  const checkAnswer = useCallback(async () => {
    if (state.showResult || !currentQuestion) return;
    const isCorrect =
      state.userAnswer.toLowerCase().trim() === currentQuestion.romaji.toLowerCase();
    if (!isCorrect) {
      setShakeKey((prev) => prev + 1);
    }

    // Record mastery + XP
    if (user) {
      await recordQuizAnswer(user.id, currentQuestion.id, isCorrect);
      if (isCorrect) {
        setXpEarned((x) => x + XP_REWARDS.quiz_correct);
        setShowXpFloat(true);
        setTimeout(() => setShowXpFloat(false), 1200);
      }
    }

    setState({
      ...state,
      showResult: true,
      isCorrect,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
    });
  }, [state, currentQuestion, setState, user]);

  const nextQuestion = useCallback(() => {
    setState({
      ...state,
      currentIndex: state.currentIndex + 1,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
    });
  }, [state, setState]);

  // Save session XP on completion
  useEffect(() => {
    if (!isFinished || !user || sessionSaved.current) return;
    sessionSaved.current = true;
    async function save() {
      if (!user) return;
      const xp = await recordQuizSession(user.id, state.correctCount, state.questions.length);
      addXp(xp);
    }
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Quiz completion screen
  if (isFinished) {
    const accuracy = Math.round(
      (state.correctCount / state.questions.length) * 100
    );
    const getMessage = () => {
      if (accuracy === 100) return { text: 'Perfect!' };
      if (accuracy >= 80) return { text: 'Great job!' };
      if (accuracy >= 60) return { text: 'Good progress!' };
      return { text: 'Keep practicing!' };
    };
    const msg = getMessage();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-bg-secondary rounded-2xl border border-border p-12 text-center"
      >
        <ResultIcon accuracy={accuracy} />

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-text-primary mb-2"
        >
          {msg.text}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-text-secondary mb-8"
        >
          Quiz Complete
        </motion.p>

        {/* Animated stats */}
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
          <AnimatedStat
            value={state.correctCount}
            label="Correct"
            color="text-matcha-500"
            delay={0.5}
          />
          <AnimatedStat
            value={state.questions.length - state.correctCount}
            label="Missed"
            color="text-sakura-500"
            delay={0.6}
          />
          <AnimatedStat
            value={accuracy}
            label="Accuracy %"
            color="text-accent"
            delay={0.7}
          />
          <AnimatedStat
            value={xpEarned}
            label="XP Earned"
            color="text-gold-500"
            delay={0.8}
          />
        </div>

        {/* Progress bar */}
        <div className="max-w-sm mx-auto mb-8">
          <div className="h-3 bg-bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                accuracy >= 80
                  ? 'bg-matcha-500'
                  : accuracy >= 60
                    ? 'bg-gold-500'
                    : 'bg-sakura-500'
              )}
            />
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => setState(null)}
          className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer hover:opacity-90 transition-opacity"
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-bg-secondary rounded-2xl border border-border p-12 text-center pb-24"
        >
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8 max-w-xs mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: `${((state.currentIndex) / state.questions.length) * 100}%` }}
                animate={{ width: `${((state.currentIndex + 1) / state.questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-text-secondary font-medium">
              {state.currentIndex + 1}/{state.questions.length}
            </span>
          </div>

          {/* Character */}
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
            className="text-[100px] character-display text-text-primary leading-none inline-block"
          >
            {currentQuestion.character}
          </motion.span>

          {/* XP float */}
          <AnimatePresence>
            {showXpFloat && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -30 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="text-gold-500 font-bold text-sm"
              >
                +{XP_REWARDS.quiz_correct} XP
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-text-secondary mt-6 mb-5 text-sm">
            Type the romaji for this character
          </p>

          {/* Input with shake on incorrect */}
          <div className="max-w-xs mx-auto">
            <motion.div
              key={shakeKey}
              animate={
                shakeKey > 0
                  ? {
                      x: [0, -12, 12, -8, 8, -4, 4, 0],
                      transition: { duration: 0.5, ease: 'easeInOut' },
                    }
                  : {}
              }
            >
              <input
                ref={inputRef}
                type="text"
                value={state.userAnswer}
                onChange={(e) =>
                  setState({ ...state, userAnswer: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (state.showResult) {
                      nextQuestion();
                    } else if (state.userAnswer.trim()) {
                      checkAnswer();
                    }
                  }
                }}
                disabled={state.showResult}
                autoFocus
                className={cn(
                  'w-full text-center text-2xl py-3 px-4 rounded-xl border-2 outline-none transition-all duration-200',
                  state.showResult && state.isCorrect &&
                    'border-matcha-500 bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-text)]',
                  state.showResult && !state.isCorrect &&
                    'border-sakura-500 bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-text)]',
                  !state.showResult &&
                    'border-border focus:border-accent bg-bg-primary text-text-primary'
                )}
                placeholder="..."
              />
            </motion.div>
          </div>

          {/* Check button */}
          {!state.showResult && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={checkAnswer}
              disabled={!state.userAnswer.trim()}
              className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer hover:opacity-90 transition-opacity"
            >
              Check
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Inline feedback panel */}
      {state.showResult && (
        <QuizFeedback
          isVisible={state.showResult}
          isCorrect={state.isCorrect}
          correctAnswer={currentQuestion.romaji}
          onContinue={nextQuestion}
        />
      )}
    </div>
  );
}

function AnimatedStat({
  value,
  label,
  color,
  delay,
}: {
  value: number;
  label: string;
  color: string;
  delay: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <p className={`text-3xl font-bold ${color}`}>{displayValue}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </motion.div>
  );
}

export function createQuizState(allKana: KanaItem[], count = 20): QuizState {
  const shuffled = [...allKana].sort(() => Math.random() - 0.5).slice(0, count);
  return {
    questions: shuffled,
    currentIndex: 0,
    correctCount: 0,
    userAnswer: '',
    showResult: false,
    isCorrect: false,
  };
}
