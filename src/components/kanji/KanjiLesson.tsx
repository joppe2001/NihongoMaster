import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { StrokeAnimation } from '@/components/kana/StrokeAnimation';
import { getStrokeData } from '@/data/strokeData';
import { QuizFeedback } from '@/components/kana/QuizFeedback';
import { AudioButton, useAudio } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { recordKanjiQuizAnswer, recordKanjiQuizSession } from '@/services/kanjiMasteryService';
import { matchesReading, katakanaToHiragana } from '@/lib/romajiToHiragana';
import { XP_REWARDS } from '@/lib/constants';
import type { KanjiDetail } from '@/services/kanjiService';

interface KanjiLessonProps {
  characters: KanjiDetail[];
  allKanji: KanjiDetail[];
  onComplete: () => void;
  onBack: () => void;
}

type StepType = 'teach' | 'meaning-quiz' | 'reading-quiz' | 'mc-quiz';

interface LessonStep {
  type: StepType;
  kanji: KanjiDetail;
  choices?: KanjiDetail[];
}

/**
 * Lenient meaning matching — accepts partial matches, synonyms, and flexible input.
 * Returns true if the user's answer reasonably matches any of the kanji's meanings.
 */
function meaningMatches(userAnswer: string, meanings: string[]): boolean {
  if (!userAnswer) return false;

  // Normalize all meanings: lowercase, strip punctuation, split multi-meaning strings
  const normalizedMeanings: string[] = [];
  for (const m of meanings) {
    const cleaned = m.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    normalizedMeanings.push(cleaned);
    // Also add individual words from multi-word meanings
    for (const word of cleaned.split(/\s+/)) {
      if (word.length >= 2) normalizedMeanings.push(word);
    }
  }

  // Exact match
  if (normalizedMeanings.includes(userAnswer)) return true;

  // User's answer is contained in a meaning, or a meaning is contained in the answer
  for (const m of normalizedMeanings) {
    if (m.includes(userAnswer) || userAnswer.includes(m)) return true;
  }

  // Fuzzy: allow off-by-one typos for answers >= 4 chars
  if (userAnswer.length >= 4) {
    for (const m of normalizedMeanings) {
      if (m.length >= 4 && levenshtein(userAnswer, m) <= 1) return true;
    }
  }

  return false;
}

/** Simple Levenshtein distance for typo tolerance */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function generateLessonPlan(chars: KanjiDetail[], allKanji: KanjiDetail[]): LessonStep[] {
  const steps: LessonStep[] = [];

  // Phase 1: Introduce + immediate drill
  for (let i = 0; i < chars.length; i++) {
    steps.push({ type: 'teach', kanji: chars[i] });

    // Alternate quiz types after each teach
    if (i % 3 === 0) {
      steps.push({ type: 'meaning-quiz', kanji: chars[i] });
    } else if (i % 3 === 1) {
      steps.push({ type: 'reading-quiz', kanji: chars[i] });
    } else {
      steps.push({
        type: 'mc-quiz',
        kanji: chars[i],
        choices: generateMCChoices(chars[i], allKanji),
      });
    }
  }

  // Phase 2: Reinforcement — all chars, all quiz types, shuffled
  const shuffled = [...chars].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i++) {
    if (i % 3 === 0) {
      steps.push({ type: 'reading-quiz', kanji: shuffled[i] });
    } else if (i % 3 === 1) {
      steps.push({
        type: 'mc-quiz',
        kanji: shuffled[i],
        choices: generateMCChoices(shuffled[i], allKanji),
      });
    } else {
      steps.push({ type: 'meaning-quiz', kanji: shuffled[i] });
    }
  }

  return steps;
}

function generateMCChoices(correct: KanjiDetail, allKanji: KanjiDetail[]): KanjiDetail[] {
  const distractors = allKanji
    .filter((k) => k.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}

export function KanjiLesson({ characters, allKanji, onComplete, onBack }: KanjiLessonProps) {
  const { user, addXp } = useUserStore();
  const { play } = useAudio();
  const [steps] = useState(() => generateLessonPlan(characters, allKanji));
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
      const timer = setTimeout(() => play(currentStep.kanji.character), 400);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, currentStep, play]);

  // Focus input on type quiz steps
  useEffect(() => {
    if ((currentStep?.type === 'meaning-quiz' || currentStep?.type === 'reading-quiz') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stepIndex, currentStep]);

  const advance = useCallback(() => {
    setStepIndex((i) => i + 1);
    setAnswer('');
    setSelectedMC(null);
    setResult(null);
  }, []);

  const checkMeaningAnswer = useCallback(async () => {
    if (!currentStep || result) return;
    const meanings = currentStep.kanji.meanings['en'] ?? [];
    const trimmed = answer.trim();
    // Accept the kanji character itself (IME auto-conversion)
    if (trimmed.includes(currentStep.kanji.character)) {
      setResult('correct');
      setTotalQuizSteps((t) => t + 1);
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
      if (user) await recordKanjiQuizAnswer(user.id, currentStep.kanji.id, true);
      return;
    }
    const userAnswer = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const isCorrect = meaningMatches(userAnswer, meanings);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
    if (user) {
      await recordKanjiQuizAnswer(user.id, currentStep.kanji.id, isCorrect);
    }
  }, [currentStep, answer, result, user]);

  const checkReadingAnswer = useCallback(async () => {
    if (!currentStep || result) return;
    const trimmed = answer.trim();
    const allReadings = [...currentStep.kanji.onReadings, ...currentStep.kanji.kunReadings];
    // Accept the kanji character itself (IME auto-converts hiragana → kanji)
    const isCorrect = trimmed.includes(currentStep.kanji.character) || matchesReading(trimmed, allReadings);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
    if (user) {
      await recordKanjiQuizAnswer(user.id, currentStep.kanji.id, isCorrect);
    }
  }, [currentStep, answer, result, user]);

  const handleMCSelect = useCallback(async (choiceIdx: number) => {
    if (!currentStep || result || !currentStep.choices) return;
    const chosen = currentStep.choices[choiceIdx];
    const isCorrect = chosen.id === currentStep.kanji.id;
    setSelectedMC(choiceIdx);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_REWARDS.quiz_correct);
    }
    if (user) {
      await recordKanjiQuizAnswer(user.id, currentStep.kanji.id, isCorrect);
    }
  }, [currentStep, result, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished || !currentStep) return;
      if (currentStep.type === 'teach' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
      }
      if (currentStep.type === 'meaning-quiz' || currentStep.type === 'reading-quiz') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (result) advance();
          else if (answer.trim()) {
            if (currentStep.type === 'meaning-quiz') checkMeaningAnswer();
            else checkReadingAnswer();
          }
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
  }, [isFinished, currentStep, result, answer, advance, checkMeaningAnswer, checkReadingAnswer, handleMCSelect]);

  // Save XP on completion
  useEffect(() => {
    if (!isFinished || !user || sessionSaved.current) return;
    sessionSaved.current = true;
    async function save() {
      if (!user) return;
      const xp = await recordKanjiQuizSession(user.id, correctCount, totalQuizSteps);
      addXp(xp);
    }
    save();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // ── Completion Screen ──
  if (isFinished) {
    const accuracy = totalQuizSteps > 0 ? Math.round((correctCount / totalQuizSteps) * 100) : 100;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Lesson Complete!</h3>
        <p className="text-sm text-text-secondary mb-6">
          You learned {characters.length} kanji
        </p>
        <div className="flex gap-3 justify-center mb-2">
          {characters.map((c) => (
            <span key={c.id} className="text-3xl jp-text text-text-primary bg-bg-primary rounded-xl px-3 py-2 border border-border">
              {c.character}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-secondary mb-6 jp-text">
          {characters.map((c) => (c.meanings['en'] ?? [])[0] ?? '').join(' · ')}
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

  const meanings = currentStep.kanji.meanings['en'] ?? [];
  const allReadings = [...currentStep.kanji.onReadings, ...currentStep.kanji.kunReadings];

  return (
    <div className="relative">
      {/* Top bar: back + progress */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 2L3.5 7l5 5" /></svg>
        </button>
        <div className="flex-1 h-2 bg-bg-subtle rounded-full overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] text-text-secondary shrink-0">{stepIndex + 1}/{steps.length}</span>
      </div>

      {/* Quit confirmation */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 max-w-sm mx-4 text-center">
              <p className="text-lg font-bold text-text-primary mb-2">Quit lesson?</p>
              <p className="text-sm text-text-secondary mb-6">Progress in this lesson will be lost. Characters already answered correctly are saved.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowQuitConfirm(false)} className="px-5 py-2 rounded-xl bg-bg-subtle text-text-primary font-medium cursor-pointer">Keep going</button>
                <button onClick={() => { setShowQuitConfirm(false); onBack(); }} className="px-5 py-2 rounded-xl bg-sakura-500 text-white font-medium cursor-pointer">Quit lesson</button>
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
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center">
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-4">New Kanji</p>

              {/* Stroke animation */}
              <div className="flex justify-center mb-4">
                {getStrokeData(currentStep.kanji.character) ? (
                  <StrokeAnimation character={currentStep.kanji.character} size={180} speed={Math.max(0.35, 0.7 - currentStep.kanji.strokeCount * 0.03)} loop={false} />
                ) : (
                  <span className="text-[120px] character-display text-text-primary leading-none jp-text">{currentStep.kanji.character}</span>
                )}
              </div>

              {/* Meanings */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-2xl font-bold text-accent">{meanings.join(', ')}</span>
                <AudioButton text={currentStep.kanji.character} showSlow />
              </div>

              {/* Readings — show hiragana alongside katakana for on'yomi */}
              <div className="flex justify-center gap-6 mb-3">
                {currentStep.kanji.onReadings.length > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] text-text-tertiary uppercase mb-1">On'yomi</p>
                    {currentStep.kanji.onReadings.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1 mr-2">
                        <span className="text-sm font-medium text-[var(--color-feedback-error-text)] jp-text">{r}</span>
                        <span className="text-xs text-text-tertiary jp-text">({katakanaToHiragana(r.replace(/[-.]/g, ''))})</span>
                      </span>
                    ))}
                  </div>
                )}
                {currentStep.kanji.kunReadings.length > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] text-text-tertiary uppercase mb-1">Kun'yomi</p>
                    <span className="text-sm font-medium text-accent jp-text">{currentStep.kanji.kunReadings.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Radical + Mnemonic */}
              <div className="text-xs text-text-secondary mb-2">
                Radical: <span className="jp-text font-medium text-text-primary">{currentStep.kanji.radical}</span>
                {currentStep.kanji.radicalNames.length > 0 && <span className="text-text-tertiary"> ({currentStep.kanji.radicalNames.join(', ')})</span>}
                <span className="mx-2 text-text-tertiary">·</span>
                {currentStep.kanji.strokeCount} strokes
              </div>

              {currentStep.kanji.mnemonic && (
                <p className="text-sm text-text-secondary italic mb-6 max-w-md mx-auto">
                  "{currentStep.kanji.mnemonic}"
                </p>
              )}

              <button onClick={advance} className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer">Got it</button>
              <p className="text-[10px] text-text-secondary/50 mt-2">Press Enter or Space</p>
            </div>
          )}

          {/* ── MEANING QUIZ ── */}
          {currentStep.type === 'meaning-quiz' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">What does this kanji mean?</p>
              <span className="text-[90px] character-display text-text-primary leading-none inline-block jp-text mb-2">{currentStep.kanji.character}</span>
              <p className="text-text-secondary text-sm mb-4">Type the English meaning</p>
              <div className="max-w-xs mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (result) advance(); else if (answer.trim()) checkMeaningAnswer(); } }}
                  disabled={result !== null}
                  autoFocus
                  className={cn(
                    'w-full text-center text-2xl py-3 px-4 rounded-xl border-2 outline-none transition-colors',
                    result === 'correct' && 'border-matcha-500 bg-matcha-50 text-matcha-700',
                    result === 'incorrect' && 'border-sakura-500 bg-sakura-50 text-sakura-700',
                    !result && 'border-border focus:border-accent bg-bg-primary text-text-primary'
                  )}
                  placeholder="meaning..."
                />
              </div>
              {!result && (
                <button onClick={checkMeaningAnswer} disabled={!answer.trim()} className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer">Check</button>
              )}
            </div>
          )}

          {/* ── READING QUIZ ── */}
          {currentStep.type === 'reading-quiz' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">How do you read this?</p>
              <span className="text-[90px] character-display text-text-primary leading-none inline-block jp-text mb-1">{currentStep.kanji.character}</span>
              <p className="text-sm text-accent font-medium mb-4">{meanings.join(', ')}</p>
              <p className="text-text-secondary text-sm mb-4">Type a reading (hiragana or romaji)</p>
              <div className="max-w-xs mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (result) advance(); else if (answer.trim()) checkReadingAnswer(); } }}
                  disabled={result !== null}
                  autoFocus
                  className={cn(
                    'w-full text-center text-2xl py-3 px-4 rounded-xl border-2 outline-none transition-colors',
                    result === 'correct' && 'border-matcha-500 bg-matcha-50 text-matcha-700',
                    result === 'incorrect' && 'border-sakura-500 bg-sakura-50 text-sakura-700',
                    !result && 'border-border focus:border-accent bg-bg-primary text-text-primary'
                  )}
                  placeholder="reading..."
                />
              </div>
              {!result && (
                <button onClick={checkReadingAnswer} disabled={!answer.trim()} className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer">Check</button>
              )}
            </div>
          )}

          {/* ── MC RECOGNITION QUIZ ── */}
          {currentStep.type === 'mc-quiz' && currentStep.choices && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">Which kanji means "{meanings[0]}"?</p>
              {allReadings.length > 0 && (
                <p className="text-sm text-accent font-medium mb-6 jp-text">{allReadings[0]}</p>
              )}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {currentStep.choices.map((choice, i) => {
                  const isSelected = selectedMC === i;
                  const isCorrectChoice = choice.id === currentStep.kanji.id;
                  let cls = 'border-border hover:border-accent hover:bg-accent/5';
                  if (result) {
                    if (isCorrectChoice) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                    else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                    else cls = 'border-border opacity-40';
                  }
                  return (
                    <button key={choice.id} onClick={() => handleMCSelect(i)} disabled={result !== null} className={cn('p-5 rounded-xl border-2 transition-all cursor-pointer', cls)}>
                      <span className="text-4xl jp-text character-display text-text-primary">{choice.character}</span>
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
          correctAnswer={`${currentStep.kanji.character} = ${meanings[0]}${allReadings.length > 0 ? ` (${katakanaToHiragana(allReadings[0].replace(/[-.]/g, ''))})` : ''}`}
          onContinue={advance}
        />
      )}
    </div>
  );
}
