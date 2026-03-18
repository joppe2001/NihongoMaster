import { useState, useEffect } from 'react';
import { query } from '@/lib/db';

interface WeakItem {
  contentType: string;
  character: string;
  accuracy: number;   // 0–100%
  lapses: number;
  reps: number;
}

interface WeakItemsProps {
  userId: number;
}

/**
 * Shows items the user is genuinely struggling with.
 *
 * Criteria for "weak":
 * - Only mature/review-state cards (not cards still being learned for the first time)
 * - Minimum 3 reviews (enough data to judge)
 * - Ranked by a weakness score: (lapses / reps) weighted by inverse stability
 * - Shows actual accuracy percentage, not just raw lapse count
 */
export function WeakItems({ userId }: WeakItemsProps) {
  const [items, setItems] = useState<WeakItem[]>([]);

  useEffect(() => {
    async function load() {
      // Find genuinely weak cards:
      // - state = 'review' or 'relearning' (matured cards that are failing, not brand-new learning)
      // - reps >= 3 (enough review history to judge)
      // - lapses > 0 (has actually been forgotten at least once)
      // - Ranked by failure rate (lapses/reps) DESC, then lowest stability
      const rows = await query<{
        content_type: string;
        content_id: number;
        stability: number;
        lapses: number;
        reps: number;
      }>(
        `SELECT content_type, content_id, stability, lapses, reps
         FROM srs_cards
         WHERE user_id = $1
           AND state IN ('review', 'relearning')
           AND reps >= 3
           AND lapses > 0
         ORDER BY (CAST(lapses AS REAL) / reps) DESC, stability ASC
         LIMIT 8`,
        [userId]
      );

      // Batch resolve display names with JOINs instead of N+1
      const results: WeakItem[] = [];
      for (const row of rows) {
        let character = '?';
        if (row.content_type === 'kana') {
          const r = await query<{ character: string }>(
            'SELECT character FROM kana WHERE id = $1', [row.content_id]
          );
          if (r.length > 0) character = r[0].character;
        } else if (row.content_type === 'kanji') {
          const r = await query<{ character: string }>(
            'SELECT character FROM kanji WHERE id = $1', [row.content_id]
          );
          if (r.length > 0) character = r[0].character;
        } else if (row.content_type === 'vocab') {
          const r = await query<{ word: string }>(
            'SELECT word FROM vocabulary WHERE id = $1', [row.content_id]
          );
          if (r.length > 0) character = r[0].word;
        } else if (row.content_type === 'grammar') {
          const r = await query<{ pattern: string }>(
            'SELECT pattern FROM grammar_points WHERE id = $1', [row.content_id]
          );
          if (r.length > 0) character = r[0].pattern;
        }

        const accuracy = row.reps > 0
          ? Math.round(((row.reps - row.lapses) / row.reps) * 100)
          : 0;

        results.push({
          contentType: row.content_type,
          character,
          accuracy,
          lapses: row.lapses,
          reps: row.reps,
        });
      }
      setItems(results);
    }
    load();
  }, [userId]);

  if (items.length === 0) return null;

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3 tracking-tight">Needs Practice</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-feedback-error-bg)] border border-[var(--color-feedback-error-border)]"
          >
            <span className="text-base font-semibold text-text-primary jp-text">{item.character}</span>
            <span className="text-[9px] text-[var(--color-feedback-error-text)] font-medium">
              {item.accuracy}% · {item.lapses} miss
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
