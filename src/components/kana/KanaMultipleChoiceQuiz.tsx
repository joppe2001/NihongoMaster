import { useState, useCallback, useEffect } from 'react';
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

interface Question {
  prompt: string; // romaji
  correct: KanaItem;
  choices: KanaItem[];
}

interface KanaMCQuizProps {
  allKana: KanaItem[];
  onComplete: () => void;
  questionCount?: number;
}

function generateQuestions(allKana: KanaItem[], count: number): Question[] {
  const shuffled = [...allKana].sort(() => Math.random() - 0.5);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const correct = shuffled[i];
    // Pick 3 distractors that have different romaji
    const distractors = allKana
      .filter((k) => k.id !== correct.id && k.romaji !== correct.romaji)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);

    questions.push({
      prompt: correct.romaji,
      correct,
      choices,
    });
  }

  return questions;
}

export function KanaMultipleChoiceQuiz({ allKana, onComplete, questionCount = 20 }: KanaMCQuizProps) {
  const { user, addXp } = useUserStore();
  const [questions] = useState(() => generateQuestions(allKana, questionCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);

  const isFinished = currentIndex >= questions.length;
  const currentQ = questions[currentIndex];

  const handleSelect = useCallback(async (choiceIndex: number) => {
    if (showResult || !currentQ || !user) return;

    const chosen = currentQ.choices[choiceIndex];
    const correct = chosen.id === currentQ.correct.id;

    setSelectedAnswer(choiceIndex);
    setShowResult(true);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
      setShowXpFloat(true);
      setTimeout(() => setShowXpFloat(false), 1200);
    }

    // Record to mastery DB
    await recordQuizAnswer(user.id, currentQ.correct.id, correct);
  }, [showResult, currentQ, user]);

  const nextQuestion = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  }, []);

  // Keyboard: 1-4 to select, Enter to continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (!showResult && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < (currentQ?.choices.length ?? 0)) {
          handleSelect(idx);
        }
      }
      if (showResult && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFinished, showResult, currentQ, handleSelect, nextQuestion]);

  // Award XP on completion
  useEffect(() => {
    if (!isFinished || !user) return;
    async function save() {
      if (!user) return;
      const xp = await recordQuizSession(user.id, correctCount, questions.length);
      addXp(xp);
    }
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (questions.length === 0) {
    return <div className="text-center py-12 text-text-secondary">Not enough kana for quiz.</div>;
  }

  // Completion screen
  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-secondary rounded-2xl border border-border p-12 text-center"
      >
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete!</h3>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-sakura-500">{questions.length - correctCount}</p><p className="text-xs text-text-secondary">Missed</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">+{xpEarned}</p><p className="text-xs text-text-secondary">XP Earned</p></div>
        </div>
        <button onClick={onComplete} className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer">
          Done
        </button>
      </motion.div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-bg-secondary rounded-2xl border border-border p-12 text-center pb-24"
        >
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8 max-w-xs mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{currentIndex + 1}/{questions.length}</span>
          </div>

          {/* Romaji prompt */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2"
          >
            <span className="text-6xl font-bold text-accent">{currentQ.prompt}</span>
          </motion.div>
          <p className="text-text-secondary text-sm mb-8">Choose the correct kana</p>

          {/* XP float animation */}
          <AnimatePresence>
            {showXpFloat && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute top-8 right-8 text-gold-500 font-bold text-lg"
              >
                +{XP_REWARDS.quiz_correct} XP
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 answer choices */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {currentQ.choices.map((choice, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrectChoice = choice.id === currentQ.correct.id;

              let btnClass = 'border-border hover:border-accent hover:bg-accent/5';
              if (showResult) {
                if (isCorrectChoice) btnClass = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                else if (isSelected && !isCorrectChoice) btnClass = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                else btnClass = 'border-border opacity-40';
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(i)}
                  disabled={showResult}
                  className={cn(
                    'p-5 rounded-xl border-2 transition-all cursor-pointer',
                    btnClass
                  )}
                >
                  <span className="text-4xl character-display text-text-primary jp-text">{choice.character}</span>
                  <span className="block text-[10px] text-text-secondary mt-1">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Inline feedback panel */}
      {showResult && (
        <QuizFeedback
          isVisible={showResult}
          isCorrect={isCorrect}
          correctAnswer={`${currentQ.correct.character} (${currentQ.correct.romaji})`}
          onContinue={nextQuestion}
        />
      )}
    </div>
  );
}
