import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useAppStore } from '@/stores/settingsStore';
import { formatNumber } from '@/lib/utils';
import { JLPT_LEVELS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { getDashboardStats } from '@/services/progressService';
import { getLevel, getXpForNextLevel } from '@/components/shared/LevelUpAnimation';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { WeakItems } from '@/components/dashboard/WeakItems';
import { SkillBreakdown } from '@/components/dashboard/SkillBreakdown';
import { Flame, Zap, RefreshCw, Target } from '@/lib/icons';
import { StudyGuide } from '@/components/dashboard/StudyGuide';
import type { DashboardStats } from '@/services/progressService';
import type { JlptLevel } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

const DAILY_PHRASES = [
  { jp: '一歩一歩', reading: 'いっぽいっぽ', en: 'One step at a time' },
  { jp: '継続は力なり', reading: 'けいぞくはちからなり', en: 'Persistence is power' },
  { jp: '七転び八起き', reading: 'ななころびやおき', en: 'Fall seven times, stand up eight' },
  { jp: '今日も頑張ろう', reading: 'きょうもがんばろう', en: "Let's do our best today too" },
  { jp: '千里の道も一歩から', reading: 'せんりのみちもいっぽから', en: 'A journey of 1000 miles begins with a single step' },
];

export function DashboardPage() {
  const { user } = useUserStore();
  const { setCurrentPage } = useAppStore();
  const [stats, setStats] = useState<DashboardStats>({
    dueCards: 0, reviewedToday: 0, learnedToday: 0, totalCards: 0,
    kanaLearned: 0, kanjiLearned: 0, vocabLearned: 0, grammarLearned: 0,
    kanaMastered: 0, kanjiMastered: 0, vocabMastered: 0, grammarMastered: 0,
  });
  const [phrase] = useState(() => DAILY_PHRASES[Math.floor(Math.random() * DAILY_PHRASES.length)]);

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.id).then(setStats).catch(() => {});
  }, [user]);

  if (!user) return null;

  const currentLevel = `N${user.currentLevel}` as JlptLevel;
  const levelConfig = JLPT_LEVELS[currentLevel];
  const level = getLevel(user.xp);
  const xpInfo = getXpForNextLevel(user.xp);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ═══ HERO BANNER — Twilight Focus ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative overflow-hidden rounded-2xl gradient-hero p-6 shadow-[0_8px_40px_rgba(108,99,255,0.25)]"
      >
        {/* Aurora mesh overlay */}
        <div className="aurora-mesh" />

        {/* Floating decorative characters */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-2 right-10 text-[90px] text-white/[0.05] font-bold jp-text select-none" style={{ transform: 'rotate(-10deg)' }}>日</motion.span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute bottom-0 left-16 text-[60px] text-white/[0.03] font-bold jp-text select-none" style={{ transform: 'rotate(5deg)' }}>本</motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute top-4 left-[40%] text-[40px] text-white/[0.03] font-bold jp-text select-none">語</motion.span>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">{greeting}</p>
            <h1 className="text-2xl font-bold text-white mt-0.5 tracking-tight">{user.name}</h1>
            <p className="text-white/40 text-sm mt-1">
              {stats.dueCards > 0
                ? `${stats.dueCards} card${stats.dueCards !== 1 ? 's' : ''} ready for review — keep your memory sharp!`
                : 'All caught up — keep learning new material!'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Level ring — indigo → gold */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14">
                <svg width="56" height="56" className="-rotate-90">
                  <defs>
                    <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8B7AFF" />
                      <stop offset="100%" stopColor="#F5B041" />
                    </linearGradient>
                  </defs>
                  <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="23" fill="none" stroke="url(#hero-ring)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 23}
                    strokeDashoffset={2 * Math.PI * 23 * (1 - xpInfo.progress)}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg leading-none pt-px pl-px">{level}</span>
              </div>
              <span className="text-[10px] text-white/35 mt-0.5">Level</span>
            </div>

            {stats.dueCards > 0 && (
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentPage('review')}
                className="px-5 py-2.5 bg-white text-primary-600 rounded-xl font-semibold text-sm cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
              >
                Review ({stats.dueCards})
              </motion.button>
            )}
          </div>
        </div>

        {/* Daily phrase */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/8">
          <p className="text-base text-white/70 jp-text font-medium">{phrase.jp}</p>
          <p className="text-[11px] text-white/35 mt-0.5">{phrase.en}</p>
        </div>
      </motion.div>

      {/* ═══ STAT CARDS — Frosted glass with colored left border ═══ */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={Flame} label="Streak" value={`${user.streakDays}d`} borderColor="border-l-gold-500" iconColor="text-gold-500" delay={0} />
        <StatCard icon={RefreshCw} label="Today" value={String(stats.reviewedToday)} borderColor="border-l-primary-500" iconColor="text-primary-500" delay={0.05} />
        <StatCard icon={Target} label="Learned" value={String(stats.learnedToday)} borderColor="border-l-matcha-500" iconColor="text-matcha-500" delay={0.1} />
        <StatCard icon={Zap} label="XP" value={formatNumber(user.xp)} borderColor="border-l-sakura-500" iconColor="text-sakura-500" delay={0.15} />
      </div>

      {/* ═══ TWO COLUMN LAYOUT ═══ */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left 2/3 */}
        <div className="col-span-2 space-y-4">
          {/* JLPT Progress — Ring indicators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-secondary rounded-2xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">{levelConfig.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: levelConfig.color }}>{currentLevel}</span>
            </div>

            {/* Four ring indicators */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <SkillRing label="Kana" learned={stats.kanaLearned} mastered={stats.kanaMastered} total={92} color="#D66B8A" />
              <SkillRing label="Kanji" learned={stats.kanjiLearned} mastered={stats.kanjiMastered} total={levelConfig.kanjiCount} color="#6C63FF" />
              <SkillRing label="Vocab" learned={stats.vocabLearned} mastered={stats.vocabMastered} total={levelConfig.vocabCount} color="#38845A" />
              <SkillRing label="Grammar" learned={stats.grammarLearned} mastered={stats.grammarMastered} total={levelConfig.grammarCount} color="#D4A537" />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent/30" />
                <span className="text-[10px] text-text-tertiary">Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] text-text-tertiary">Mastered</span>
              </div>
            </div>
          </motion.div>

          {/* Smart Study Guide */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <StudyGuide
              userId={user.id}
              stats={stats}
              userLevel={user.currentLevel}
              streakDays={user.streakDays}
            />
          </motion.div>

          {/* Heatmap */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <ActivityHeatmap userId={user.id} />
          </motion.div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <SkillBreakdown userId={user.id} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <WeakItems userId={user.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card — Clean with colored left border ─────────────

function StatCard({ icon: Icon, label, value, borderColor, iconColor, delay }: {
  icon: LucideIcon; label: string; value: string; borderColor: string; iconColor: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 22 }}
      className={`bg-bg-secondary rounded-xl border border-border border-l-4 ${borderColor} p-4 card-interactive`}
    >
      <Icon size={16} className={`${iconColor} mb-2`} />
      <p className="text-2xl font-bold text-text-primary tabular-nums tracking-tight">{value}</p>
      <p className="text-[10px] text-text-tertiary uppercase tracking-[0.08em] font-semibold">{label}</p>
    </motion.div>
  );
}

// ─── Skill Ring — SVG donut showing learned vs mastered ─────

function SkillRing({ label, learned, mastered, total, color }: {
  label: string; learned: number; mastered: number; total: number; color: string;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const learnedPct = total > 0 ? Math.min(learned / total, 1) : 0;
  const masteredPct = total > 0 ? Math.min(mastered / total, 1) : 0;
  const overallPct = Math.round(learnedPct * 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[72px] h-[72px]">
        <svg width="72" height="72" className="-rotate-90">
          {/* Background track */}
          <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--color-bg-subtle)" strokeWidth="5" />
          {/* Learning ring (lighter) */}
          <motion.circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.3"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - learnedPct) }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
          {/* Mastered ring (solid, on top) */}
          <motion.circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - masteredPct) }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-text-primary tabular-nums">{overallPct}%</span>
        </div>
      </div>
      <p className="text-[11px] font-medium text-text-secondary mt-1.5">{label}</p>
      <p className="text-[9px] text-text-tertiary tabular-nums">{learned}/{total}</p>
    </div>
  );
}

// ─── Action Card (gradient icon) ────────────────────────────

