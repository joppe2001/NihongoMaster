import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { StrokeAnimation } from './StrokeAnimation';
import { getStrokeData } from '@/data/strokeData';
import { QuizFeedback } from './QuizFeedback';
import { AudioButton, useAudio } from '@/hooks/useAudio';
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

interface KanaLessonProps {
  /** The batch of characters to teach (typically 5 from one row) */
  characters: KanaItem[];
  /** All kana for generating distractors */
  allKana: KanaItem[];
  /** Called when lesson is complete */
  onComplete: () => void;
  /** Called when user confirms quitting mid-lesson */
  onBack: () => void;
}

// A lesson step can be: teach, type-quiz, mc-quiz
type StepType = 'teach' | 'type-quiz' | 'mc-quiz';

interface LessonStep {
  type: StepType;
  character: KanaItem;
  /** For MC quiz: the 4 choices */
  choices?: KanaItem[];
  /** For MC quiz where we show romaji → pick kana */
  promptIsRomaji?: boolean;
}

/**
 * Generate a lesson plan from a batch of characters:
 * 1. Teach each character (introduce phase)
 * 2. After every 2 characters taught, quiz on them (drill phase)
 * 3. Final round: quiz all characters mixed (reinforce phase)
 */
function generateLessonPlan(chars: KanaItem[], allKana: KanaItem[]): LessonStep[] {
  const steps: LessonStep[] = [];

  // Phase 1: Introduce + immediate drill
  for (let i = 0; i < chars.length; i++) {
    // Teach this character
    steps.push({ type: 'teach', character: chars[i] });

    // After each character, do a quick drill on it
    // Alternate between type and MC
    if (i % 2 === 0) {
      // Type quiz: show character → type romaji
      steps.push({ type: 'type-quiz', character: chars[i] });
    } else {
      // MC quiz: show romaji → pick the correct kana
      steps.push({
        type: 'mc-quiz',
        character: chars[i],
        choices: generateMCChoices(chars[i], allKana),
        promptIsRomaji: true,
      });
    }
  }

  // Phase 2: Reinforcement — quiz all characters again in random order
  const shuffled = [...chars].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i++) {
    if (i % 3 === 0) {
      // Type quiz
      steps.push({ type: 'type-quiz', character: shuffled[i] });
    } else if (i % 3 === 1) {
      // MC: show character → pick romaji meaning (we'll adapt)
      steps.push({
        type: 'mc-quiz',
        character: shuffled[i],
        choices: generateMCChoices(shuffled[i], allKana),
        promptIsRomaji: true,
      });
    } else {
      // MC: show romaji → pick kana
      steps.push({
        type: 'mc-quiz',
        character: shuffled[i],
        choices: generateMCChoices(shuffled[i], allKana),
        promptIsRomaji: false,
      });
    }
  }

  return steps;
}

function generateMCChoices(correct: KanaItem, allKana: KanaItem[]): KanaItem[] {
  const distractors = allKana
    .filter((k) => k.id !== correct.id && k.romaji !== correct.romaji)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}

export function KanaLesson({ characters, allKana, onComplete, onBack }: KanaLessonProps) {
  const { user, addXp } = useUserStore();
  const { play } = useAudio();
  const [steps] = useState(() => generateLessonPlan(characters, allKana));
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedMC, setSelectedMC] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuizSteps, setTotalQuizSteps] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionSaved = useRef(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const currentStep = steps[stepIndex];
  const isFinished = stepIndex >= steps.length;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  // Auto-play audio on teach steps
  useEffect(() => {
    if (currentStep?.type === 'teach') {
      // Small delay for the animation to start
      const timer = setTimeout(() => play(currentStep.character.character), 400);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, currentStep, play]);

  // Focus input on type-quiz steps
  useEffect(() => {
    if (currentStep?.type === 'type-quiz' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stepIndex, currentStep]);

  const advance = useCallback(() => {
    setStepIndex((i) => i + 1);
    setAnswer('');
    setSelectedMC(null);
    setResult(null);
  }, []);

  const checkTypeAnswer = useCallback(async () => {
    if (!currentStep || result) return;
    const isCorrect = answer.trim().toLowerCase() === currentStep.character.romaji.toLowerCase();
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
    if (user) {
      await recordQuizAnswer(user.id, currentStep.character.id, isCorrect);
    }
  }, [currentStep, answer, result, user]);

  const handleMCSelect = useCallback(async (choiceIdx: number) => {
    if (!currentStep || result || !currentStep.choices) return;
    const chosen = currentStep.choices[choiceIdx];
    const isCorrect = chosen.id === currentStep.character.id;
    setSelectedMC(choiceIdx);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
    if (user) {
      await recordQuizAnswer(user.id, currentStep.character.id, isCorrect);
    }
  }, [currentStep, result, user]);

  // Keyboard: Enter/Space to advance teach, Enter to check/next on quiz, 1-4 for MC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (!currentStep) return;

      if (currentStep.type === 'teach' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
      }
      if (currentStep.type === 'type-quiz') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (result) advance();
          else if (answer.trim()) checkTypeAnswer();
        }
      }
      if (currentStep.type === 'mc-quiz') {
        if (!result && e.key >= '1' && e.key <= '4') {
          e.preventDefault();
          handleMCSelect(parseInt(e.key) - 1);
        }
        if (result && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          advance();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFinished, currentStep, result, answer, advance, checkTypeAnswer, handleMCSelect]);

  // Save XP on completion
  useEffect(() => {
    if (!isFinished || !user || sessionSaved.current) return;
    sessionSaved.current = true;
    async function save() {
      if (!user) return;
      const xp = await recordQuizSession(user.id, correctCount, totalQuizSteps);
      addXp(xp);
    }
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // ── Completion screen ──
  if (isFinished) {
    const accuracy = totalQuizSteps > 0 ? Math.round((correctCount / totalQuizSteps) * 100) : 100;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Lesson Complete!</h3>
        <p className="text-sm text-text-secondary mb-6">
          You learned {characters.length} new characters
        </p>
        <div className="flex gap-3 justify-center mb-2">
          {characters.map((c) => (
            <span key={c.id} className="text-3xl jp-text text-text-primary bg-bg-primary rounded-xl px-3 py-1 border border-border">
              {c.character}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-secondary mb-6">
          {characters.map((c) => c.romaji).join(' · ')}
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">+{xpEarned}</p><p className="text-xs text-text-secondary">XP</p></div>
        </div>
        <button onClick={onComplete} className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer">
          Continue
        </button>
      </motion.div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="relative">
      {/* Top bar: back button + progress */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          title="Back"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 2L3.5 7l5 5" />
          </svg>
        </button>
        <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] text-text-secondary shrink-0">
          {stepIndex + 1}/{steps.length}
        </span>
      </div>

      {/* Quit confirmation overlay */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 max-w-sm mx-4 text-center"
            >
              <p className="text-lg font-bold text-text-primary mb-2">Quit lesson?</p>
              <p className="text-sm text-text-secondary mb-6">
                Your progress in this lesson will be lost. Characters you already answered correctly are saved.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="px-5 py-2 rounded-xl bg-bg-muted text-text-primary font-medium cursor-pointer hover:bg-bg-subtle transition-colors"
                >
                  Keep going
                </button>
                <button
                  onClick={() => { setShowQuitConfirm(false); onBack(); }}
                  className="px-5 py-2 rounded-xl bg-sakura-500 text-white font-medium cursor-pointer hover:bg-sakura-600 transition-colors"
                >
                  Quit lesson
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          {/* ── TEACH STEP ── */}
          {currentStep.type === 'teach' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-6">
                New Character
              </p>

              {/* Character with stroke animation */}
              <div className="flex justify-center mb-4">
                {getStrokeData(currentStep.character.character) ? (
                  <StrokeAnimation
                    character={currentStep.character.character}
                    size={200}
                    speed={0.6}
                    loop={false}
                  />
                ) : (
                  <span className="text-[140px] character-display text-text-primary leading-none">
                    {currentStep.character.character}
                  </span>
                )}
              </div>

              {/* Romaji + audio */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl font-bold text-accent">{currentStep.character.romaji}</span>
                <AudioButton text={currentStep.character.character} showSlow />
              </div>

              <p className="text-sm text-text-secondary mb-8">
                This is <strong className="text-text-primary jp-text">{currentStep.character.character}</strong>, pronounced "<strong>{currentStep.character.romaji}</strong>"
              </p>

              <button
                onClick={advance}
                className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer"
              >
                Got it
              </button>
              <p className="text-[10px] text-text-secondary/50 mt-2">Press Enter or Space</p>
            </div>
          )}

          {/* ── TYPE QUIZ STEP ── */}
          {currentStep.type === 'type-quiz' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-12 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-6">
                What sound does this make?
              </p>

              <span className="text-[100px] character-display text-text-primary leading-none inline-block jp-text">
                {currentStep.character.character}
              </span>

              <p className="text-text-secondary mt-4 mb-4 text-sm">Type the romaji</p>

              <div className="max-w-xs mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (result) advance();
                      else if (answer.trim()) checkTypeAnswer();
                    }
                  }}
                  disabled={result !== null}
                  autoFocus
                  className={cn(
                    'w-full text-center text-2xl py-3 px-4 rounded-xl border-2 outline-none transition-colors',
                    result === 'correct' && 'border-matcha-500 bg-matcha-50 text-matcha-700',
                    result === 'incorrect' && 'border-sakura-500 bg-sakura-50 text-sakura-700',
                    !result && 'border-border focus:border-accent bg-bg-primary text-text-primary'
                  )}
                  placeholder="..."
                />
              </div>

              {!result && (
                <button
                  onClick={checkTypeAnswer}
                  disabled={!answer.trim()}
                  className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer"
                >
                  Check
                </button>
              )}
            </div>
          )}

          {/* ── MC QUIZ STEP ── */}
          {currentStep.type === 'mc-quiz' && currentStep.choices && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-12 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-6">
                {currentStep.promptIsRomaji ? 'Choose the correct kana' : 'Which kana is this?'}
              </p>

              {/* Prompt */}
              {currentStep.promptIsRomaji ? (
                <span className="text-6xl font-bold text-accent inline-block mb-6">
                  {currentStep.character.romaji}
                </span>
              ) : (
                <span className="text-[80px] character-display text-text-primary leading-none inline-block jp-text mb-6">
                  {currentStep.character.character}
                </span>
              )}

              {/* Choices */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {currentStep.choices.map((choice, i) => {
                  const isSelected = selectedMC === i;
                  const isCorrectChoice = choice.id === currentStep.character.id;
                  let cls = 'border-border hover:border-accent hover:bg-accent/5';
                  if (result) {
                    if (isCorrectChoice) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                    else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                    else cls = 'border-border opacity-40';
                  }

                  // Show kana if prompt is romaji, show romaji if prompt is kana
                  const display = currentStep.promptIsRomaji ? choice.character : choice.romaji;
                  const displayClass = currentStep.promptIsRomaji ? 'text-4xl jp-text character-display' : 'text-2xl font-bold';

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleMCSelect(i)}
                      disabled={result !== null}
                      className={cn('p-5 rounded-xl border-2 transition-all cursor-pointer', cls)}
                    >
                      <span className={cn('text-text-primary', displayClass)}>{display}</span>
                      <span className="block text-[10px] text-text-secondary mt-1">{i + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Inline feedback panel */}
      {result && currentStep.type !== 'teach' && (
        <QuizFeedback
          isVisible={result !== null}
          isCorrect={result === 'correct'}
          correctAnswer={`${currentStep.character.character} = ${currentStep.character.romaji}`}
          onContinue={advance}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Row group batching: split kana by row for lesson selection
// ─────────────────────────────────────────────────────────────

export function getKanaRowGroups(kanaList: KanaItem[]): { group: string; label: string; chars: KanaItem[] }[] {
  const groups: Record<string, KanaItem[]> = {};
  for (const k of kanaList) {
    const g = groups[k.row_group] ?? [];
    groups[k.row_group] = [...g, k];
  }
  return Object.entries(groups).map(([group, chars]) => ({
    group,
    label: group.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    chars,
  }));
}
