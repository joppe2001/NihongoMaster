# TODO

Active task tracking for NihongoMaster development.

## Priority Legend
- `[P0]` Critical / Blocking
- `[P1]` High priority
- `[P2]` Medium priority
- `[P3]` Nice to have

---

## Phase 1: Foundation (Complete)

- [x] `[P0]` Project scaffold (Tauri v2 + React + TypeScript)
- [x] `[P0]` SQLite database schema and migrations (3 migrations)
- [x] `[P0]` FSRS algorithm implementation (Rust, 10/10 tests passing)
- [x] `[P0]` App shell (sidebar, topbar, page routing)
- [x] `[P0]` Kana data seeding (hiragana + katakana, 142 chars, dedup-safe)
- [x] `[P1]` i18n architecture (i18next + en.json)
- [x] `[P1]` Zustand state management (3 stores)
- [x] `[P1]` Dark/light theme support (system preference)
- [x] `[P1]` Tauri SQL plugin permissions (capabilities/default.json)
- [x] `[P1]` Rust tests verified (10/10 pass)
- [x] `[P1]` TypeScript + Vite build verified (0 errors)

## Phase 2: Data Layer & SRS Integration (Complete)

- [x] `[P0]` SRS service layer (src/services/srsService.ts)
- [x] `[P0]` Wire SRS review results to SQLite (review_history + srs_cards)
- [x] `[P0]` Create SRS cards when user starts review (auto-create for all kana)
- [x] `[P1]` Calculate due cards from srs_cards table (ordered by priority)
- [x] `[P1]` Progress service layer (src/services/progressService.ts)
- [x] `[P1]` Update user_progress after each session (UPSERT)
- [x] `[P1]` Streak calculation and persistence (consecutive-day algorithm)
- [x] `[P1]` Dashboard wired to real database data
- [x] `[P1]` Progress page wired to real database data
- [x] `[P2]` XP reward system integration (review_correct + new_card_learned)
- [x] `[P2]` Migration 003: unique constraint on srs_cards

## Phase 3: Kana Modules Enhancement (Complete)

- [x] `[P1]` Stroke order animations (KanjiVG data, Web Animations API)
- [x] `[P1]` KanjiVG stroke data for all 92 basic kana (CC BY-SA 3.0)
- [x] `[P1]` Shared kana components (KanaGrid, KanaStudyCard, KanaQuiz, KanaDetailModal)
- [x] `[P1]` Duolingo-style quiz feedback (confetti, shake, bottom bar)
- [x] `[P1]` Detail modal popup on grid click
- [x] `[P1]` Canvas drawing component for kana practice (DrawingCanvas with guide overlay, undo, stroke counter)
- [x] `[P1]` "Write" practice mode in Hiragana and Katakana pages (side-by-side reference + canvas)
- [x] `[P1]` Duolingo-style multiple-choice quiz (Romaji → Kana, 4 choices)
- [x] `[P1]` Quiz mode selector (Kana → Romaji vs Romaji → Kana)
- [x] `[P1]` XP earned in quizzes (5 XP per correct answer)
- [x] `[P1]` Per-character mastery tracking (kana_mastery table, 0-5 levels)
- [x] `[P1]` Mastery visualization on kana grid (5-dot strength indicator)
- [x] `[P1]` Audio pronunciation playback (Web Speech API with AudioButton component)
- [x] `[P1]` Guided lesson system (introduce → drill → reinforce → complete, Duolingo-style)
- [x] `[P1]` Learn mode with row-by-row lesson selector (shows mastery progress per row)
- [x] `[P2]` Combination kana (33 hiragana + 33 katakana combos with row groups)
- [x] `[P2]` Progress tracking per row group (DB-backed mastery + accuracy % per row)
- [x] `[P3]` Mnemonic descriptions for each character (92 text-based memory tricks in kanaMnemonics.ts)

## Phase 4: Kanji System (Complete + Learn Mode)

- [x] `[P0]` N5 kanji dataset (103 kanji with readings, meanings, radicals, mnemonics)
- [x] `[P0]` Kanji detail modal component (character, readings, meanings, stroke count, grade, radical, mnemonic)
- [x] `[P0]` Kanji grid with JLPT level tabs (N5-N1)
- [x] `[P0]` Kanji service layer (queries, search, SRS integration)
- [x] `[P0]` Kanji seeding service (auto-seed on launch)
- [x] `[P1]` KanjiVG stroke data for 102 N5 kanji
- [x] `[P1]` Stroke animation in kanji detail modal
- [x] `[P1]` Kanji meaning quiz with feedback
- [x] `[P1]` Readings + meaning shown on grid cells (hover + always)
- [x] `[P1]` Adaptive stroke animation speed (scales with stroke count)
- [x] `[P1]` Search kanji by character, reading, or meaning
- [x] `[P1]` Add all N-level kanji to SRS button
- [x] `[P1]` Review page extended for kanji cards (meanings + readings answer)
- [x] `[P1]` Kanji -> reading quiz (type hiragana or romaji, accepts on/kun readings)
- [x] `[P1]` Reading -> kanji quiz (multiple choice, 4 options with distractors)
- [x] `[P1]` Romaji-to-hiragana conversion utility (src/lib/romajiToHiragana.ts)
- [x] `[P1]` Quiz mode selector (Meaning / Reading / Recognition)
- [x] `[P1]` Radical learning system (42 radicals with meanings, stroke counts, example kanji)
- [x] `[P2]` Kanji compound words (200+ compounds in kanji detail modal)
- [x] `[P3]` User-created mnemonics (editable in kanji + kana detail modals, saved to DB)
- [x] `[P0]` Interactive kanji lesson system (Duolingo-style teach → drill → reinforce)
- [x] `[P0]` Kanji thematic grouping (Numbers, Time, People, Nature, Actions, etc.)
- [x] `[P0]` Per-kanji mastery tracking (kanji_mastery table, migration 008, 0-5 levels)
- [x] `[P1]` Kanji "Learn" mode with group selector cards (mastery progress per group)
- [x] `[P1]` Three quiz types in lessons: meaning (type English), reading (type hiragana/romaji), recognition (MC pick kanji)
- [x] `[P1]` KanjiVG stroke data for 90 N4 kanji (fetched from official KanjiVG repo)

## Phase 5: Vocabulary & Grammar (Complete + Learn Mode)

- [x] `[P0]` N5 vocabulary dataset — batch 1 (100 essential words across 8 categories)
- [x] `[P0]` Vocabulary service layer (queries, search, POS filter, SRS integration)
- [x] `[P0]` Vocabulary seeding service (auto-seed on launch, INSERT OR IGNORE)
- [x] `[P0]` Vocabulary page (browse, search, POS filter pills, detail modal)
- [x] `[P0]` Vocabulary detail modal (word, reading, meanings, POS badge, tags)
- [x] `[P1]` Add all N5 vocab to SRS button
- [x] `[P0]` N5 vocabulary dataset — expanded to 300 words (batch 2: food, body, clothing, objects, nature, verbs, na-adj, numbers, transport, adverbs, etc.)
- [x] `[P1]` Vocabulary quiz modes (meaning, reading, multiple-choice recognition)
- [x] `[P0]` N5 grammar points dataset (40 essential patterns with examples)
- [x] `[P0]` Grammar service layer (queries, search, SRS integration)
- [x] `[P0]` Grammar seeding service (auto-seed on launch)
- [x] `[P1]` Grammar page with search, list view, detail modal (formation, examples, notes)
- [x] `[P1]` Grammar detail modal with example sentences
- [x] `[P1]` Example sentences with furigana (FuriganaText component + reading stories)
- [x] `[P2]` Sentence builder exercises (35 real-world scenarios across 8 categories)
- [x] `[P2]` Fill-in-the-blank exercises (16 particle, verb, adjective exercises)
- [x] `[P2]` Practice page with scenario filter and exercise type selector
- [x] `[P0]` **Vocab Learn mode** — Duolingo-style teach → drill → reinforce lessons
- [x] `[P0]` Vocab thematic groups (Greetings, Verbs, Adjectives, Food, Travel, etc.)
- [x] `[P0]` Per-vocab mastery tracking (vocab_mastery table, migration 009)
- [x] `[P0]` VocabLesson component (teach + meaning/reading/MC quizzes)
- [x] `[P0]` **Grammar Learn mode** — Duolingo-style teach → drill → reinforce lessons
- [x] `[P0]` Grammar topic groups (Copula, Particles, Verb Forms, Conditionals, Honorifics, etc.)
- [x] `[P0]` Per-grammar mastery tracking (grammar_mastery table, migration 009)
- [x] `[P0]` GrammarLesson component (teach + meaning/pattern/MC quizzes)
- [x] `[P1]` Grammar browse mode with mastery indicators per pattern
- [x] `[P1]` Shared lesson scheduler (bucket-based interleaving algorithm)
- [x] `[P3]` Mini reading stories (7 stories with comprehension quizzes, furigana, audio)

## Phase 6: Typing Practice Enhancement (Complete)

- [x] `[P1]` Japanese keyboard (IME) input practice mode
- [x] `[P2]` Per-character accuracy tracking (saved per session)
- [x] `[P2]` Typing session history (save to DB, History tab with stats)
- [x] `[P3]` Custom word lists (create, manage, delete — stored in DB)

## Phase 7: Dashboard & Gamification (Complete)

- [x] `[P1]` Activity heatmap (GitHub-style calendar — 26 weeks, 4-level intensity)
- [x] `[P1]` Weakest items list (cards with most lapses/lowest stability)
- [x] `[P1]` Skill breakdown charts (bar chart for Kana/Kanji/Vocab/Grammar mastery %)
- [x] `[P1]` Achievement system with unlock notifications (15 achievements, toast notifications, auto-check)
- [x] `[P2]` Goal ring component (SVG circular progress indicator)
- [x] `[P3]` Level-up animations (fullscreen XP threshold animation with auto-dismiss)

## Phase 8: Polish (Partial)

- [x] `[P1]` Onboarding wizard (5-step: welcome, name, level, goal, ready)
- [x] `[P1]` Keyboard shortcuts (Space = show answer, 1-4 = rate in review)
- [x] `[P1]` Data export/import functionality (JSON backup + file picker restore)
- [x] `[P2]` Font-size CSS fix (rem → em units with fallback for consistent scaling)
- [ ] `[P2]` Accessibility audit (VoiceOver)
- [x] `[P2]` Performance optimization (lazy-loaded pages, parallel seeding, code splitting)
- [x] `[P1]` UI overhaul: Lucide React icons replacing all emoji, glass effects, gradient accents
- [x] `[P1]` Sidebar redesign (sectioned nav, level ring, gradient logo, Lucide icons)
- [x] `[P1]` TopBar redesign (glass-morphism, Lucide stat icons, gradient JLPT badge)
- [ ] `[P3]` App icon design
- [ ] `[P3]` macOS menu bar integration

## Phase 9: Visual Redesign — "Twilight Focus" (Complete)

- [x] `[P1]` New color system: indigo-tinted neutrals replacing pure warm-blacks
- [x] `[P1]` Dark mode overhaul: bg #0F0E1A, cards #1A1830, borders #2E2B45 (visibly purple)
- [x] `[P1]` Light mode: lavender-tinted backgrounds (#F4F2FB)
- [x] `[P1]` Typography: Plus Jakarta Sans headings, Inter body, Noto Sans JP
- [x] `[P1]` Sidebar: deep indigo gradient (#13112A → #0A0918), aurora glow at top
- [x] `[P1]` Dashboard hero: gradient-hero class, aurora mesh overlay, floating JP characters
- [x] `[P1]` Stat cards: colored left borders (gold/indigo/matcha/sakura)
- [x] `[P1]` Level ring: indigo → gold gradient (sidebar + dashboard)
- [x] `[P1]` PageHeader component: aurora breathing overlay, theme-aware gradients
- [x] `[P2]` Glass effects: frosted glass with indigo tint in dark mode
- [x] `[P2]` Glow effects: accent/sakura/matcha/gold/indigo glow classes
- [x] `[P2]` Animation system: breathe, aurora, float-slow, ink-reveal, petal-float keyframes
- [x] `[P2]` Ambient background gradients on main content area
- [x] `[P2]` Dark mode card inner glow + indigo focus rings
- [x] `[P2]` Heatmap cells use indigo gradient intensity
- [x] `[P2]` Warm-tinted shadows (brown undertone, not pure black)
- [x] `[P2]` Reduced motion support for all animations
- [x] `[P2]` Visual consistency pass: all pages use semantic tokens (bg-bg-*, text-text-*)
- [ ] `[P3]` Signature "Mastery Reveal" animation (ink splash + gold ring on character mastery)

## Phase 12: Theme System & Japanese Color Themes (Complete)

- [x] `[P1]` Theme switcher infrastructure: `data-theme` attribute on `<html>` replaces media-query-only theming
- [x] `[P1]` `themeService.ts`: applies theme, listens for OS changes (system mode), smooth transition class
- [x] `[P1]` Theme persisted to SQLite (`settings` table, key = `'theme'`) and restored on startup
- [x] `[P1]` `globals.css` dark mode refactored from `@media` to `[data-theme="dark"]` selectors (backward compat fallback kept)
- [x] `[P2]` `tauri.conf.json` `beforeDevCommand` updated to kill port 1420 before starting dev server
- [x] `[P2]` `npm run tauri:dev` and `npm run kill-port` convenience scripts added to `package.json`
- [x] `[P1]` **Japanese color themes** — 4 culturally-inspired color palettes (simple CSS variable overrides)
  - **桜 Sakura** — Cherry blossom pinks, warm rose (#D66B8A accent, #FFF5F7 bg, #4A1028 sidebar)
  - **抹茶 Matcha** — Earthy greens, warm cream (#38845A accent, #F4F9F2 bg, #1A2E1A sidebar)
  - **藤 Fuji** — Wisteria purple, soft lavender (#7C5CC4 accent, #F5F0FF bg, #1E1040 sidebar)
  - **紅葉 Momiji** — Autumn maple reds, warm amber (#C45A2A accent, #FDF6F0 bg, #3A1808 sidebar)
  - Each theme overrides: bg-primary, bg-secondary, bg-sidebar, text colors, borders, accent, primary palette, gradient-sidebar, gradient-accent, gradient-hero, shadows, scrollbar, glow-accent
- [x] `[P1]` **Theme picker UI in Settings** — 3-column grid with 7 theme cards (System, Light, Dark, Sakura, Matcha, Fuji, Momiji)
  - Each card shows: mini preview (sidebar + card + accent dot), Japanese label (桜, 抹茶, etc.), description
- [x] `[P1]` Liquid Glass theme fully removed (all files, CSS, SVG filters, background components, animation variants deleted)
- [x] `[P1]` `AppSettings.theme` type: `'system' | 'light' | 'dark' | 'sakura' | 'matcha' | 'fuji' | 'momiji'`

## Phase 10: N4-N1 Data Seeding (In Progress)

### N4 Data (Partial)
- [x] `[P0]` N4 kanji dataset (170 kanji with readings, meanings, radicals, mnemonics)
- [x] `[P0]` N4 vocabulary dataset (200 words: ichidan/godan verbs, adjectives, nouns, adverbs, expressions)
- [x] `[P0]` N4 grammar patterns (35 patterns: te-compounds, conditionals, potential/passive/causative, giving/receiving, honorifics)
- [x] `[P0]` N4 kanji compounds (50+ compound words merged into kanjiCompounds.ts)
- [x] `[P0]` Seed files updated to import N4 data (seedKanji, seedVocab, seedGrammar)
- [x] `[P1]` N4 kanji stroke data (KanjiVG SVG paths for all 90 N4 kanji — fetched from official repo)
- [x] `[P1]` N4 vocabulary expansion to ~400 words (vocabN4.ts + vocabN4_extra.ts, 200 each)
- [x] `[P1]` N4 grammar expansion to ~57 patterns (grammarN4.ts: 37 + grammarN4_extra.ts: 20)
- [ ] `[P2]` N4 sentence builder exercises (~40 exercises)
- [ ] `[P2]` N4 fill-in-the-blank exercises (~20 exercises)
- [ ] `[P2]` N4 reading stories (~10 intermediate passages)

### N3 Data (Partial)
- [x] `[P0]` N3 kanji dataset (197 kanji in kanjiN3_part1.ts + kanjiN3_part2.ts + kanjiN3_part3.ts, wired into seedKanji.ts)
- [x] `[P0]` N3 kanji learn groups (30 thematic groups in kanjiGroups.ts)
- [x] `[P0]` N3 vocabulary dataset (~2,100 words in 13 part files vocabN3_part1–part13.ts, wired into seedVocab.ts)
- [x] `[P0]` N3 grammar patterns — **partial: 47 of ~150 done** (grammarN3.ts, wired into seedGrammar.ts)
- [ ] `[P1]` N3 kanji compounds + stroke data
- [ ] `[P2]` N3 sentence exercises + reading stories

### N2 Data (Partial)
- [x] `[P0]` N2 kanji dataset — **partial: 60 of ~350 kanji done** (kanjiN2_part1.ts, wired into seedKanji.ts)
- [ ] `[P0]` N2 vocabulary dataset (~2,250 words — split into multiple files)
- [x] `[P0]` N2 grammar patterns — **partial: 31 of ~170 done** (grammarN2.ts, wired into seedGrammar.ts)
- [ ] `[P1]` N2 kanji compounds + stroke data
- [ ] `[P2]` N2 sentence exercises + reading stories

### N1 Data
- [ ] `[P0]` N1 kanji dataset (~1,136 kanji — split into multiple files)
- [ ] `[P0]` N1 vocabulary dataset (~4,000 words — split into 4+ files)
- [ ] `[P0]` N1 grammar patterns (~120 patterns)
- [ ] `[P1]` N1 kanji compounds + stroke data
- [ ] `[P2]` N1 sentence exercises + reading stories

### Seeding Infrastructure
- [ ] `[P2]` Batch INSERT optimization (100 rows per statement instead of 1-by-1)
- [ ] `[P2]` Per-level count checks (skip already-seeded levels)
- [ ] `[P3]` Lazy-load higher levels (don't seed N1 if user is studying N5)
- [ ] `[P3]` Seeding progress indicator

## Phase 11: Practice Exercise System (Partial)

### Implemented
- [x] `[P0]` Conjugation Drill — MC verb form practice (masu/te/nai/ta/tai/potential)
- [x] `[P0]` Conjugation Engine — Full ichidan/godan/irregular/suru rules
- [x] `[P0]` Error Correction — Find grammar mistakes (20 exercises: particles, conjugation, adjectives)
- [x] `[P0]` Dialogue Completion — Multi-turn conversations (6 scenarios)
- [x] `[P0]` Matching Pairs — Timed card matching JP↔EN
- [x] `[P0]` Exercise Generator — Dynamic exercises from vocab/grammar data
- [x] `[P1]` Redesigned PracticePage hub (6 exercise type cards, scenario quick-start, completion screens)
- [x] `[P1]` Distractor generation for conjugation drills

### Remaining
- [ ] `[p1]` Flag questions done wrong so that student can see when they encounter something they got wrong before or multiple times
- [ ] `[P1]` Listening Comprehension — TTS audio + choose correct meaning from 4 options
- [ ] `[P1]` Translation Challenge — See English, type Japanese (multi-answer validation)
- [ ] `[P1]` Picture Description — Emoji scenes + positional vocabulary
- [ ] `[P2]` Word Formation — Combine kanji into compounds
- [ ] `[P2]` Grammar-linked practice — Drill specific grammar points
- [ ] `[P2]` "Quick Review" mode — Adaptive, pulls from weak areas
- [ ] `[P2]` Per-exercise-type accuracy tracking in progressService
- [ ] `[P3]` Sentence Production — Free-form Japanese writing

## Phase 14: Dashboard Improvements (Complete)

- [x] `[P0]` **Smart Study Guide** — replaces hardcoded "Quick Actions" with personalized recommendations
  - Analyzes: due cards, kana mastery %, skill balance (kanji/vocab/grammar vs JLPT targets), streak, recent activity, typing sessions
  - Priority system: reviews first → kana foundation → weakest skill → skill gap → practice → reading → typing → streak protection
  - Shows top 3 contextual recommendations with reasons based on language learning research
  - Dynamically adapts as student progresses
- [x] `[P0]` **Mastery dot deduction system** — wrong answers now actively reduce mastery dots
  - Net score formula: `correct - (incorrect × 2)`, floored at 0
  - Dots can go all the way back to 0 (previously clamped to minimum 1)
  - `recordQuizAnswer()` also decrements `correct_count` on wrong answer across all 4 mastery services
- [x] `[P1]` **Needs Practice accuracy fix** — see Bugs section

## Bugs & Issues

- [x] Port 1420 conflict when running `npm run tauri dev` after a previous dev session — fixed via `beforeDevCommand` kill + `npm run tauri:dev` script
- [x] "Needs Practice" section showing inaccurate items — 5 bugs fixed:
  - Recently learned cards with 0 lapses showed as "weak" (low stability ≠ weak)
  - No accuracy context: raw lapse count without total reviews
  - `learning`/`relearning` cards included despite being actively drilled by SRS
  - Single "Again" on a new card immediately made it a top weak item
  - Now requires: state=review/relearning, reps≥3, lapses>0; ranks by failure rate (lapses/reps); shows accuracy %
- [x] Dashboard showing inflated kana learned % (49% despite only ~3 rows studied) — two compounding bugs:
  - ReviewPage auto-created SRS cards for ALL 206 kana on every visit → now only creates cards for kana with mastery (studied through lessons)
  - "Learned" counted any card with `reps > 0` (even pressing "Again") → now requires `state IN ('learning', 'review') AND reps >= 2`
  - Same fix applied to progressService, achievementService, srsService
- [x] Mastery dots never going down on wrong answers — `getMasteryLevel()` only used `correct_count` with a token -1 penalty:
  - Rewritten to use **net score** formula: `correct - (incorrect × 2)`, dots now go all the way back to 0
  - `recordQuizAnswer()` on wrong answer now also decrements `correct_count` (floored at 0) — applied to all 4 mastery services

---

## Data Size Estimates

| Level | Kanji | Vocab | Grammar | Sentences | Reading | Status |
|-------|-------|-------|---------|-----------|---------|--------|
| N5    | 103   | 300   | 40      | 46        | 7       | Done   |
| N4    | 170   | 400   | 57      | 0         | 0       | Partial |
| N3    | 197   | ~2,100| 47*     | 0         | 0       | Partial |
| N2    | 60*   | 0     | 31*     | 0         | 0       | Partial |
| N1    | 0     | 0     | 0       | 0         | 0       | Planned |

*N4 vocab target: ~700. N4 grammar target: ~120. N3 grammar target: ~150. N2 kanji target: ~350. N2 grammar target: ~170.

---

## Phase 13: Audio System — Natural Japanese Pronunciation (Partial)

- [x] `[P0]` Audio generation script (`scripts/generate-audio.ts`) — Google Cloud TTS Neural2-B voice
  - Collects all kana (104+), kanji, and vocab from data files
  - Generates `.mp3` files at 0.88x rate (normal) and 0.68x (slow)
  - Output to `src-tauri/resources/audio/{kana,kanji,vocab}[_slow]/`
  - Rate limiting, skip-existing, per-type filtering flags
- [x] `[P0]` Tauri resource bundling configured (`tauri.conf.json` → `bundle.resources`)
- [x] `[P0]` `useAudio` hook rewritten to prefer local audio files via `HTMLAudioElement` + `convertFileSrc()`
  - URL + element caching for performance
  - Automatic fallback to Web Speech API for missing files or arbitrary text
- [x] `[P1]` `AudioButton` component enhanced: accepts `audioPath` prop, `showSlow` toggle (1x / 0.7x speed)
- [x] `[P1]` All 6 audio-using components updated to pass `audioPath`:
  - `KanaLesson.tsx`, `KanaDetailModal.tsx`, `KanjiLesson.tsx`, `VocabLesson.tsx`, `VocabularyPage.tsx` — local audio paths
  - `ReadingPage.tsx` — kept TTS fallback (sentences are arbitrary text)
- [x] `[P1]` Auto-play in lessons uses local audio path
- [x] `[P2]` Convenience scripts: `npm run generate-audio`, `generate-audio:kana`, etc.
- [ ] `[P1]` **PENDING**: Run `npm run generate-audio` with Google Cloud credentials to generate the actual .mp3 files
- [ ] `[P2]` Add voice/speed settings toggle to SettingsPage

Last updated: 2026-03-17 (session 21)
