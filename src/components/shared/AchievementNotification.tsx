import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import type { UnlockedAchievement } from '@/services/achievementService';

interface AchievementNotificationProps {
  achievement: UnlockedAchievement | null;
  onDismiss: () => void;
}

export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
          onClick={onDismiss}
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--color-feedback-gold-bg)] border border-[var(--color-feedback-gold-border)] shadow-xl glow-gold cursor-pointer">
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.2 }}
              className="text-3xl"
            >
              {achievement.icon}
            </motion.span>
            <div>
              <p className="text-xs font-semibold text-[var(--color-feedback-gold-text)] uppercase tracking-wider">
                Achievement Unlocked!
              </p>
              <p className="text-sm font-bold text-text-primary">{achievement.name}</p>
              <p className="text-xs text-text-secondary">{achievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
