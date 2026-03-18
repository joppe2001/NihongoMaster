import { query } from '@/lib/db';
import { createCards } from './srsService';
import type { JlptLevelId } from '@/lib/types';

export interface GrammarDetail {
  id: number;
  pattern: string;
  jlptLevel: number;
  meaning: Record<string, string>;
  formation: string;
  examples: { japanese: string; reading: string; translations: Record<string, string> }[];
  notes: string | null;
}

interface GrammarRow {
  id: number;
  pattern: string;
  jlpt_level: number;
  meaning: string;
  formation: string;
  examples: string;
  notes: string | null;
}

function rowToGrammar(row: GrammarRow): GrammarDetail {
  return {
    id: row.id,
    pattern: row.pattern,
    jlptLevel: row.jlpt_level,
    meaning: JSON.parse(row.meaning || '{}'),
    formation: row.formation,
    examples: JSON.parse(row.examples || '[]'),
    notes: row.notes,
  };
}

export async function getGrammarByLevel(level: JlptLevelId): Promise<GrammarDetail[]> {
  const rows = await query<GrammarRow>(
    'SELECT * FROM grammar_points WHERE jlpt_level = $1 ORDER BY id ASC',
    [level]
  );
  return rows.map(rowToGrammar);
}

export async function searchGrammar(searchQuery: string): Promise<GrammarDetail[]> {
  const q = `%${searchQuery}%`;
  const rows = await query<GrammarRow>(
    `SELECT * FROM grammar_points
     WHERE pattern LIKE $1
        OR meaning LIKE $1
        OR formation LIKE $1
        OR examples LIKE $1
     ORDER BY id ASC
     LIMIT 50`,
    [q]
  );
  return rows.map(rowToGrammar);
}

export async function getGrammarById(id: number): Promise<GrammarDetail | null> {
  const rows = await query<GrammarRow>(
    'SELECT * FROM grammar_points WHERE id = $1',
    [id]
  );
  return rows.length > 0 ? rowToGrammar(rows[0]) : null;
}

export async function startStudyingGrammarLevel(
  userId: number,
  level: JlptLevelId
): Promise<void> {
  const grammar = await getGrammarByLevel(level);
  const ids = grammar.map((g) => g.id);
  await createCards(userId, 'grammar', ids);
}
