import { query, execute } from '@/lib/db';

export interface CustomWordList {
  id: number;
  name: string;
  words: { japanese: string; romaji: string; meaning: string }[];
  createdAt: string;
}

export async function getWordLists(userId: number): Promise<CustomWordList[]> {
  const rows = await query<{ id: number; name: string; words: string; created_at: string }>(
    'SELECT id, name, words, created_at FROM custom_word_lists WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    words: JSON.parse(r.words),
    createdAt: r.created_at,
  }));
}

export async function createWordList(
  userId: number,
  name: string,
  words: { japanese: string; romaji: string; meaning: string }[]
): Promise<number> {
  const result = await execute(
    'INSERT INTO custom_word_lists (user_id, name, words) VALUES ($1, $2, $3)',
    [userId, name, JSON.stringify(words)]
  );
  return result.lastInsertId;
}

export async function deleteWordList(id: number): Promise<void> {
  await execute('DELETE FROM custom_word_lists WHERE id = $1', [id]);
}

/**
 * Parse a raw text input into word entries.
 * Expected format: one word per line, "japanese|romaji|meaning"
 */
export function parseWordListText(text: string): { japanese: string; romaji: string; meaning: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      return {
        japanese: parts[0] ?? '',
        romaji: parts[1] ?? '',
        meaning: parts[2] ?? '',
      };
    })
    .filter((w) => w.japanese && w.romaji);
}
