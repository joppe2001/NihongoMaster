import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { formatDuration, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PenLine, Brain, Target, type LucideIcon } from '@/lib/icons';
import { Clock } from 'lucide-react';
import { getProgressStats } from '@/services/progressService';
import { PageHeader } from '@/components/shared/PageHeader';

interface ProgressData {
  totalReviews: number;
  totalCardsLearned: number;
  totalStudyTime: number;
  averageAccuracy: number;
  last7Days: { date: string; cardsReviewed: number; accuracy: number }[];
}

export function ProgressPage() {
  const { user } = useUserStore();
  const [progress, setProgress] = useState<ProgressData>({
    totalReviews: 0,
    totalCardsLearned: 0,
    totalStudyTime: 0,
    averageAccuracy: 0,
    last7Days: [],
  });

  useEffect(() => {
    async function loadProgress() {
      if (!user) return;
      try {
        const data = await getProgressStats(user.id);
        setProgress(data);
      } catch {
        // Progress stays at defaults
      }
    }

    loadProgress();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Progress" subtitle="Track your learning journey" jpTitle="進捗" theme="accent" />

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Reviews"
          value={formatNumber(progress.totalReviews)}
          Icon={PenLine}
          delay={0}
        />
        <StatCard
          label="Cards Learned"
          value={formatNumber(progress.totalCardsLearned)}
          Icon={Brain}
          delay={0.05}
        />
        <StatCard
          label="Study Time"
          value={formatDuration(progress.totalStudyTime)}
          Icon={Clock}
          delay={0.1}
        />
        <StatCard
          label="Avg Accuracy"
          value={`${progress.averageAccuracy}%`}
          Icon={Target}
          delay={0.15}
        />
      </div>

      {/* Streak & Level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-bg-secondary rounded-2xl border border-border p-6 grid grid-cols-2 gap-8"
      >
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Study Streak
          </h3>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-text-primary">
              {user.streakDays}
            </span>
            <span className="text-text-secondary mb-1">days</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Keep studying daily to build your streak!
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Current Level
          </h3>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-accent">
              N{user.currentLevel}
            </span>
            <span className="text-text-secondary mb-1">{user.xp} XP</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Complete N{user.currentLevel} content to progress
          </p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-bg-secondary rounded-2xl border border-border p-6"
      >
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Last 7 Days
        </h3>
        {progress.last7Days.length > 0 ? (
          <div className="space-y-2">
            {progress.last7Days.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-primary"
              >
                <span className="text-sm text-text-primary">{day.date}</span>
                <span className="text-sm text-text-secondary">
                  {day.cardsReviewed} reviews | {day.accuracy}% accuracy
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">
            No study data yet. Start reviewing to see your progress here!
          </p>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  delay,
}: {
  label: string;
  value: string;
  Icon: LucideIcon;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-bg-secondary rounded-xl border border-border p-4 text-center"
    >
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2"><Icon size={20} className="text-accent" /></div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </motion.div>
  );
}
