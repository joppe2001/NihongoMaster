import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ResultIcon } from '@/components/shared/ResultIcon';
import {
  Puzzle, PenLine, RefreshCw, MessageSquare, Search, Target,
  Languages, Zap, Dumbbell, Layers,
  Store, UtensilsCrossed, TrainFront, Users, ShoppingBag, Home, GraduationCap, MapPin,
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from '@/lib/icons';
import { useUserStore } from '@/stores/userStore';
import { SentenceBuilder } from '@/components/exercises/SentenceBuilder';
import { FillInTheBlank } from '@/components/exercises/FillInTheBlank';
import { ConjugationDrill } from '@/components/exercises/ConjugationDrill';
import { ErrorCorrection } from '@/components/exercises/ErrorCorrection';
import { DialogueCompletion } from '@/components/exercises/DialogueCompletion';
import { MatchingPairs } from '@/components/exercises/MatchingPairs';
import { TranslationChallenge } from '@/components/exercises/TranslationChallenge';
import { ParticleMaster } from '@/components/exercises/ParticleMaster';
import {
  SCENARIOS,
  SENTENCE_EXERCISES,
  FILL_BLANK_EXERCISES,
} from '@/data/sentenceExercises';
import type { SentenceExercise, FillBlankExercise } from '@/data/sentenceExercises';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  generateConjugationDrills,
  getErrorCorrectionExercises,
  getDialogueExercises,
  generateMatchingExercises,
  type ConjugationExercise,
  type ErrorCorrectionExercise,
  type DialogueExercise,
  type MatchingExercise,
} from '@/services/exerciseGenerator';
import {
  type TranslationExercise,
  type ParticleDrill,
} from '@/services/sentenceGenerator';
import {
  getPracticeParticleDrills,
  getPracticeTranslation,
  getPracticeFillBlanks,
  getPracticeSentenceBuilder,
} from '@/services/sentenceBankService';
import { getVocabUpToLevel } from '@/services/vocabService';
import type { VocabDetail } from '@/services/vocabService';
import type { JlptLevelId } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────────

type PracticeMode =
  | 'select'
  | 'sentences'
  | 'blanks'
  | 'conjugation'
  | 'error-correction'
  | 'dialogue'
  | 'matching'
  | 'translation'
  | 'particles'
  | 'mixed';

// ─── Skill Categories ────────────────────────────────────────

interface ExerciseDef {
  id: PracticeMode;
  label: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
  /** Whether this exercise uses the dynamic generator */
  dynamic?: boolean;
}

interface SkillCategory {
  label: string;
  desc: string;
  exercises: ExerciseDef[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: 'Production',
    desc: 'Build and write Japanese',
    exercises: [
      { id: 'sentences', label: 'Sentence Builder', desc: 'Arrange words into correct order', Icon: Puzzle, color: 'from-matcha-400 to-matcha-600' },
      { id: 'translation', label: 'Translation Challenge', desc: 'Translate between English and Japanese', Icon: Languages, color: 'from-primary-400 to-primary-600', dynamic: true },
      { id: 'conjugation', label: 'Conjugation Drill', desc: 'Practice verb forms: te, masu, nai, ta', Icon: RefreshCw, color: 'from-sakura-400 to-sakura-600' },
    ],
  },
  {
    label: 'Comprehension',
    desc: 'Understand and interpret Japanese',
    exercises: [
      { id: 'blanks', label: 'Fill in the Blank', desc: 'Choose the correct particle or word', Icon: PenLine, color: 'from-indigo-400 to-indigo-600' },
      { id: 'dialogue', label: 'Dialogue Practice', desc: 'Complete real-world conversations', Icon: MessageSquare, color: 'from-gold-400 to-gold-600' },
      { id: 'error-correction', label: 'Error Correction', desc: 'Find and fix grammar mistakes', Icon: Search, color: 'from-primary-400 to-primary-600' },
    ],
  },
  {
    label: 'Grammar Drills',
    desc: 'Master particles and patterns',
    exercises: [
      { id: 'particles', label: 'Particle Master', desc: 'Rapid-fire particle drills from your vocab', Icon: Zap, color: 'from-gold-400 to-sakura-500', dynamic: true },
    ],
  },
  {
    label: 'Vocabulary',
    desc: 'Strengthen word knowledge',
    exercises: [
      { id: 'matching', label: 'Matching Pairs', desc: 'Match Japanese words to English meanings', Icon: Target, color: 'from-matcha-500 to-indigo-500' },
    ],
  },
];

// Scenarios with Lucide icons instead of emojis
const SCENARIO_ICONS: Record<string, LucideIcon> = {
  konbini: Store,
  restaurant: UtensilsCrossed,
  station: TrainFront,
  meeting: Users,
  shopping: ShoppingBag,
  home: Home,
  school: GraduationCap,
  directions: MapPin,
};

// ─── Main Component ──────────────────────────────────────────

export function PracticePage() {
  const { user } = useUserStore();
  const [mode, setMode] = useState<PracticeMode>('select');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [sessionSentences, setSessionSentences] = useState<SentenceExercise[]>([]);
  const [sessionBlanks, setSessionBlanks] = useState<FillBlankExercise[]>([]);

  // Dynamic exercise data
  const [vocab, setVocab] = useState<VocabDetail[]>([]);
  const [conjugationExercises, setConjugationExercises] = useState<ConjugationExercise[]>([]);
  const [errorExercises, setErrorExercises] = useState<ErrorCorrectionExercise[]>([]);
  const [dialogueExercises, setDialogueExercises] = useState<DialogueExercise[]>([]);
  const [matchingExercises, setMatchingExercises] = useState<MatchingExercise[]>([]);
  const [translationExercises, setTranslationExercises] = useState<TranslationExercise[]>([]);
  const [particleExercises, setParticleExercises] = useState<ParticleDrill[]>([]);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillCorrect, setDrillCorrect] = useState(0);
  const [drillTotal, setDrillTotal] = useState(0);

  const level = (user?.currentLevel ?? 5) as JlptLevelId;

  // Load vocab from student's current level AND all easier levels
  // e.g. N3 student gets N5 + N4 + N3 words for richer sentence generation
  useEffect(() => {
    async function load() {
      const v = await getVocabUpToLevel(level);
      setVocab(v);
    }
    load();
  }, [level]);

  // ── Starters ──

  const startSentences = async () => {
    if (selectedScenario) {
      // Scenario mode: use static exercises for that scenario
      const filtered = SENTENCE_EXERCISES.filter((e) => e.scenario === selectedScenario);
      setSessionSentences(filtered);
    } else {
      // Hybrid: bank (curated) + static + generated
      const staticOnes = [...SENTENCE_EXERCISES].sort(() => Math.random() - 0.5).slice(0, 5);
      const bankOnes = await getPracticeSentenceBuilder(vocab, level, 10);
      setSessionSentences([...staticOnes, ...bankOnes].sort(() => Math.random() - 0.5).slice(0, 15) as SentenceExercise[]);
    }
    setMode('sentences');
  };

  const startBlanks = async () => {
    if (selectedScenario) {
      const filtered = FILL_BLANK_EXERCISES.filter((e) => e.scenario === selectedScenario);
      setSessionBlanks(filtered);
    } else {
      // Hybrid: static hand-written + bank retrieval + generated
      const staticOnes = [...FILL_BLANK_EXERCISES].sort(() => Math.random() - 0.5).slice(0, 4);
      const bankOnes = await getPracticeFillBlanks(vocab, level, 10);
      setSessionBlanks([...staticOnes, ...bankOnes].sort(() => Math.random() - 0.5).slice(0, 14));
    }
    setMode('blanks');
  };

  const startConjugation = () => {
    const drills = generateConjugationDrills(vocab).sort(() => Math.random() - 0.5).slice(0, 12);
    setConjugationExercises(drills);
    setDrillIndex(0); setDrillCorrect(0); setDrillTotal(0);
    setMode('conjugation');
  };

  const startDialogue = () => {
    setDialogueExercises(getDialogueExercises());
    setDrillIndex(0); setDrillCorrect(0); setDrillTotal(0);
    setMode('dialogue');
  };

  const startErrorCorrection = () => {
    setErrorExercises(getErrorCorrectionExercises().slice(0, 10));
    setDrillIndex(0); setDrillCorrect(0); setDrillTotal(0);
    setMode('error-correction');
  };

  const startMatching = () => {
    const exercises = generateMatchingExercises(vocab);
    setMatchingExercises(exercises.slice(0, 3));
    setDrillIndex(0); setDrillCorrect(0); setDrillTotal(0);
    setMode('matching');
  };

  const startTranslation = async () => {
    const exercises = await getPracticeTranslation(vocab, level, 10);
    setTranslationExercises(exercises);
    setMode('translation');
  };

  const startParticles = async () => {
    const exercises = await getPracticeParticleDrills(vocab, level, 15);
    setParticleExercises(exercises);
    setMode('particles');
  };

  const handleDrillAnswer = (correct: boolean) => {
    setDrillTotal((t) => t + 1);
    if (correct) setDrillCorrect((c) => c + 1);
    // Components now handle their own Continue flow (stop on wrong, auto-advance on correct)
    // so the parent advances immediately when called
    setDrillIndex((i) => i + 1);
  };

  const resetToSelect = () => {
    setMode('select');
    setSelectedScenario(null);
    setDrillIndex(0); setDrillCorrect(0); setDrillTotal(0);
  };

  const isDrillDone = (exercises: unknown[]) => drillIndex >= exercises.length;

  const starterMap: Record<string, () => void> = {
    sentences: startSentences,
    blanks: startBlanks,
    conjugation: startConjugation,
    dialogue: startDialogue,
    'error-correction': startErrorCorrection,
    matching: startMatching,
    translation: startTranslation,
    particles: startParticles,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Practice"
        subtitle="Real-world Japanese exercises"
        jpTitle="練習"
        theme="matcha"
        action={
          mode !== 'select' ? (
            <button onClick={resetToSelect} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 text-white/80 hover:bg-white/30 cursor-pointer">
              Back
            </button>
          ) : undefined
        }
      />

      {/* ── SELECT MODE ── */}
      {mode === 'select' && (
        <>
          {/* Skill categories */}
          <div className="space-y-6">
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-text-primary">{cat.label}</h3>
                  <p className="text-xs text-text-tertiary">{cat.desc}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cat.exercises.map((ex, i) => {
                    const starter = starterMap[ex.id];
                    const disabled = !starter || (ex.dynamic && vocab.length === 0);
                    return (
                      <motion.button
                        key={ex.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={starter}
                        disabled={disabled}
                        className={cn(
                          'p-5 rounded-2xl border border-border hover:shadow-lg transition-all cursor-pointer text-left group card-interactive',
                          disabled ? 'opacity-40 cursor-not-allowed' : 'bg-bg-secondary'
                        )}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ex.color} flex items-center justify-center mb-3 shadow-sm`}>
                          <ex.Icon size={18} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{ex.label}</p>
                        <p className="text-xs text-text-tertiary mt-1">{ex.desc}</p>
                        {ex.dynamic && (
                          <p className="text-[10px] text-accent mt-2 flex items-center gap-1">
                            <Dumbbell size={10} /> Generated from your vocab
                          </p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Scenarios */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-text-primary">Scenarios</h3>
              <p className="text-xs text-text-tertiary">Practice in real-world situations</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCENARIOS.map((s) => {
                const total = SENTENCE_EXERCISES.filter((e) => e.scenario === s.id).length
                  + FILL_BLANK_EXERCISES.filter((e) => e.scenario === s.id).length;
                const ScenarioIcon = SCENARIO_ICONS[s.id] ?? Layers;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedScenario(s.id); startSentences(); }}
                    className="p-3 rounded-xl border border-border bg-bg-secondary hover:border-accent/50 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-8 h-8 mx-auto rounded-lg bg-bg-subtle flex items-center justify-center mb-1.5 group-hover:bg-accent/10 transition-colors">
                      <ScenarioIcon size={16} className="text-text-secondary group-hover:text-accent" />
                    </div>
                    <p className="text-xs font-medium text-text-primary">{s.label}</p>
                    <p className="text-[10px] text-text-tertiary">{total} exercises</p>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── SENTENCE BUILDER ── */}
      {mode === 'sentences' && (
        <SentenceBuilder exercises={sessionSentences} onComplete={resetToSelect} />
      )}

      {/* ── FILL IN THE BLANK ── */}
      {mode === 'blanks' && (
        <FillInTheBlank exercises={sessionBlanks} onComplete={resetToSelect} />
      )}

      {/* ── TRANSLATION CHALLENGE ── */}
      {mode === 'translation' && (
        <TranslationChallenge exercises={translationExercises} onComplete={resetToSelect} />
      )}

      {/* ── PARTICLE MASTER ── */}
      {mode === 'particles' && (
        <ParticleMaster exercises={particleExercises} onComplete={resetToSelect} />
      )}

      {/* ── CONJUGATION DRILL ── */}
      {mode === 'conjugation' && (
        isDrillDone(conjugationExercises) ? (
          <DrillComplete correct={drillCorrect} total={drillTotal} label="Conjugation Drill" onDone={resetToSelect} />
        ) : conjugationExercises[drillIndex] ? (
          <AnimatePresence mode="wait">
            <motion.div key={drillIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <ConjugationDrill exercise={conjugationExercises[drillIndex]} onAnswer={handleDrillAnswer} />
              <p className="text-center text-[10px] text-text-tertiary mt-3">{drillIndex + 1}/{conjugationExercises.length}</p>
            </motion.div>
          </AnimatePresence>
        ) : null
      )}

      {/* ── ERROR CORRECTION ── */}
      {mode === 'error-correction' && (
        isDrillDone(errorExercises) ? (
          <DrillComplete correct={drillCorrect} total={drillTotal} label="Error Correction" onDone={resetToSelect} />
        ) : errorExercises[drillIndex] ? (
          <AnimatePresence mode="wait">
            <motion.div key={drillIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <ErrorCorrection exercise={errorExercises[drillIndex]} onAnswer={handleDrillAnswer} />
              <p className="text-center text-[10px] text-text-tertiary mt-3">{drillIndex + 1}/{errorExercises.length}</p>
            </motion.div>
          </AnimatePresence>
        ) : null
      )}

      {/* ── DIALOGUE ── */}
      {mode === 'dialogue' && (
        isDrillDone(dialogueExercises) ? (
          <DrillComplete correct={drillCorrect} total={drillTotal} label="Dialogue Practice" onDone={resetToSelect} />
        ) : dialogueExercises[drillIndex] ? (
          <AnimatePresence mode="wait">
            <motion.div key={drillIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <DialogueCompletion exercise={dialogueExercises[drillIndex]} onAnswer={handleDrillAnswer} />
              <p className="text-center text-[10px] text-text-tertiary mt-3">{drillIndex + 1}/{dialogueExercises.length}</p>
            </motion.div>
          </AnimatePresence>
        ) : null
      )}

      {/* ── MATCHING ── */}
      {mode === 'matching' && (
        isDrillDone(matchingExercises) ? (
          <DrillComplete correct={drillCorrect} total={drillTotal} label="Matching Pairs" onDone={resetToSelect} />
        ) : matchingExercises[drillIndex] ? (
          <AnimatePresence mode="wait">
            <motion.div key={drillIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <MatchingPairs exercise={matchingExercises[drillIndex]} onAnswer={handleDrillAnswer} />
              <p className="text-center text-[10px] text-text-tertiary mt-3">{drillIndex + 1}/{matchingExercises.length}</p>
            </motion.div>
          </AnimatePresence>
        ) : null
      )}
    </div>
  );
}

// ── Drill completion screen ──

function DrillComplete({ correct, total, label, onDone }: { correct: number; total: number; label: string; onDone: () => void }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
      <ResultIcon accuracy={accuracy} />
      <h3 className="text-2xl font-bold text-text-primary mb-2">{label} Complete!</h3>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8 mt-6">
        <div><p className="text-3xl font-bold text-matcha-500">{correct}/{total}</p><p className="text-xs text-text-secondary">Correct</p></div>
        <div><p className="text-3xl font-bold text-accent">{accuracy}%</p><p className="text-xs text-text-secondary">Accuracy</p></div>
      </div>
      <button onClick={onDone} className="px-8 py-3 bg-accent text-white rounded-xl font-medium cursor-pointer">Continue</button>
    </motion.div>
  );
}
