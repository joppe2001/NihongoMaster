/**
 * Replaces all emoji on result/completion screens with styled Lucide icons.
 * Used across lesson completions, quiz results, practice endings, etc.
 */

import { motion } from 'framer-motion';
import { Star, Trophy, TrendingUp, RefreshCw, Flame, Sparkles, Brain, Flag } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/lib/icons';

type ResultTier = 'perfect' | 'great' | 'good' | 'retry';

function getTier(accuracy: number): ResultTier {
  if (accuracy >= 95) return 'perfect';
  if (accuracy >= 80) return 'great';
  if (accuracy >= 60) return 'good';
  return 'retry';
}

const TIER_CONFIG: Record<ResultTier, { Icon: LucideIcon; bg: string; iconColor: string; glow: string }> = {
  perfect: { Icon: Star, bg: 'bg-gold-500/15', iconColor: 'text-gold-500', glow: 'shadow-[0_0_24px_rgba(245,176,65,0.3)]' },
  great:   { Icon: Trophy, bg: 'bg-accent/15', iconColor: 'text-accent', glow: 'shadow-[0_0_24px_rgba(108,99,255,0.3)]' },
  good:    { Icon: TrendingUp, bg: 'bg-matcha-500/15', iconColor: 'text-matcha-500', glow: 'shadow-[0_0_24px_rgba(56,132,90,0.2)]' },
  retry:   { Icon: RefreshCw, bg: 'bg-sakura-500/15', iconColor: 'text-sakura-500', glow: '' },
};

/**
 * Animated icon for quiz/lesson result screens.
 * Pass accuracy and it picks the right icon + color automatically.
 */
export function ResultIcon({ accuracy, size = 'lg' }: { accuracy: number; size?: 'sm' | 'md' | 'lg' }) {
  const tier = getTier(accuracy);
  const { Icon, bg, iconColor, glow } = TIER_CONFIG[tier];
  const sizeMap = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-20 h-20' };
  const iconSizeMap = { sm: 24, md: 32, lg: 40 };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      className={cn('rounded-full flex items-center justify-center mx-auto mb-4', sizeMap[size], bg, glow)}
    >
      <Icon size={iconSizeMap[size]} className={iconColor} strokeWidth={size === 'lg' ? 1.5 : 2} />
    </motion.div>
  );
}

/**
 * Streak indicator — replaces fire/sparkle emoji in typing practice etc.
 */
export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-1 text-sm font-semibold text-gold-500"
    >
      {streak >= 10 ? (
        <><Flame size={16} className="text-sakura-500" /><Flame size={16} className="text-gold-500" /></>
      ) : streak >= 5 ? (
        <Flame size={16} />
      ) : (
        <Sparkles size={14} />
      )}
      <span>{streak} streak!</span>
    </motion.div>
  );
}

/**
 * Named icon badges — for specific contexts (review, typing-complete, etc.)
 */
export function IconBadge({ icon, size = 'lg' }: {
  icon: 'brain' | 'flag' | 'star' | 'trophy';
  size?: 'sm' | 'md' | 'lg';
}) {
  const config: Record<string, { Icon: LucideIcon; bg: string; color: string }> = {
    brain:  { Icon: Brain, bg: 'bg-accent/15', color: 'text-accent' },
    flag:   { Icon: Flag, bg: 'bg-sakura-500/15', color: 'text-sakura-500' },
    star:   { Icon: Star, bg: 'bg-gold-500/15', color: 'text-gold-500' },
    trophy: { Icon: Trophy, bg: 'bg-matcha-500/15', color: 'text-matcha-500' },
  };
  const { Icon, bg, color } = config[icon] ?? config.star;
  const sizeMap = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' };
  const iconSizeMap = { sm: 20, md: 28, lg: 40 };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      className={cn('rounded-full flex items-center justify-center mx-auto mb-4', sizeMap[size], bg)}
    >
      <Icon size={iconSizeMap[size]} className={color} />
    </motion.div>
  );
}
