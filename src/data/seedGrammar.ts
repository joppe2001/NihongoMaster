import { query, execute } from '@/lib/db';
import { GRAMMAR_N5 } from './grammarN5';
import { GRAMMAR_N4 } from './grammarN4';
import { GRAMMAR_N4_EXTRA } from './grammarN4_extra';
import { GRAMMAR_N3 } from './grammarN3';
import { GRAMMAR_N3_EXTRA } from './grammarN3_extra';
import { GRAMMAR_N2 } from './grammarN2';
import { GRAMMAR_N2_EXTRA } from './grammarN2_extra';

let seedPromise: Promise<void> | null = null;

const ALL_GRAMMAR = [...GRAMMAR_N5, ...GRAMMAR_N4, ...GRAMMAR_N4_EXTRA, ...GRAMMAR_N3, ...GRAMMAR_N3_EXTRA, ...GRAMMAR_N2, ...GRAMMAR_N2_EXTRA];

export async function seedGrammarData(): Promise<void> {
  if (!seedPromise) {
    seedPromise = doSeed();
  }
  return seedPromise;
}

async function doSeed(): Promise<void> {
  const existing = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM grammar_points'
  );

  if ((existing[0]?.count ?? 0) >= ALL_GRAMMAR.length) {
    return;
  }

  for (const g of ALL_GRAMMAR) {
    await execute(
      `INSERT OR IGNORE INTO grammar_points
        (pattern, jlpt_level, meaning, formation, examples, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        g.pattern,
        g.jlptLevel,
        JSON.stringify(g.meaning),
        g.formation,
        JSON.stringify(g.examples),
        g.notes,
      ]
    );
  }
}
