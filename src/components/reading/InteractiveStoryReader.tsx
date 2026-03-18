import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ClickableWord } from './ClickableWord';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { ChevronRight } from '@/lib/icons';
import { AudioButton } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { awardXp, recordReviewSession } from '@/services/progressService';
import type { InteractiveStory, StorySentence } from '@/data/interactiveStories';

type Phase = 'reading' | 'quiz' | 'complete';

interface Props {
  story: InteractiveStory;
  onBack: () => void;
}

/** Detect if a sentence is dialogue (starts with open quote) */
function isDialogue(sentence: StorySentence): boolean {
  const first = sentence.words[0];
  if (!first) return false;
  return first.isPunct === true && (first.text === '「' || first.text === '『');
}

export function InteractiveStoryReader({ story, onBack }: Props) {
  const { user, addXp } = useUserStore();
  const [phase, setPhase] = useState<Phase>('reading');
  const [revealedSentences, setRevealedSentences] = useState(1);
  const [wordsRevealed, setWordsRevealed] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);

  const totalWords = story.sentences.reduce(
    (acc, s) => acc + s.words.filter((w) => !w.isPunct).length,
    0
  );

  const handleWordReveal = useCallback(() => {
    setWordsRevealed((n) => n + 1);
  }, []);

  const showNextSentence = () => {
    if (revealedSentences < story.sentences.length) {
      setRevealedSentences((n) => n + 1);
    }
  };

  const startQuiz = () => {
    setPhase('quiz');
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizCorrect(0);
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === story.questions[quizIndex].correctIndex) {
      setQuizCorrect((c) => c + 1);
    }
  };

  const nextQuestion = async () => {
    if (quizIndex < story.questions.length - 1) {
      setQuizIndex((i) => i + 1);
      setQuizAnswer(null);
    } else {
      const lookupRatio = totalWords > 0 ? 1 - wordsRevealed / totalWords : 1;
      const quizScore = story.questions.length > 0 ? quizCorrect / story.questions.length : 1;
      const totalXp = 20 + Math.round(quizScore * 30) + Math.round(lookupRatio * 20);

      if (user) {
        try {
          const accuracy = Math.round(quizScore * 100);
          await recordReviewSession(user.id, story.sentences.length, 0, 0, accuracy, totalXp);
          await awardXp(user.id, totalXp);
          addXp(totalXp);
        } catch { /* non-critical */ }
      }

      setPhase('complete');
    }
  };

  const allRevealed = revealedSentences >= story.sentences.length;
  const progressPct = (revealedSentences / story.sentences.length) * 100;

  // ─── Reading Phase ──────────────────────────────────────

  if (phase === 'reading') {
    return (
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary tabular-nums">
              {revealedSentences}/{story.sentences.length}
            </span>
            <div className="w-24 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {wordsRevealed > 0 && (
              <span className="text-[10px] text-text-tertiary">
                {wordsRevealed} looked up
              </span>
            )}
            <button
              onClick={onBack}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-muted text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* ═══ Book container ═══ */}
        <div className="relative bg-bg-secondary rounded-2xl border border-border overflow-hidden shadow-soft">
          {/* Book spine accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/20" />

          {/* Title banner */}
          <div className="px-8 pt-6 pb-4 border-b border-border/50">
            <h2 className="text-2xl font-bold text-text-primary jp-text tracking-wide">{story.titleJp}</h2>
            <p className="text-xs text-text-tertiary mt-1">{story.title}</p>
          </div>

          {/* Story body — the "page" */}
          <div className="px-8 py-6 min-h-[320px]">
            {/* Hint — only on first sentence */}
            {revealedSentences === 1 && (
              <p className="text-[10px] text-text-tertiary/60 mb-4 italic">
                Tap any word you don't know
              </p>
            )}

            <div className="space-y-1">
              {/* Past sentences — static, no animation */}
              {story.sentences.slice(0, revealedSentences - 1).map((sentence, si) => (
                <SentenceRow
                  key={si}
                  sentence={sentence}
                  index={si}
                  isCurrent={false}
                  onWordReveal={handleWordReveal}
                />
              ))}

              {/* Current sentence — animated entrance */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={revealedSentences - 1}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SentenceRow
                    sentence={story.sentences[revealedSentences - 1]}
                    index={revealedSentences - 1}
                    isCurrent={true}
                    onWordReveal={handleWordReveal}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Page footer — navigation */}
          <div className="px-8 py-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-[10px] text-text-tertiary">
              Page {revealedSentences} of {story.sentences.length}
            </p>

            {!allRevealed ? (
              <button
                onClick={showNextSentence}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent cursor-pointer hover:bg-accent/20 transition-colors"
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={startQuiz}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium gradient-accent text-white cursor-pointer shadow-sm"
              >
                Comprehension Quiz <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz Phase ─────────────────────────────────────────

  if (phase === 'quiz') {
    const q = story.questions[quizIndex];
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={quizIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-bg-secondary rounded-2xl border border-border p-8"
        >
          <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">
            Question {quizIndex + 1}/{story.questions.length}
          </p>
          <p className="text-lg font-semibold text-text-primary mb-6">{q.question}</p>

          <div className="space-y-2 mb-6">
            {q.options.map((opt, i) => {
              const isSelected = quizAnswer === i;
              const isCorrect = i === q.correctIndex;
              let cls = 'border-border hover:border-accent/50';
              if (quizAnswer !== null) {
                if (isCorrect) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                else cls = 'border-border opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleQuizAnswer(i)}
                  disabled={quizAnswer !== null}
                  className={cn('w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer', cls)}
                >
                  <span className="text-sm font-medium text-text-primary">{opt}</span>
                </button>
              );
            })}
          </div>

          {quizAnswer !== null && (
            <div className="text-center">
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer font-medium"
              >
                {quizIndex < story.questions.length - 1 ? 'Next question' : 'See results'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── Complete Phase ─────────────────────────────────────

  const quizAccuracy = story.questions.length > 0
    ? Math.round((quizCorrect / story.questions.length) * 100)
    : 100;
  const lookupPct = totalWords > 0
    ? Math.round(((totalWords - wordsRevealed) / totalWords) * 100)
    : 100;
  const lookupRatio = totalWords > 0 ? 1 - wordsRevealed / totalWords : 1;
  const quizScore = story.questions.length > 0 ? quizCorrect / story.questions.length : 1;
  const totalXp = 20 + Math.round(quizScore * 30) + Math.round(lookupRatio * 20);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="bg-bg-secondary rounded-2xl border border-border p-8 text-center"
    >
      <ResultIcon accuracy={quizAccuracy} />
      <h3 className="text-2xl font-bold text-gradient-accent mb-1">Story Complete!</h3>
      <p className="text-sm text-text-tertiary mb-6 jp-text">{story.titleJp}</p>

      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
        <div className="rounded-xl p-3 bg-bg-primary border border-border">
          <p className="text-2xl font-bold text-accent">{quizCorrect}/{story.questions.length}</p>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Quiz</p>
        </div>
        <div className="rounded-xl p-3 bg-bg-primary border border-border">
          <p className="text-2xl font-bold text-matcha-500">{lookupPct}%</p>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Read alone</p>
        </div>
        <div className="rounded-xl p-3 bg-bg-primary border border-border">
          <p className="text-2xl font-bold text-gold-500">+{totalXp}</p>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider">XP</p>
        </div>
      </div>

      {wordsRevealed > 0 && (
        <p className="text-xs text-text-tertiary mb-4">
          You looked up {wordsRevealed} of {totalWords} words.
          {wordsRevealed <= 3 && ' Impressive independence!'}
          {wordsRevealed > totalWords * 0.5 && ' Keep reading — it gets easier!'}
        </p>
      )}

      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="px-6 py-2.5 gradient-accent text-white rounded-xl font-medium cursor-pointer shadow-sm"
        >
          More Stories
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Sentence Row (extracted to avoid re-render issues) ───

function SentenceRow({ sentence, index, isCurrent, onWordReveal }: {
  sentence: StorySentence;
  index: number;
  isCurrent: boolean;
  onWordReveal: () => void;
}) {
  const dialogue = isDialogue(sentence);
  const fullText = sentence.words.map((w) => w.text).join('');

  return (
    <div className={cn('py-1.5', !isCurrent && 'opacity-60')}>
      {dialogue ? (
        <div className="flex items-start gap-2 ml-2">
          <div className="w-1 shrink-0 rounded-full bg-accent/30 self-stretch mt-1 mb-1" />
          <div className={cn(
            'rounded-xl rounded-tl-sm px-4 py-2 inline-block',
            isCurrent ? 'bg-accent/8' : 'bg-transparent'
          )}>
            <div className="flex items-start gap-1.5">
              <p className="text-lg leading-[2.2] jp-text">
                {sentence.words.map((word, wi) => (
                  <ClickableWord key={`${index}-${wi}`} word={word} onReveal={onWordReveal} />
                ))}
              </p>
              <span className="mt-1 shrink-0">
                <AudioButton text={fullText} showSlow />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-1.5 pl-2">
          <p className={cn(
            'text-lg leading-[2.2] jp-text flex-1',
            isCurrent ? 'text-text-primary' : 'text-text-secondary'
          )}>
            {sentence.words.map((word, wi) => (
              <ClickableWord key={`${index}-${wi}`} word={word} onReveal={onWordReveal} />
            ))}
          </p>
          <span className="mt-1 shrink-0">
            <AudioButton text={fullText} showSlow />
          </span>
        </div>
      )}

      {!isCurrent && (
        <p className="text-[11px] text-text-tertiary/50 mt-0.5 pl-2 italic">
          {sentence.meaning}
        </p>
      )}
    </div>
  );
}
