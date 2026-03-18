import { useState, useEffect } from 'react';
import { query } from '@/lib/db';
import { useAppStore } from '@/stores/settingsStore';
import { JLPT_LEVELS } from '@/lib/constants';
import { Flame, BookOpen, RefreshCw, Target, MessageSquare, PenLine } from '@/lib/icons';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/services/progressService';
import type { LucideIcon } from 'lucide-react';
import type { PageId } from '@/lib/types';

interface Recommendation {
  title: string;
  reason: string;
  page: PageId;
  icon: LucideIcon;
  gradient: string;
  priority: number; // Lower = more urgent
}

interface StudyGuideProps {
  userId: number;
  stats: DashboardStats;
  userLevel: number;    // 1-5 (JLPT level id)
  streakDays: number;
}

/**
 * Smart Study Guide — recommends what to do next based on:
 *
 * 1. REVIEWS FIRST (spaced repetition is most effective when on-time)
 * 2. Kana foundation (can't learn kanji/vocab without kana)
 * 3. Balanced skill growth (don't let one skill fall behind)
 * 4. Progressive difficulty (N5 basics before N4, etc.)
 * 5. Variety (mix study types to prevent burnout)
 * 6. Streak protection (encourage daily practice)
 *
 * Based on language learning research:
 * - Krashen's Input Hypothesis (comprehensible input, i+1)
 * - Spaced Repetition (Ebbinghaus forgetting curve)
 * - Interleaving (mixing topics improves retention)
 * - Active recall > passive review
 */
export function StudyGuide({ userId, stats, userLevel, streakDays }: StudyGuideProps) {
  const { setCurrentPage } = useAppStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    generateRecommendations().then(setRecommendations);
  }, [userId, stats, userLevel, streakDays]);

  async function generateRecommendations(): Promise<Recommendation[]> {
    const recs: Recommendation[] = [];
    const targets = JLPT_LEVELS[`N${userLevel}` as keyof typeof JLPT_LEVELS];

    // ── 1. REVIEWS FIRST — Always the top priority ──
    if (stats.dueCards > 0) {
      recs.push({
        title: `Review ${stats.dueCards} card${stats.dueCards > 1 ? 's' : ''}`,
        reason: 'SRS reviews are most effective when done on time — don\'t let them pile up',
        page: 'review',
        icon: RefreshCw,
        gradient: 'from-primary-400 to-primary-600',
        priority: 0,
      });
    }

    // ── 2. KANA FOUNDATION — Can't learn Japanese without kana ──
    const kanaTotal = 92; // 46 hiragana + 46 katakana
    const kanaPercent = Math.round((stats.kanaLearned / kanaTotal) * 100);

    if (kanaPercent < 50) {
      // Check which kana type needs more work
      const hiraganaCount = await query<{ count: number }>(
        `SELECT COUNT(*) as count FROM srs_cards
         WHERE user_id = $1 AND content_type = 'kana'
           AND state IN ('learning', 'review') AND reps >= 2
           AND content_id IN (SELECT id FROM kana WHERE type = 'hiragana')`,
        [userId]
      );
      const hCount = hiraganaCount[0]?.count ?? 0;

      if (hCount < 46) {
        recs.push({
          title: 'Learn Hiragana',
          reason: `Hiragana is the foundation of Japanese reading — you know ${hCount}/46 characters`,
          page: 'hiragana',
          icon: BookOpen,
          gradient: 'from-sakura-400 to-sakura-600',
          priority: 1,
        });
      } else {
        recs.push({
          title: 'Learn Katakana',
          reason: `You've mastered hiragana! Katakana is used for foreign words — essential for daily Japanese`,
          page: 'katakana',
          icon: BookOpen,
          gradient: 'from-indigo-400 to-indigo-600',
          priority: 1,
        });
      }
    } else if (kanaPercent < 100) {
      recs.push({
        title: 'Finish Kana',
        reason: `${kanaPercent}% done — completing all kana unlocks faster vocab and kanji learning`,
        page: stats.kanaLearned < 46 ? 'hiragana' : 'katakana',
        icon: BookOpen,
        gradient: 'from-sakura-400 to-sakura-600',
        priority: 3,
      });
    }

    // ── 3. BALANCED SKILLS — Find the weakest area ──
    const kanjiTarget = targets?.kanjiCount ?? 100;
    const vocabTarget = targets?.vocabCount ?? 800;
    const grammarTarget = targets?.grammarCount ?? 80;

    const kanjiPercent = Math.round((stats.kanjiLearned / kanjiTarget) * 100);
    const vocabPercent = Math.round((stats.vocabLearned / vocabTarget) * 100);
    const grammarPercent = Math.round((stats.grammarLearned / grammarTarget) * 100);

    // Only suggest these if kana is at least 30% (you need some foundation)
    if (kanaPercent >= 30) {
      const skills = [
        { name: 'Kanji', pct: kanjiPercent, page: 'kanji' as PageId, icon: BookOpen, gradient: 'from-gold-400 to-gold-600', learned: stats.kanjiLearned, target: kanjiTarget },
        { name: 'Vocabulary', pct: vocabPercent, page: 'vocabulary' as PageId, icon: Target, gradient: 'from-matcha-400 to-matcha-600', learned: stats.vocabLearned, target: vocabTarget },
        { name: 'Grammar', pct: grammarPercent, page: 'grammar' as PageId, icon: MessageSquare, gradient: 'from-indigo-400 to-indigo-600', learned: stats.grammarLearned, target: grammarTarget },
      ];

      // Sort by lowest progress first — that's where the student should focus
      skills.sort((a, b) => a.pct - b.pct);
      const weakest = skills[0];

      if (weakest.pct < 100) {
        recs.push({
          title: `Study ${weakest.name}`,
          reason: `${weakest.name} is your least practiced area at ${weakest.pct}% — balancing skills improves overall comprehension`,
          page: weakest.page,
          icon: weakest.icon,
          gradient: weakest.gradient,
          priority: 4,
        });
      }

      // If there's a big gap between skills (>30%), suggest the lagging one specifically
      const strongest = skills[skills.length - 1];
      if (strongest.pct - weakest.pct > 30 && skills.length > 1) {
        const second = skills[1];
        if (second.pct < 100 && second.name !== weakest.name) {
          recs.push({
            title: `Catch up on ${second.name}`,
            reason: `${second.name} (${second.pct}%) is falling behind ${strongest.name} (${strongest.pct}%) — even progress helps retention`,
            page: second.page,
            icon: second.icon,
            gradient: second.gradient,
            priority: 5,
          });
        }
      }
    }

    // ── 4. PRACTICE — Mix active recall with passive study ──
    if (stats.kanaLearned > 20 || stats.vocabLearned > 10) {
      // Check if user has done any practice recently
      const recentPractice = await query<{ count: number }>(
        `SELECT COUNT(*) as count FROM user_progress
         WHERE user_id = $1 AND date >= date('now', '-3 days')`,
        [userId]
      );
      const recentDays = recentPractice[0]?.count ?? 0;

      if (recentDays < 2) {
        recs.push({
          title: 'Practice Exercises',
          reason: 'Active recall through exercises strengthens memory 3x more than passive review',
          page: 'practice',
          icon: PenLine,
          gradient: 'from-matcha-400 to-matcha-600',
          priority: 6,
        });
      }
    }

    // ── 5. READING — Once vocab is sufficient ──
    if (stats.vocabLearned >= 30 && stats.grammarLearned >= 5) {
      recs.push({
        title: 'Try Reading',
        reason: 'Reading in context reinforces vocabulary and grammar naturally — even short stories help',
        page: 'reading',
        icon: BookOpen,
        gradient: 'from-primary-400 to-primary-600',
        priority: 7,
      });
    }

    // ── 6. TYPING — Build muscle memory ──
    if (kanaPercent >= 50) {
      const typingSessions = await query<{ count: number }>(
        `SELECT COUNT(*) as count FROM typing_sessions WHERE user_id = $1`,
        [userId]
      );
      if ((typingSessions[0]?.count ?? 0) < 5) {
        recs.push({
          title: 'Typing Practice',
          reason: 'Typing in Japanese builds automatic kana recognition — try a few short sessions',
          page: 'typing',
          icon: PenLine,
          gradient: 'from-gold-400 to-gold-600',
          priority: 8,
        });
      }
    }

    // ── 7. STREAK MOTIVATION ──
    if (streakDays > 0 && stats.reviewedToday === 0 && stats.learnedToday === 0) {
      // User hasn't studied today but has a streak to protect
      recs.push({
        title: `Protect your ${streakDays}-day streak!`,
        reason: 'Even a quick 5-minute session keeps your streak alive and your memory fresh',
        page: stats.dueCards > 0 ? 'review' : 'hiragana',
        icon: Flame,
        gradient: 'from-gold-400 to-sakura-500',
        priority: 0, // Very high priority
      });
    }

    // Sort by priority and take top 3
    recs.sort((a, b) => a.priority - b.priority);

    // Deduplicate by page
    const seen = new Set<string>();
    const unique = recs.filter(r => {
      if (seen.has(r.page)) return false;
      seen.add(r.page);
      return true;
    });

    return unique.slice(0, 3);
  }

  if (recommendations.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-2">
        Recommended Next
      </h3>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <motion.button
            key={`${rec.page}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setCurrentPage(rec.page)}
            className="w-full flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-border hover:border-accent/40 transition-all duration-200 cursor-pointer text-left group"
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${rec.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
              <rec.icon size={16} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                {rec.title}
              </p>
              <p className="text-[11px] text-text-tertiary leading-snug mt-0.5">
                {rec.reason}
              </p>
            </div>

            {/* Arrow */}
            <svg width="14" height="14" viewBox="0 0 14 14" className="text-text-tertiary mt-1 shrink-0 group-hover:text-accent transition-colors">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
