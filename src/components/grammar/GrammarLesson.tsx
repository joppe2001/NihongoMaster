import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { QuizFeedback } from '@/components/kana/QuizFeedback';
import { FuriganaWord, FuriganaToggle } from '@/components/shared/FuriganaText';
import { AudioButton } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { recordGrammarQuizAnswer, recordGrammarQuizSession } from '@/services/grammarMasteryService';
import { XP_REWARDS } from '@/lib/constants';
import type { GrammarDetail } from '@/services/grammarService';

interface GrammarLessonProps {
  patterns: GrammarDetail[];
  allGrammar: GrammarDetail[];
  onComplete: () => void;
  onBack: () => void;
}

type StepType = 'teach' | 'meaning-quiz' | 'mc-quiz' | 'pattern-quiz';

interface LessonStep {
  type: StepType;
  grammar: GrammarDetail;
  choices?: GrammarDetail[];
}

function generateLessonPlan(patterns: GrammarDetail[], allGrammar: GrammarDetail[]): LessonStep[] {
  const steps: LessonStep[] = [];

  // Phase 1: Introduce + drill
  for (let i = 0; i < patterns.length; i++) {
    const g = patterns[i];
    steps.push({ type: 'teach', grammar: g });

    if (i % 3 === 0) {
      steps.push({ type: 'meaning-quiz', grammar: g });
    } else if (i % 3 === 1) {
      steps.push({ type: 'mc-quiz', grammar: g, choices: generateMCChoices(g, allGrammar) });
    } else {
      steps.push({ type: 'pattern-quiz', grammar: g });
    }

    // Interleave previous
    if (i >= 1 && i % 2 === 1) {
      const prev = patterns[i - 1];
      steps.push({ type: i % 4 < 2 ? 'mc-quiz' : 'meaning-quiz', grammar: prev, choices: generateMCChoices(prev, allGrammar) });
    }
  }

  // Phase 2: Reinforcement
  const shuffled = [...patterns].sort(() => Math.random() - 0.5);
  for (let round = 0; round < 2; round++) {
    const re = round === 1 ? [...shuffled].sort(() => Math.random() - 0.5) : shuffled;
    for (let i = 0; i < re.length; i++) {
      const g = re[i];
      const typeIdx = (i + round * 2) % 3;
      if (typeIdx === 0) steps.push({ type: 'meaning-quiz', grammar: g });
      else if (typeIdx === 1) steps.push({ type: 'mc-quiz', grammar: g, choices: generateMCChoices(g, allGrammar) });
      else steps.push({ type: 'pattern-quiz', grammar: g });
    }
  }

  return steps;
}

function generateMCChoices(correct: GrammarDetail, allGrammar: GrammarDetail[]): GrammarDetail[] {
  const distractors = allGrammar
    .filter((g) => g.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}

export function GrammarLesson({ patterns, allGrammar, onComplete, onBack }: GrammarLessonProps) {
  const { user, addXp } = useUserStore();
  const [steps] = useState(() => generateLessonPlan(patterns, allGrammar));
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedMC, setSelectedMC] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuizSteps, setTotalQuizSteps] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionSaved = useRef(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const currentStep = steps[stepIndex];
  const isFinished = stepIndex >= steps.length;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if ((currentStep?.type === 'meaning-quiz' || currentStep?.type === 'pattern-quiz') && inputRef.current) inputRef.current.focus();
  }, [stepIndex, currentStep]);

  const advance = useCallback(() => { setStepIndex((i) => i + 1); setAnswer(''); setSelectedMC(null); setResult(null); }, []);

  const checkMeaningAnswer = useCallback(async () => {
    if (!currentStep || result) return;
    const meaningEn = currentStep.grammar.meaning['en'] ?? '';
    const userAns = answer.trim().toLowerCase().replace(/[^a-z0-9\s/]/g, '').trim();
    const target = meaningEn.toLowerCase().replace(/[^a-z0-9\s/]/g, '').trim();
    // Lenient: contains, partial, or word match
    const isCorrect = target.includes(userAns) || userAns.includes(target) ||
      target.split(/[\s/]+/).some((w) => w.length >= 2 && userAns.includes(w)) ||
      userAns.split(/[\s/]+/).some((w) => w.length >= 2 && target.includes(w));
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) { setCorrectCount((c) => c + 1); setXpEarned((x) => x + XP_REWARDS.quiz_correct); }
    if (user) await recordGrammarQuizAnswer(user.id, currentStep.grammar.id, isCorrect);
  }, [currentStep, answer, result, user]);

  const checkPatternAnswer = useCallback(async () => {
    if (!currentStep || result) return;
    const pattern = currentStep.grammar.pattern.replace(/[〜～]/g, '').toLowerCase().trim();
    const userAns = answer.trim().replace(/[〜～]/g, '').toLowerCase().trim();
    const isCorrect = pattern.includes(userAns) || userAns.includes(pattern) || userAns === pattern;
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) { setCorrectCount((c) => c + 1); setXpEarned((x) => x + XP_REWARDS.quiz_correct); }
    if (user) await recordGrammarQuizAnswer(user.id, currentStep.grammar.id, isCorrect);
  }, [currentStep, answer, result, user]);

  const handleMCSelect = useCallback(async (choiceIdx: number) => {
    if (!currentStep || result || !currentStep.choices) return;
    const chosen = currentStep.choices[choiceIdx];
    const isCorrect = chosen.id === currentStep.grammar.id;
    setSelectedMC(choiceIdx);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTotalQuizSteps((t) => t + 1);
    if (isCorrect) { setCorrectCount((c) => c + 1); setXpEarned((x) => x + XP_REWARDS.quiz_correct); }
    if (user) await recordGrammarQuizAnswer(user.id, currentStep.grammar.id, isCorrect);
  }, [currentStep, result, user]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished || !currentStep) return;
      if (currentStep.type === 'teach' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(); }
      if (currentStep.type === 'meaning-quiz' || currentStep.type === 'pattern-quiz') {
        if (e.key === 'Enter') { e.preventDefault(); if (result) advance(); else if (answer.trim()) { currentStep.type === 'meaning-quiz' ? checkMeaningAnswer() : checkPatternAnswer(); } }
      }
      if (currentStep.type === 'mc-quiz') {
        if (!result && e.key >= '1' && e.key <= '4') { e.preventDefault(); handleMCSelect(parseInt(e.key) - 1); }
        if (result && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFinished, currentStep, result, answer, advance, checkMeaningAnswer, checkPatternAnswer, handleMCSelect]);

  useEffect(() => {
    if (!isFinished || !user || sessionSaved.current) return;
    sessionSaved.current = true;
    (async () => { if (!user) return; const xp = await recordGrammarQuizSession(user.id, correctCount, totalQuizSteps); addXp(xp); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (isFinished) {
    const accuracy = totalQuizSteps > 0 ? Math.round((correctCount / totalQuizSteps) * 100) : 100;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Lesson Complete!</h3>
        <p className="text-sm text-text-secondary mb-6">You learned {patterns.length} grammar patterns</p>
        <div className="flex gap-2 justify-center mb-2 flex-wrap">
          {patterns.map((g) => (
            <span key={g.id} className="text-sm jp-text text-text-primary bg-bg-primary rounded-lg px-2 py-1 border border-border">{g.pattern}</span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8 mt-6">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">+{xpEarned}</p><p className="text-xs text-text-secondary">XP</p></div>
        </div>
        <button onClick={onComplete} className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer">Continue</button>
      </motion.div>
    );
  }

  if (!currentStep) return null;
  const meaning = currentStep.grammar.meaning['en'] ?? '';
  const examples = currentStep.grammar.examples ?? [];

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowQuitConfirm(true)} className="w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 2L3.5 7l5 5" /></svg>
        </button>
        <div className="flex-1 h-2 bg-bg-subtle rounded-full overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] text-text-secondary shrink-0">{stepIndex + 1}/{steps.length}</span>
        <FuriganaToggle show={showFurigana} onToggle={() => setShowFurigana((v) => !v)} />
      </div>

      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-bg-secondary rounded-2xl border border-border shadow-2xl p-8 max-w-sm mx-4 text-center">
              <p className="text-lg font-bold text-text-primary mb-2">Quit lesson?</p>
              <p className="text-sm text-text-secondary mb-6">Progress will be lost. Correct answers are saved.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowQuitConfirm(false)} className="px-5 py-2 rounded-xl bg-bg-subtle text-text-primary font-medium cursor-pointer">Keep going</button>
                <button onClick={() => { setShowQuitConfirm(false); onBack(); }} className="px-5 py-2 rounded-xl bg-sakura-500 text-white font-medium cursor-pointer">Quit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={stepIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }}>

          {/* TEACH */}
          {currentStep.type === 'teach' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10">
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-4 text-center">New Pattern</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-3xl font-bold text-text-primary jp-text">{currentStep.grammar.pattern}</h3>
                <AudioButton text={currentStep.grammar.pattern} />
              </div>
              <p className="text-lg text-accent font-medium text-center mb-4">{meaning}</p>
              {currentStep.grammar.formation && (
                <p className="text-sm text-text-secondary text-center mb-4 bg-bg-primary rounded-lg p-3 border border-border-subtle">
                  <span className="text-[10px] text-text-tertiary uppercase block mb-1">Formation</span>
                  {currentStep.grammar.formation}
                </p>
              )}
              {examples.length > 0 && (
                <div className="space-y-3 mb-6">
                  {examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="bg-bg-primary rounded-lg p-3 border border-border-subtle">
                      {/* Teach step always shows furigana/reading — student is learning, not being tested */}
                      <div className="flex items-start gap-1.5">
                        <div style={{ lineHeight: ex.reading ? 2.2 : 1.5 }} className="flex-1">
                          <FuriganaWord
                            japanese={ex.japanese}
                            reading={ex.reading}
                            show={!!ex.reading}
                            className="text-base text-text-primary"
                          />
                        </div>
                        <AudioButton text={ex.japanese} showSlow />
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{ex.translations['en']}</p>
                    </div>
                  ))}
                </div>
              )}
              {currentStep.grammar.notes && (
                <p className="text-xs text-text-tertiary italic text-center mb-6">"{currentStep.grammar.notes}"</p>
              )}
              <div className="text-center">
                <button onClick={advance} className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer">Got it</button>
                <p className="text-[10px] text-text-secondary/50 mt-2">Press Enter or Space</p>
              </div>
            </div>
          )}

          {/* MEANING QUIZ */}
          {currentStep.type === 'meaning-quiz' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">What does this pattern mean?</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl font-bold text-text-primary jp-text">{currentStep.grammar.pattern}</span>
                <AudioButton text={currentStep.grammar.pattern} />
              </div>
              {examples.length > 0 && (
                <div className="mb-4" style={{ lineHeight: showFurigana && examples[0].reading ? 2.2 : 1.5 }}>
                  <FuriganaWord
                    japanese={examples[0].japanese}
                    reading={examples[0].reading}
                    show={showFurigana}
                    className="text-sm text-text-tertiary"
                  />
                </div>
              )}
              <div className="max-w-sm mx-auto">
                <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { if (result) advance(); else if (answer.trim()) checkMeaningAnswer(); } }} disabled={result !== null} autoFocus
                  className={cn('w-full text-center text-xl py-3 px-4 rounded-xl border-2 outline-none transition-colors', result === 'correct' && 'border-matcha-500 bg-matcha-50 text-matcha-700', result === 'incorrect' && 'border-sakura-500 bg-sakura-50 text-sakura-700', !result && 'border-border focus:border-accent bg-bg-primary text-text-primary')} placeholder="meaning..." />
              </div>
              {!result && <button onClick={checkMeaningAnswer} disabled={!answer.trim()} className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer">Check</button>}
            </div>
          )}

          {/* PATTERN QUIZ — given meaning + example, type the pattern */}
          {currentStep.type === 'pattern-quiz' && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">Which pattern means this?</p>
              <p className="text-xl font-bold text-accent mb-2">{meaning}</p>
              {examples.length > 0 && (
                <div className="mb-4" style={{ lineHeight: showFurigana && examples[0].reading ? 2.2 : 1.5 }}>
                  <FuriganaWord
                    japanese={examples[0].japanese}
                    reading={examples[0].reading}
                    show={showFurigana}
                    className="text-sm text-text-tertiary"
                  />
                </div>
              )}
              <p className="text-text-secondary text-sm mb-4">Type the grammar pattern</p>
              <div className="max-w-sm mx-auto">
                <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { if (result) advance(); else if (answer.trim()) checkPatternAnswer(); } }} disabled={result !== null} autoFocus
                  className={cn('w-full text-center text-xl py-3 px-4 rounded-xl border-2 outline-none transition-colors jp-text', result === 'correct' && 'border-matcha-500 bg-matcha-50 text-matcha-700', result === 'incorrect' && 'border-sakura-500 bg-sakura-50 text-sakura-700', !result && 'border-border focus:border-accent bg-bg-primary text-text-primary')} placeholder="pattern..." />
              </div>
              {!result && <button onClick={checkPatternAnswer} disabled={!answer.trim()} className="mt-6 px-8 py-2.5 bg-accent text-white rounded-xl font-medium disabled:opacity-30 cursor-pointer">Check</button>}
            </div>
          )}

          {/* MC QUIZ */}
          {currentStep.type === 'mc-quiz' && currentStep.choices && (
            <div className="bg-bg-secondary rounded-2xl border border-border p-10 text-center pb-24">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">Which pattern means:</p>
              <p className="text-lg font-bold text-accent mb-6">"{meaning}"</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {currentStep.choices.map((choice, i) => {
                  const isSelected = selectedMC === i;
                  const isCorrectChoice = choice.id === currentStep.grammar.id;
                  let cls = 'border-border hover:border-accent hover:bg-accent/5';
                  if (result) {
                    if (isCorrectChoice) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                    else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                    else cls = 'border-border opacity-40';
                  }
                  return (
                    <button key={choice.id} onClick={() => handleMCSelect(i)} disabled={result !== null} className={cn('p-4 rounded-xl border-2 transition-all cursor-pointer text-left', cls)}>
                      <span className="text-base jp-text font-medium text-text-primary">{choice.pattern}</span>
                      <span className="block text-[10px] text-text-secondary mt-1">{i + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {result && currentStep.type !== 'teach' && (
        <QuizFeedback isVisible={result !== null} isCorrect={result === 'correct'} correctAnswer={`${currentStep.grammar.pattern} = ${meaning}`} onContinue={advance} />
      )}
    </div>
  );
}
