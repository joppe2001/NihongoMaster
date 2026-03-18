import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Hand, Target, Flower2 } from '@/lib/icons';
import { useUserStore } from '@/stores/userStore';
import { execute } from '@/lib/db';

interface OnboardingWizardProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'name' | 'level' | 'goal' | 'ready';

const STEPS: Step[] = ['welcome', 'name', 'level', 'goal', 'ready'];

const LEVELS = [
  { id: 'beginner', label: 'Complete Beginner', desc: 'I don\'t know any Japanese yet', level: 5 as const },
  { id: 'kana', label: 'I Know Some Kana', desc: 'I can read hiragana and/or katakana', level: 5 as const },
  { id: 'n5', label: 'Studying for N5', desc: 'I know basic kanji, vocab, and grammar', level: 5 as const },
  { id: 'n4', label: 'N5 Complete / Studying N4', desc: 'I\'m past the basics', level: 4 as const },
];

const GOALS = [
  { minutes: 5, label: '5 min', desc: 'Quick daily review' },
  { minutes: 10, label: '10 min', desc: 'Steady progress' },
  { minutes: 15, label: '15 min', desc: 'Committed learner' },
  { minutes: 30, label: '30 min', desc: 'Serious study' },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, setUser, setOnboarded } = useUserStore();
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('beginner');
  const [selectedGoal, setSelectedGoal] = useState<number>(10);
  const [direction, setDirection] = useState(1);

  const step = STEPS[stepIdx];

  const next = useCallback(() => {
    if (stepIdx >= STEPS.length - 1) return;
    setDirection(1);
    setStepIdx((i) => i + 1);
  }, [stepIdx]);

  const prev = useCallback(() => {
    if (stepIdx <= 0) return;
    setDirection(-1);
    setStepIdx((i) => i - 1);
  }, [stepIdx]);

  const finish = useCallback(async () => {
    if (!user) return;
    const trimmedName = name.trim() || 'Learner';
    const jlptLevel = LEVELS.find((l) => l.id === selectedLevelId)?.level ?? 5;
    await execute(
      'UPDATE users SET name = $1, current_level = $2, daily_goal_minutes = $3 WHERE id = $4',
      [trimmedName, jlptLevel, selectedGoal, user.id]
    );
    setUser({
      ...user,
      name: trimmedName,
      currentLevel: jlptLevel as 1 | 2 | 3 | 4 | 5,
      dailyGoalMinutes: selectedGoal,
    });
    // Mark onboarding complete
    await execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('onboarding_complete', 'true')",
      []
    );
    setOnboarded(true);
    onComplete();
  }, [user, name, selectedLevelId, selectedGoal, setUser, setOnboarded, onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-lg px-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                 i <= stepIdx ? 'bg-accent' : 'bg-bg-muted'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepIdx}
            initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* ── Welcome ── */}
            {step === 'welcome' && (
              <div className="text-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-7xl block mb-6"
                >
                  🇯🇵
                </motion.span>
                <h1 className="text-3xl font-bold text-text-primary mb-3">
                  Welcome to NihongoMaster
                </h1>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                  Learn real Japanese for real situations. Not "I am an apple" — actual conversations you'll have in Japan.
                </p>
                <button onClick={next} className="px-8 py-3 bg-accent text-white rounded-xl font-medium text-lg cursor-pointer">
                  Get Started
                </button>
              </div>
            )}

            {/* ── Name ── */}
            {step === 'name' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4"><Hand size={32} className="text-accent" /></div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">What should we call you?</h2>
                <p className="text-text-secondary mb-6">This is just for personalization</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && next()}
                  placeholder="Your name..."
                  autoFocus
                  className="w-full max-w-xs mx-auto block text-center text-xl py-3 px-4 rounded-xl border-2 border-border focus:border-accent outline-none bg-bg-secondary text-text-primary"
                />
                <div className="flex justify-center gap-3 mt-8">
                  <button onClick={prev} className="px-5 py-2 rounded-xl bg-bg-subtle text-text-secondary cursor-pointer">Back</button>
                  <button onClick={next} disabled={!name.trim()} className="px-8 py-2 bg-accent text-white rounded-xl font-medium cursor-pointer disabled:opacity-30">Next</button>
                </div>
              </div>
            )}

            {/* ── Level ── */}
            {step === 'level' && (
              <div className="text-center">
                <span className="text-5xl block mb-4 jp-text">日</span>
                <h2 className="text-2xl font-bold text-text-primary mb-2">What's your Japanese level?</h2>
                <p className="text-text-secondary mb-6">We'll adjust content to match</p>
                <div className="space-y-2 max-w-sm mx-auto text-left">
                  {LEVELS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLevelId(l.id)}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 transition-all cursor-pointer',
                        selectedLevelId === l.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-bg-secondary hover:border-accent/50'
                      )}
                    >
                      <p className="text-sm font-semibold text-text-primary">{l.label}</p>
                      <p className="text-xs text-text-secondary">{l.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-3 mt-8">
                  <button onClick={prev} className="px-5 py-2 rounded-xl bg-bg-subtle text-text-secondary cursor-pointer">Back</button>
                  <button onClick={next} className="px-8 py-2 bg-accent text-white rounded-xl font-medium cursor-pointer">Next</button>
                </div>
              </div>
            )}

            {/* ── Goal ── */}
            {step === 'goal' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-matcha-500/15 flex items-center justify-center mx-auto mb-4"><Target size={32} className="text-matcha-500" /></div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Daily study goal</h2>
                <p className="text-text-secondary mb-6">You can always change this later</p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {GOALS.map((g) => (
                    <button
                      key={g.minutes}
                      onClick={() => setSelectedGoal(g.minutes)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all cursor-pointer text-center',
                        selectedGoal === g.minutes
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-bg-secondary hover:border-accent/50'
                      )}
                    >
                      <p className="text-2xl font-bold text-text-primary">{g.label}</p>
                      <p className="text-xs text-text-secondary">{g.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-3 mt-8">
                  <button onClick={prev} className="px-5 py-2 rounded-xl bg-bg-subtle text-text-secondary cursor-pointer">Back</button>
                  <button onClick={next} className="px-8 py-2 bg-accent text-white rounded-xl font-medium cursor-pointer">Next</button>
                </div>
              </div>
            )}

            {/* ── Ready ── */}
            {step === 'ready' && (
              <div className="text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="text-7xl block mb-6"
                >
                  <Flower2 size={48} className="text-sakura-500" />
                </motion.span>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  You're all set, {name.trim() || 'Learner'}!
                </h2>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                  Start with the kana — they're the foundation of everything. From there, we'll guide you through kanji, vocabulary, grammar, and real-world practice.
                </p>
                <button onClick={finish} className="px-8 py-3 bg-accent text-white rounded-xl font-medium text-lg cursor-pointer">
                  Start Learning
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
