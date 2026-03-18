import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

/**
 * Get or initialize the SQLite database connection.
 * Uses a singleton promise to prevent concurrent initialization
 * (React StrictMode calls useEffect twice in dev).
 */
export async function getDatabase(): Promise<Database> {
  if (db) return db;

  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      const database = await Database.load('sqlite:nihongo-master.db');
      await runMigrations(database);
      db = database;
      return database;
    })();
  }

  return dbInitPromise;
}

/**
 * Run database migrations to ensure schema is up to date.
 * Each statement is executed individually since the Tauri SQL
 * plugin does not support multi-statement execution.
 */
async function runMigrations(database: Database): Promise<void> {
  // Create migrations tracking table
  await database.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )`
  );

  // Define all migrations in order
  const allMigrations: { name: string; statements: string[] }[] = [
    { name: '001_initial_schema', statements: MIGRATION_001_STATEMENTS },
    { name: '002_deduplicate_kana', statements: MIGRATION_002_STATEMENTS },
    { name: '003_srs_cards_unique', statements: MIGRATION_003_STATEMENTS },
    { name: '004_kana_mastery', statements: MIGRATION_004_STATEMENTS },
    { name: '005_vocab_grammar_unique', statements: MIGRATION_005_STATEMENTS },
    { name: '006_user_mnemonics', statements: MIGRATION_006_STATEMENTS },
    { name: '007_custom_word_lists', statements: MIGRATION_007_STATEMENTS },
    { name: '008_kanji_mastery', statements: MIGRATION_008_STATEMENTS },
    { name: '009_vocab_grammar_mastery', statements: MIGRATION_009_STATEMENTS },
    { name: '010_sentence_bank', statements: MIGRATION_010_STATEMENTS },
  ];

  for (const migration of allMigrations) {
    const existing = await database.select<{ name: string }>(
      "SELECT name FROM _migrations WHERE name = $1",
      [migration.name]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      continue; // Already applied
    }

    for (const stmt of migration.statements) {
      await database.execute(stmt);
    }

    await database.execute(
      "INSERT OR IGNORE INTO _migrations (name) VALUES ($1)",
      [migration.name]
    );
  }
}

// ============================================================
// Migration 001: Individual statements
// ============================================================
const MIGRATION_001_STATEMENTS: string[] = [
  // -- Tables --
  `CREATE TABLE IF NOT EXISTS languages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
  )`,

  `CREATE TABLE IF NOT EXISTS jlpt_levels (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    kanji_count INTEGER,
    vocab_count INTEGER,
    grammar_count INTEGER
  )`,

  `CREATE TABLE IF NOT EXISTS kana (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    type TEXT NOT NULL,
    romaji TEXT NOT NULL,
    row_group TEXT NOT NULL,
    stroke_count INTEGER DEFAULT 0,
    stroke_order_svg TEXT,
    audio_file TEXT,
    sort_order INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS kanji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL UNIQUE,
    stroke_count INTEGER DEFAULT 0,
    stroke_order_svg TEXT,
    jlpt_level INTEGER REFERENCES jlpt_levels(id),
    grade INTEGER,
    frequency_rank INTEGER,
    radical TEXT,
    radical_names TEXT DEFAULT '[]',
    on_readings TEXT DEFAULT '[]',
    kun_readings TEXT DEFAULT '[]',
    meanings TEXT DEFAULT '{}',
    mnemonic TEXT,
    similar_kanji TEXT DEFAULT '[]'
  )`,

  `CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    reading TEXT NOT NULL,
    jlpt_level INTEGER REFERENCES jlpt_levels(id),
    part_of_speech TEXT,
    meanings TEXT NOT NULL DEFAULT '{}',
    example_sentences TEXT DEFAULT '[]',
    audio_file TEXT,
    tags TEXT DEFAULT '[]',
    frequency_rank INTEGER
  )`,

  `CREATE TABLE IF NOT EXISTS grammar_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,
    jlpt_level INTEGER REFERENCES jlpt_levels(id),
    meaning TEXT NOT NULL DEFAULT '{}',
    formation TEXT NOT NULL DEFAULT '',
    examples TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    related_grammar TEXT DEFAULT '[]'
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    source_language TEXT DEFAULT 'en',
    current_level INTEGER DEFAULT 5,
    daily_goal_minutes INTEGER DEFAULT 15,
    new_cards_per_day INTEGER DEFAULT 20,
    xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_study_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS srs_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    state TEXT DEFAULT 'new',
    due_date TEXT NOT NULL DEFAULT (datetime('now')),
    stability REAL DEFAULT 0,
    difficulty REAL DEFAULT 0,
    elapsed_days INTEGER DEFAULT 0,
    scheduled_days INTEGER DEFAULT 0,
    reps INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,
    last_review TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS review_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER REFERENCES srs_cards(id),
    rating INTEGER NOT NULL,
    review_time TEXT DEFAULT (datetime('now')),
    elapsed_ms INTEGER DEFAULT 0,
    state_before TEXT,
    state_after TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    date TEXT NOT NULL,
    cards_reviewed INTEGER DEFAULT 0,
    cards_learned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    accuracy_percent REAL DEFAULT 0,
    xp_earned INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    achievement_key TEXT NOT NULL,
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, achievement_key)
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS typing_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    mode TEXT NOT NULL,
    words_per_minute REAL DEFAULT 0,
    accuracy REAL DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed_at TEXT DEFAULT (datetime('now'))
  )`,

  // -- Indexes --
  `CREATE INDEX IF NOT EXISTS idx_srs_cards_due ON srs_cards(due_date, state)`,
  `CREATE INDEX IF NOT EXISTS idx_srs_cards_user ON srs_cards(user_id, content_type)`,
  `CREATE INDEX IF NOT EXISTS idx_review_history_card ON review_history(card_id, review_time)`,
  `CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(user_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt_level)`,
  `CREATE INDEX IF NOT EXISTS idx_vocabulary_jlpt ON vocabulary(jlpt_level)`,
  `CREATE INDEX IF NOT EXISTS idx_grammar_jlpt ON grammar_points(jlpt_level)`,
  `CREATE INDEX IF NOT EXISTS idx_kana_type ON kana(type, sort_order)`,

  // -- Seed: languages --
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('en', 'English', 'English', 'en')`,
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('es', 'Spanish', 'Español', 'es')`,
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('fr', 'French', 'Français', 'fr')`,
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('de', 'German', 'Deutsch', 'de')`,
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('zh', 'Chinese', '中文', 'zh')`,
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('ko', 'Korean', '한국어', 'ko')`,
  `INSERT OR IGNORE INTO languages (id, name, native_name, code) VALUES ('pt', 'Portuguese', 'Português', 'pt')`,

  // -- Seed: JLPT levels --
  `INSERT OR IGNORE INTO jlpt_levels (id, name, description, kanji_count, vocab_count, grammar_count) VALUES (5, 'N5', 'Beginner - Basic Japanese', 100, 800, 80)`,
  `INSERT OR IGNORE INTO jlpt_levels (id, name, description, kanji_count, vocab_count, grammar_count) VALUES (4, 'N4', 'Elementary - Daily life Japanese', 300, 1500, 200)`,
  `INSERT OR IGNORE INTO jlpt_levels (id, name, description, kanji_count, vocab_count, grammar_count) VALUES (3, 'N3', 'Intermediate - General topics', 650, 3750, 350)`,
  `INSERT OR IGNORE INTO jlpt_levels (id, name, description, kanji_count, vocab_count, grammar_count) VALUES (2, 'N2', 'Upper Intermediate - Complex texts', 1000, 6000, 250)`,
  `INSERT OR IGNORE INTO jlpt_levels (id, name, description, kanji_count, vocab_count, grammar_count) VALUES (1, 'N1', 'Advanced - Near-native level', 2136, 10000, 200)`,
];

// ============================================================
// Migration 002: Deduplicate kana + add unique constraint
// ============================================================
const MIGRATION_002_STATEMENTS: string[] = [
  // Delete duplicate rows, keeping only the one with the lowest id per (character, type)
  `DELETE FROM kana WHERE id NOT IN (SELECT MIN(id) FROM kana GROUP BY character, type)`,
  // Add unique index to prevent future duplicates
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_kana_unique_char_type ON kana(character, type)`,
];

// ============================================================
// Migration 003: Unique constraint on srs_cards per user+content
// ============================================================
const MIGRATION_003_STATEMENTS: string[] = [
  // Remove any duplicate srs_cards (keep lowest id)
  `DELETE FROM srs_cards WHERE id NOT IN (SELECT MIN(id) FROM srs_cards GROUP BY user_id, content_type, content_id)`,
  // Prevent duplicate cards per user per content item
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_srs_cards_unique ON srs_cards(user_id, content_type, content_id)`,
];

// Migration 005: Unique constraints on vocabulary and grammar_points to prevent duplicates
// ============================================================
const MIGRATION_005_STATEMENTS: string[] = [
  // Remove duplicate vocabulary entries (keep lowest id)
  `DELETE FROM vocabulary WHERE id NOT IN (SELECT MIN(id) FROM vocabulary GROUP BY word, reading)`,
  // Prevent future duplicates
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_unique ON vocabulary(word, reading)`,
  // Remove duplicate grammar entries (keep lowest id)
  `DELETE FROM grammar_points WHERE id NOT IN (SELECT MIN(id) FROM grammar_points GROUP BY pattern, jlpt_level)`,
  // Prevent future duplicates
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_grammar_unique ON grammar_points(pattern, jlpt_level)`,
];

// Migration 004: Kana mastery tracking for quiz XP and per-character progress
// ============================================================
const MIGRATION_004_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS kana_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    kana_id INTEGER REFERENCES kana(id),
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_correct_at TEXT,
    last_incorrect_at TEXT,
    UNIQUE(user_id, kana_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_kana_mastery_user ON kana_mastery(user_id, kana_id)`,
];

// Migration 006: User-created mnemonics
const MIGRATION_006_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS user_mnemonics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    mnemonic_text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, content_type, content_id)
  )`,
];

// Migration 007: Custom word lists for typing
const MIGRATION_007_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS custom_word_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    words TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
];

// Migration 008: Kanji mastery tracking (per-character, mirrors kana_mastery)
const MIGRATION_008_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS kanji_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    kanji_id INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_correct_at TEXT,
    last_incorrect_at TEXT,
    UNIQUE(user_id, kanji_id)
  )`,
];

// Migration 009: Vocab + Grammar mastery tracking
const MIGRATION_009_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS vocab_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    vocab_id INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_correct_at TEXT,
    last_incorrect_at TEXT,
    UNIQUE(user_id, vocab_id)
  )`,
  `CREATE TABLE IF NOT EXISTS grammar_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    grammar_id INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_correct_at TEXT,
    last_incorrect_at TEXT,
    UNIQUE(user_id, grammar_id)
  )`,
];

const MIGRATION_010_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS sentence_bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    japanese TEXT NOT NULL,
    reading TEXT NOT NULL,
    english TEXT NOT NULL,
    jlpt_level INTEGER NOT NULL DEFAULT 5,
    grammar_points TEXT DEFAULT '[]',
    vocab_ids TEXT DEFAULT '[]',
    scenario TEXT,
    source TEXT DEFAULT 'curated',
    difficulty INTEGER DEFAULT 1,
    UNIQUE(japanese)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sentence_bank_level ON sentence_bank(jlpt_level)`,
  `CREATE INDEX IF NOT EXISTS idx_sentence_bank_source ON sentence_bank(source)`,
];

/**
 * Execute a SELECT query and return results.
 * The Tauri SQL plugin select() returns T[] directly.
 */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getDatabase();
  const result = await database.select<T>(sql, params);
  // select() returns T which is actually an array of rows
  return result as T[];
}

/**
 * Execute an INSERT/UPDATE/DELETE statement.
 */
export async function execute(sql: string, params: unknown[] = []): Promise<{ rowsAffected: number; lastInsertId: number }> {
  const database = await getDatabase();
  const result = await database.execute(sql, params);
  return {
    rowsAffected: result.rowsAffected ?? 0,
    lastInsertId: result.lastInsertId ?? 0,
  };
}
