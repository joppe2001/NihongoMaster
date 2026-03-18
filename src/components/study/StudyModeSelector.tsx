import { motion } from 'framer-motion';
import { Layers, Target, BookOpenCheck, Zap, type LucideIcon } from '@/lib/icons';
import type { StudyMode } from './types';

interface StudyModeSelectorProps {
  itemCount: number;
  onSelect: (mode: StudyMode) => void;
  onBack: () => void;
}

const MODES: {
  id: StudyMode;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  badge: string;
  accentClass: string;
}[] = [
  {
    id: 'flashcards',
    icon: Layers,
    iconColor: 'text-blue-500',
    title: 'Flashcards',
    description: 'Flip through cards at your own pace. Star tricky ones.',
    badge: 'Classic',
    accentClass: 'from-blue-500/10 to-indigo-500/5 border-blue-200 dark:border-blue-900',
  },
  {
    id: 'learn',
    icon: Target,
    iconColor: 'text-violet-500',
    title: 'Learn',
    description: 'Adaptive study — MC first, then written. Items repeat until mastered.',
    badge: 'Adaptive',
    accentClass: 'from-violet-500/10 to-purple-500/5 border-violet-200 dark:border-violet-900',
  },
  {
    id: 'test',
    icon: BookOpenCheck,
    iconColor: 'text-amber-500',
    title: 'Test',
    description: 'Mixed question types, graded at the end. Retake missed items.',
    badge: 'Graded',
    accentClass: 'from-amber-500/10 to-orange-500/5 border-amber-200 dark:border-amber-900',
  },
  {
    id: 'match',
    icon: Zap,
    iconColor: 'text-emerald-500',
    title: 'Match',
    description: 'Race against the clock to match all pairs. Beat your best time.',
    badge: 'Game',
    accentClass: 'from-emerald-500/10 to-teal-500/5 border-emerald-200 dark:border-emerald-900',
  },
];

export function StudyModeSelector({ itemCount, onSelect, onBack }: StudyModeSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <div>
          <h2 className="text-base font-bold text-text-primary">Choose a study mode</h2>
          <p className="text-xs text-text-secondary">{itemCount} {itemCount === 1 ? 'term' : 'terms'}</p>
        </div>
      </div>

      {/* Mode grid */}
      <div className="grid grid-cols-2 gap-3">
        {MODES.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(mode.id)}
            className={`relative p-5 rounded-2xl border-2 bg-gradient-to-br ${mode.accentClass} text-left cursor-pointer transition-shadow hover:shadow-lg overflow-hidden group`}
          >
            <div className="flex items-start justify-between mb-3">
              <mode.icon size={22} className={mode.iconColor} />
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-bg-primary/70 text-text-secondary">
                {mode.badge}
              </span>
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-1">{mode.title}</h3>
            <p className="text-[11px] text-text-secondary leading-relaxed">{mode.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
