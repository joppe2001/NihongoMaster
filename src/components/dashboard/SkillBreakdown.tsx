import { useState, useEffect } from 'react';
import { getUserStats } from '@/services/achievementService';
import type { UserStats } from '@/lib/types';

interface SkillBreakdownProps {
  userId: number;
}

interface SkillBar {
  label: string;
  learning: number;
  mastered: number;
  total: number;
  color: string;
}

export function SkillBreakdown({ userId }: SkillBreakdownProps) {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getUserStats(userId).then(setStats);
  }, [userId]);

  if (!stats) return null;

  const skills: SkillBar[] = [
    { label: 'Kana', learning: stats.kanaProgress.learning, mastered: stats.kanaProgress.mature, total: Math.max(stats.kanaProgress.total, 92), color: 'bg-sakura-500' },
    { label: 'Kanji', learning: stats.kanjiProgress.learning, mastered: stats.kanjiProgress.mature, total: Math.max(stats.kanjiProgress.total, 103), color: 'bg-accent' },
    { label: 'Vocab', learning: stats.vocabProgress.learning, mastered: stats.vocabProgress.mature, total: Math.max(stats.vocabProgress.total, 300), color: 'bg-matcha-500' },
    { label: 'Grammar', learning: stats.grammarProgress.learning, mastered: stats.grammarProgress.mature, total: Math.max(stats.grammarProgress.total, 40), color: 'bg-gold-500' },
  ];

  const totalLearned = skills.reduce((s, sk) => s + sk.learning + sk.mastered, 0);
  const totalMastered = skills.reduce((s, sk) => s + sk.mastered, 0);

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-1 tracking-tight">Skill Breakdown</h3>
      <p className="text-[10px] text-text-tertiary mb-3">
        {totalLearned} learning &middot; {totalMastered} mastered
      </p>
      <div className="space-y-3">
        {skills.map((skill) => {
          const learned = skill.learning + skill.mastered;
          const pct = skill.total > 0 ? Math.round((learned / skill.total) * 100) : 0;
          const masteredPct = skill.total > 0 ? Math.round((skill.mastered / skill.total) * 100) : 0;
          return (
            <div key={skill.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">{skill.label}</span>
                <span className="text-text-tertiary tabular-nums text-[10px]">
                  {learned}/{skill.total}
                </span>
              </div>
              {/* Stacked bar: mastered (solid) + learning (lighter) */}
              <div className="h-2 bg-bg-subtle rounded-full overflow-hidden relative">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${skill.color} opacity-30 transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${skill.color} transition-all duration-700`}
                  style={{ width: `${masteredPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
