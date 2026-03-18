import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { PartyPopper } from '@/lib/icons';

// XP thresholds for each level
export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
  6500, 8000, 10000, 12500, 15500, 19000, 23000, 27500, 32500, 38000,
  44000, 50500, 58000, 66000, 75000, 85000, 96000, 108000, 121000, 135000,
];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 1000;
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, progress: needed > 0 ? current / needed : 1 };
}

interface LevelUpAnimationProps {
  newLevel: number | null;
  onDismiss: () => void;
}

export function LevelUpAnimation({ newLevel, onDismiss }: LevelUpAnimationProps) {
  useEffect(() => {
    if (newLevel === null) return;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [newLevel, onDismiss]);

  return (
    <AnimatePresence>
      {newLevel !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-neutral-950/60 backdrop-blur-md flex items-center justify-center"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-2"
            >
              <PartyPopper size={48} className="text-gold-500" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gold-400 font-bold uppercase tracking-widest mb-1"
            >
              Level Up!
            </motion.p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.5 }}
              className="text-8xl font-black text-white"
              style={{ textShadow: '0 0 40px rgba(245, 176, 65, 0.5), 0 0 80px rgba(108, 99, 255, 0.3)' }}
            >
              {newLevel}
            </motion.p>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-white/60 mt-2"
            >
              Keep going!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
