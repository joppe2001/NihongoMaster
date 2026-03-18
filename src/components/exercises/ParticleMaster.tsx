import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import { FuriganaLine, FuriganaToggle } from '@/components/shared/FuriganaText';
import { AudioButton } from '@/hooks/useAudio';
import { useUserStore } from '@/stores/userStore';
import { awardXp, recordReviewSession } from '@/services/progressService';
import type { ParticleDrill } from '@/services/sentenceGenerator';

interface ParticleMasterProps {
  exercises: ParticleDrill[];
  onComplete: () => void;
}

export function ParticleMaster({ exercises, onComplete }: ParticleMasterProps) {
  const { user, addXp } = useUserStore();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);

  const current = exercises[index];
  const isFinished = index >= exercises.length;

  const handleSelect = useCallback((option: string) => {
    if (result) return;
    setSelected(option);
    const isCorrect = option === current.blankParticle;
    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    // Only auto-advance on correct; wrong answers require manual Continue
    if (isCorrect) {
      setTimeout(() => {
        setIndex((i) => i + 1);
        setSelected(null);
        setResult(null);
      }, 600);
    }
  }, [result, current]);

  const handleContinue = useCallback(() => {
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
  }, []);

  // Keyboard: 1-4 for options, Enter/Space to continue after wrong answer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFinished || !current) return;
      // Continue after wrong answer
      if (result === 'incorrect' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleContinue();
        return;
      }
      if (result) return;
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < current.options.length) handleSelect(current.options[idx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFinished, current, result, handleSelect, handleContinue]);

  // Save XP
  useEffect(() => {
    if (!isFinished || !user) return;
    const xp = correctCount * 10;
    const accuracy = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
    recordReviewSession(user.id, exercises.length, 0, 0, accuracy, xp).then(() => awardXp(user.id, xp));
    addXp(xp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (exercises.length === 0) {
    return <div className="text-center py-12 text-text-secondary">No particle exercises available. Learn more vocabulary first.</div>;
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / exercises.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
        <ResultIcon accuracy={accuracy} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">Particle Master Complete!</h3>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
          <div><p className="text-3xl font-bold text-matcha-500">{correctCount}/{exercises.length}</p><p className="text-xs text-text-secondary">Correct</p></div>
          <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
          <div><p className="text-3xl font-bold text-gold-500">{bestStreak}</p><p className="text-xs text-text-secondary">Best Streak</p></div>
        </div>
        <button onClick={onComplete} className="px-6 py-2 bg-accent text-white rounded-lg cursor-pointer">Done</button>
      </motion.div>
    );
  }

  if (!current) return null;

  // Split sentence on ___
  const parts = current.sentence.split('___');
  const readingParts = current.reading.split('___');

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-bg-secondary rounded-2xl border border-border p-8"
        >
          {/* Top bar */}
          <div className="flex items-center gap-3 mb-6 max-w-sm mx-auto">
            <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((index + 1) / exercises.length) * 100}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{index + 1}/{exercises.length}</span>
            {streak >= 3 && (
              <span className="text-xs font-semibold text-gold-500">{streak}x</span>
            )}
            <FuriganaToggle show={showFurigana} onToggle={() => setShowFurigana((v) => !v)} />
          </div>

          <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-4 text-center">
            Choose the correct particle
          </p>

          {/* Sentence with blank */}
          <div className="text-center mb-3" style={{ lineHeight: showFurigana ? 2.6 : 1.8 }}>
            <span className="text-2xl">
              {parts.map((part, i) => (
                <span key={i}>
                  <FuriganaLine
                    japanese={part}
                    reading={readingParts[i]}
                    show={showFurigana}
                    className="text-text-primary"
                  />
                  {i < parts.length - 1 && (
                    <span className={cn(
                      'inline-block min-w-[40px] mx-0.5 px-2 py-0.5 rounded-lg border-2 text-center align-baseline',
                      selected
                        ? result === 'correct'
                          ? 'border-matcha-500 bg-matcha-50 text-matcha-700'
                          : 'border-sakura-500 bg-sakura-50 text-sakura-700'
                        : 'border-accent border-dashed bg-accent/5'
                    )}>
                      <span className="jp-text">{selected ?? '\u00A0'}</span>
                    </span>
                  )}
                </span>
              ))}
            </span>
          </div>

          {/* English */}
          <p className="text-center text-sm text-text-secondary mb-6">{current.english}</p>

          {/* Particle options — big buttons for rapid tapping */}
          <div className="flex gap-3 justify-center">
            {current.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isCorrectOpt = opt === current.blankParticle;
              let cls = 'border-border hover:border-accent hover:bg-accent/5';
              if (result) {
                if (isCorrectOpt) cls = 'border-matcha-500 bg-[var(--color-feedback-success-bg)]';
                else if (isSelected) cls = 'border-sakura-500 bg-[var(--color-feedback-error-bg)]';
                else cls = 'border-border opacity-30';
              }
              return (
                <motion.button
                  key={opt}
                  whileTap={!result ? { scale: 0.92 } : {}}
                  onClick={() => handleSelect(opt)}
                  disabled={result !== null}
                  className={cn(
                    'w-16 h-16 rounded-xl border-2 text-xl font-bold jp-text transition-all cursor-pointer',
                    cls
                  )}
                >
                  {opt}
                  <span className="block text-[9px] text-text-secondary/50 font-normal">{i + 1}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Wrong answer: explanation + Continue button */}
          {result === 'incorrect' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)] rounded-xl p-4"
            >
              <p className="text-sm font-semibold text-[var(--color-feedback-error-text)] mb-1">
                Incorrect — the correct particle is <strong className="jp-text">{current.blankParticle}</strong>
              </p>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-text-secondary">
                  <span className="jp-text">{current.sentence.replace('___', current.blankParticle)}</span>
                  <span className="mx-1">—</span>
                  {current.english}
                </p>
                <AudioButton text={current.sentence.replace('___', current.blankParticle)} showSlow />
              </div>
              <button
                onClick={handleContinue}
                className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                Continue <span className="text-[10px] opacity-60 ml-1">Enter</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
