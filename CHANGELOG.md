# Changelog

All notable changes to NihongoMaster will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Typing Practice: show/hide expected answer toggle** — new "Expected Answer" setting on Japanese typing mode setup screen lets users hide the Japanese text to type from memory instead
- **Smart Study Guide on dashboard** — replaces hardcoded "Quick Actions" with personalized, data-driven recommendations
  - Analyzes due cards, kana mastery, skill balance, streak, and recent activity
  - Prioritizes based on language learning research: SRS reviews first, kana foundation, balanced skills, active recall, progressive difficulty
  - Shows up to 3 contextual recommendations with explanations (e.g., "Vocabulary is your least practiced area at 12%")
  - Streak protection prompt when user hasn't studied today
  - Suggests reading/typing only when prerequisites are met (sufficient vocab/kana)

- **Mastery dot system now deducts progress on wrong answers** — complete rewrite of scoring:
  - Old: `correct_count` only went up; wrong answers just incremented a separate counter with a token -1 level penalty (capped)
  - New: Uses a **net score** formula: `correct - (incorrect × 2)`. Each wrong answer costs 3 effective points (−1 deducted from correct_count + −2 weight in formula). Dots can now go all the way back to 0.
  - Thresholds: 0→L0, 1-2→L1 (seen), 3-5→L2 (familiar), 6-10→L3 (intermediate), 11-17→L4 (advanced), 18+→L5 (mastered)
  - `recordQuizAnswer()` on wrong answer now also decrements `correct_count` by 1 (floored at 0) — applied across all 4 mastery services (kana, kanji, vocab, grammar)
  - Example: 3 correct + 2 wrong = net 3−4=0 → level 0 (back to start). Previously this showed 2 dots.

### Changed
- **All exercises now stop on wrong answers, explain the correct answer, and require Continue** — universal pattern applied across all exercise types:
  - **ParticleMaster**: removed 1.2s auto-advance on wrong; now shows correct particle + full sentence, requires Continue button (Enter)
  - **ConjugationDrill**: removed 2.7s auto-advance; now shows correct conjugated form + verb→form explanation, requires Continue
  - **ErrorCorrection**: removed 4s auto-advance on wrong; keeps existing explanation but adds explicit Continue button
  - **DialogueCompletion**: was the worst — never showed correct answer; now stops, shows correct response in green, shows strikethrough on wrong answer, requires Continue
  - **MatchingPairs**: on wrong match, now shows a hint with both correct pairings for 1.8s (e.g., "猫 = cat · 犬 = dog") instead of just a 0.6s red flash
  - **PracticePage parent**: removed redundant 800ms/1500ms delay timers since components now handle their own flow
  - KanaLesson, KanjiLesson, VocabLesson, SentenceBuilder, FillInTheBlank, TranslationChallenge, Japanese Typing — already had correct stop+continue behavior, no changes needed

### Fixed
- **"Needs Practice" section showing inaccurate items** — complete rewrite of `WeakItems.tsx`:
  - Now only shows **mature cards** (`state = 'review'` or `'relearning'`) — excludes cards still being actively learned for the first time
  - Requires **minimum 3 reviews** before judging a card as weak — no more single "Again" triggering a top weak item
  - Requires **at least 1 lapse** — low stability alone (e.g., freshly learned card with perfect accuracy) no longer counts as "weak"
  - Ranked by **failure rate** (`lapses / reps` DESC) instead of raw lapse count — 3 misses out of 3 reviews ranks higher than 3 misses out of 100
  - Displays **accuracy percentage** alongside miss count (e.g., "67% · 2 miss" instead of just "2 miss" or "weak")

## [2.1.0] - 2026-03-17

### Added
- **High-quality Japanese pronunciation audio system** using Google Cloud Text-to-Speech (Neural2-B voice)
  - `scripts/generate-audio.ts`: Build-time script that generates `.mp3` files for all kana, kanji, and vocabulary from data files. Supports `--type=kana|kanji|vocab`, `--slow`, `--skip-existing` flags.
  - Audio files are bundled with the Tauri app in `src-tauri/resources/audio/` — fully offline, no network needed at runtime
  - `useAudio` hook rewritten: prefers local pre-generated files via `HTMLAudioElement` + Tauri's `convertFileSrc()` asset protocol; automatic fallback to Web Speech API for arbitrary text or missing files
  - URL and `HTMLAudioElement` caching for zero-allocation repeat plays
  - `AudioButton` component enhanced with optional `audioPath` prop and `showSlow` speed toggle (1x / 0.7x)
  - Slow speed variants stored in `*_slow/` directories with 0.68x speaking rate
  - `kanaAudioPath()`, `kanjiAudioPath()`, `vocabAudioPath()` helper functions auto-detect kana type from Unicode codepoint
  - All lesson components (KanaLesson, KanjiLesson, VocabLesson) and browse pages (VocabularyPage, KanaDetailModal) now pass `audioPath` for local audio. ReadingPage stays on TTS fallback for sentences.
  - `package.json` convenience scripts: `npm run generate-audio`, `generate-audio:kana`, etc.

## [2.0.1] - 2026-03-17

### Fixed
- **Dashboard kana progress showing inflated percentage** (e.g., 49% despite only ~3 rows studied) — two compounding bugs:
  - `ReviewPage.tsx`: Auto-created SRS cards for ALL 206 kana (including unstudied dakuten/combos) on every Review page visit. Now only creates cards for kana the user has actually studied through lessons (checked via `kana_mastery.correct_count > 0`).
  - `progressService.ts`: Counted any SRS card with `reps > 0` as "learned" — even pressing "Again" (complete fail) once counted. Now requires the card to be in `'learning'` or `'review'` state with `reps >= 2` (survived initial learning phase).
  - Same `reps > 0` → `state IN ('learning','review') AND reps >= 2` fix applied to `achievementService.ts` and `srsService.ts` `getCardCounts()`.

## [2.0.0] - 2026-03-16

### Added
- **Japanese color themes** — 4 culturally-inspired color palettes, each a simple set of CSS variable overrides:
  - **桜 Sakura** — Cherry blossom pinks, warm rose sidebar, pink accent
  - **抹茶 Matcha** — Earthy tea ceremony greens, cream background, green accent
  - **藤 Fuji** — Wisteria purple, soft lavender background, purple accent
  - **紅葉 Momiji** — Autumn maple reds, warm amber background, orange-red accent
  - Each theme overrides all semantic tokens (bg-primary, bg-secondary, bg-sidebar, text colors, borders, accent colors, gradient-sidebar, gradient-accent, gradient-hero, shadows, scrollbar, glow-accent)
- Theme picker in Settings now shows a 3-column grid with 7 options — each card has a mini preview, Japanese label, and description
- `AppSettings.theme` type now: `'system' | 'light' | 'dark' | 'sakura' | 'matcha' | 'fuji' | 'momiji'`

### Removed
- **Liquid Glass theme** — completely removed (all files, CSS, SVG filters, background components, animation variants)
  - Deleted `LiquidGlassFilters.tsx`, `LiquidGlassBackground.tsx`, `liquid-glass.css`
  - Removed all Liquid Glass-specific animation variants from `animations.ts`
  - Removed all LG-conditional logic from `App.tsx` and `Sidebar.tsx`

## [1.6.0] - 2026-03-16

### Added
- **Full theme switching system** — explicit `data-theme` attribute on `<html>` drives all theming; replaces previous media-query-only approach
  - `src/services/themeService.ts`: `applyTheme()`, `initializeTheme()`, OS-preference listener for system mode, smooth `theme-transitioning` class
  - Theme persists to SQLite (`settings` table) and is restored before first render on app launch
  - `AppSettings.theme` extended to `'system' | 'light' | 'dark' | 'liquid-glass'`
- **Liquid Glass theme** — Apple visionOS / iOS 26 inspired glass aesthetic
  - `LiquidGlassFilters.tsx`: hidden SVG `<defs>` with `feTurbulence` + `feDisplacementMap` refraction filters (subtle 6px scale + strong 14px scale), chromatic aberration, specular gradient definitions
  - `LiquidGlassBackground.tsx`: animated 6-layer backdrop — deep gradient base, 4 drifting color blobs (violet, rose, teal, gold) with `mix-blend-mode: multiply/screen`, noise texture overlay, rotating conic caustic light — entirely CSS keyframe driven
  - `src/styles/themes/liquid-glass.css` (500+ lines):
    - CSS custom properties for all glass physics (`--lg-blur: 28px`, `--lg-saturation: 1.8`, `--lg-specular`, chromatic dispersion RGBA colors, animation timings)
    - `.lg-surface`, `.lg-card`, `.lg-modal`, `.lg-pill` with `backdrop-filter: blur() saturate()`, gradient background, specular box-shadow inset
    - `::before` specular highlight with `lg-specular-breathe` animation (breathing top-edge catchlight)
    - `::after` shimmer sweep across glass surface with `lg-shimmer` animation
    - Chromatic iridescent edge dispersion via `conic-gradient` mask on hover
    - Auto dark sub-variant (`@media (prefers-color-scheme: dark)` inside `[data-theme="liquid-glass"]`)
    - Glass overrides for inputs, selects, textareas, toggle buttons
    - PageHeader glass treatment (frosted indigo gradient with specular highlight)
    - Achievement notification gold glass toast
    - `@media (prefers-reduced-motion: reduce)` disables all blob drift, shimmer, specular, caustic animations
    - `html.theme-transitioning *` smooth 500ms cross-theme property transitions
  - Page transitions adapt per theme: Liquid Glass uses blur + scale animation; other themes use standard fade
- **Liquid Glass animation variants** in `src/lib/animations.ts`: `liquidGlassEntrance`, `liquidGlassCardStagger`, `liquidGlassPageTransition`, `liquidGlassHover`, `liquidGlassPulse`
- **Theme picker in Settings page** — new "Theme" section with 4 animated mini-preview cards
  - Each card shows a live color mockup (sidebar strip + card rectangle) with Liquid Glass blob preview
  - Selection persists immediately to SQLite via `INSERT OR REPLACE`
- Convenience scripts: `npm run tauri:dev` (auto-kills stale port 1420 before starting), `npm run kill-port`

### Fixed
- `npm run tauri dev` failing with "Port 1420 is already in use" when a previous dev session was still running — `beforeDevCommand` in `tauri.conf.json` now kills stale port 1420 processes before starting Vite

### Changed
- `globals.css` dark mode refactored from `@media (prefers-color-scheme: dark) { @theme { ... } }` to `[data-theme="dark"] { ... }` selectors (with fallback for users with no saved theme preference)
- `userStore.ts` `updateSettings()` now calls `applyTheme()` immediately on any theme change

## [1.5.0] - 2026-03-16

### Added
- **Interactive kanji lesson system** — Duolingo-style guided learning with teach → drill → reinforce cycle
  - `KanjiLesson.tsx` component with stroke animation teach steps, 3 quiz types (meaning, reading, recognition)
  - Thematic groups (~5 kanji per group: Numbers, Time, People, Nature, Actions, etc.)
  - Group selector with mastery progress bars, accuracy tracking, completion indicators
  - Per-kanji mastery tracking via `kanji_mastery` DB table (migration 008)
  - `kanjiMasteryService.ts` for recording quiz answers, XP awards, and mastery levels
  - `kanjiGroups.ts` with 21 N5 groups and 23 N4 groups
- **N4 JLPT data expansion**
  - 170 N4 kanji with readings, meanings, radicals, mnemonics
  - 700 N4 vocabulary words (verbs, adjectives, nouns, adverbs, expressions, onomatopoeia, counters)
  - 55 N4 grammar patterns (te-compounds, conditionals, potential/passive/causative, honorifics, and more)
  - 50+ N4 kanji compound words merged into kanjiCompounds.ts
  - KanjiVG stroke data for all 90 N4 kanji (fetched from official KanjiVG repository)
- **Visual redesign — "Twilight Focus"**
  - Indigo-tinted neutral palette replacing warm-black (dark bg: #0F0E1A, cards: #1A1830)
  - Lavender-tinted light mode (#F4F2FB)
  - Plus Jakarta Sans headings, Inter body, Noto Sans JP fonts
  - Aurora glow effects on sidebar, PageHeader breathing overlays
  - Indigo→gold level ring gradients
  - Ambient background gradient orbs on main content
  - Dark mode card inner glow, indigo focus rings, indigo scrollbars
- **Vocabulary Learn mode** — Duolingo-style guided vocab lessons
  - `VocabLesson.tsx` with teach step (word, reading, audio, POS) + meaning/reading/MC quizzes
  - Thematic groups by tags/POS (Greetings, Verbs, Adjectives, Food, Travel, etc.)
  - `vocabMasteryService.ts` for per-word mastery tracking + XP
  - Group selector with mastery progress bars on VocabularyPage
- **Grammar Learn mode** — Duolingo-style guided grammar lessons
  - `GrammarLesson.tsx` with teach step (pattern, formation, examples, notes) + meaning/pattern/MC quizzes
  - Topic groups (Copula, Particles, Verb Forms, Conditionals, Honorifics, etc.)
  - `grammarMasteryService.ts` for per-pattern mastery tracking + XP
  - Group selector + mastery indicators on grammar list items
  - Browse mode now shows mastery dots on each grammar pattern
- **Shared lesson scheduler** (`lessonScheduler.ts`) — Bucket-based interleaving algorithm
  - Failed items re-appear within 1-2 steps, new items within 2-3 steps
  - Exercise types escalate: recognition → recall → production
  - Reusable across kanji, vocab, and grammar lessons
- **DB Migration 009** — `vocab_mastery` + `grammar_mastery` tables
- **Practice exercises overhaul** — 6 exercise types (up from 2)
  - `ConjugationDrill` — verb form practice (ます, て, ない, た, たい, potential) with MC options
  - `ErrorCorrection` — Find grammar mistakes in sentences (20 exercises, particle/conjugation/adjective errors)
  - `DialogueCompletion` — Multi-turn conversations (restaurant, directions, shopping, doctor, meeting, plans)
  - `MatchingPairs` — Timed card matching (Japanese ↔ English)
  - Redesigned PracticePage hub with exercise type cards, scenario quick-start, drill completion screens
  - `conjugationEngine.ts` — Full verb conjugation engine (ichidan, godan, irregular, する compounds)
  - `exerciseGenerator.ts` — Dynamic exercise generation from existing vocab/grammar data

## [1.4.0] - 2026-03-16

### Added
- **Lucide React icon system** — replaced all emoji icons across the entire app
  - `lucide-react` installed (1,703 icons, tree-shakable, MIT)
  - `src/lib/icons.ts` — centralized icon mapping with re-exports
  - Japanese characters (あ, ア, 漢, 語, 文) preserved as culturally authentic nav text alongside Lucide icons
- **Sidebar redesign**
  - Gradient background (from-bg-sidebar to-bg-primary)
  - Gradient logo button (indigo → sakura)
  - Sectioned navigation: "Learn" (kana, kanji, vocab, grammar) + "Practice" (practice, reading, typing, review)
  - Section labels with uppercase tracking
  - Active indicator: rounded pill instead of thin line
  - Level progress ring around user avatar (SVG circular progress)
  - XP display with level number
- **TopBar redesign**
  - Glass-morphism effect (backdrop-blur-16px)
  - Lucide icons for streak (Flame) and XP (Zap) with pill containers
  - Gradient JLPT level badge (green for N5, blue for N4, etc.)
  - Refined spacing and typography
- **Design system utilities** in globals.css
  - `.glass` — backdrop-blur + semi-transparent bg (light + dark mode)
  - `.shadow-soft` / `.shadow-lifted` — subtle depth effects
  - `.gradient-accent` — indigo-to-sakura gradient
  - `.gradient-text` — gradient text with background-clip

## [1.3.0] - 2026-03-16

### Added
- **Performance optimization**
  - All 12 page components lazy-loaded via `React.lazy()` + `Suspense`
  - Content seeding parallelized with `Promise.all()` (4x faster startup)
  - Main bundle reduced from ~800KB to ~515KB (36% smaller)
  - Stroke data automatically code-split into separate 82KB chunk
- **User-created mnemonics** for kanji and kana
  - DB migration 006: `user_mnemonics` table with unique constraint
  - `mnemonicService.ts` — CRUD operations
  - Editable text area in kanji detail modal (auto-saves on blur)
  - Editable text area in kana detail modal (auto-saves on blur)
- **Kana mnemonic descriptions** — 92 text-based memory tricks
  - `kanaMnemonics.ts` — visual associations for all basic hiragana + katakana
  - Displayed in kana detail modal as "Memory trick" section
- **Custom typing word lists**
  - DB migration 007: `custom_word_lists` table
  - `wordListService.ts` — create, list, delete, parse word format
  - "Custom Lists" tab on Typing page with create form and list manager
  - Format: `japanese|romaji|meaning` one per line

## [1.2.0] - 2026-03-16

### Added
- **Reset Progress button** — fully functional with double confirmation dialog
  - Deletes SRS cards, review history, mastery, achievements, progress in FK-safe order
  - Resets XP and streak to 0, preserves user name/settings
- **Row group progress tracking** — DB-backed mastery + accuracy per kana row
  - `getRowGroupProgress()` aggregates kana_mastery by row_group with JOIN
  - Learn mode row cards show mastered count + accuracy percentage from real DB data
  - Applied to both Hiragana and Katakana pages
- **Typing session history** — sessions saved to DB, History tab
  - `typingService.ts` with `saveTypingSession()` and `getTypingSessions()`
  - Both Romaji and Japanese modes auto-save on completion
  - History tab shows average WPM, best WPM, average accuracy, session list
- **Per-character typing accuracy** — tracked per session (WPM + accuracy saved)

### Fixed
- Reset button in Settings was previously non-functional (cosmetic only)

## [1.1.0] - 2026-03-16

### Added
- **Onboarding wizard** — 5-step first-launch experience
  - Welcome, name input, level selection, daily goal, ready screen
  - Animated step transitions (Framer Motion)
  - Persists to SQLite settings table, gates main UI until complete
- **Data export/import** — Full backup system in Settings
  - Export: Downloads all user data (SRS cards, progress, achievements, mastery) as JSON
  - Import: File picker with confirmation dialog, validates format, replaces data
  - Schema versioning for forward compatibility
- **Level-up animations** — Fullscreen celebration on XP threshold
  - 30 level thresholds (100, 300, 600, 1000... up to 135,000 XP)
  - `getLevel()` and `getXpForNextLevel()` utility functions
  - Animated overlay with level number, confetti emoji, auto-dismiss
  - Detected on XP changes in App.tsx
- **Kanji compound words (熟語)** — 200+ compounds in kanji detail modal
  - `kanjiCompounds.ts`: compounds for 50+ kanji (日, 月, 人, 学, 電, etc.)
  - Shows word, reading, and meaning in the kanji detail modal
  - Cross-references with existing vocabulary

## [1.0.0] - 2026-03-16

### Added
- **Achievement system**
  - `achievementService.ts` with `getUserStats()` + `checkAndUnlockAchievements()`
  - 15 achievements (first review, kana mastery, streaks, accuracy, review milestones)
  - `AchievementNotification.tsx` — animated toast with icon, auto-dismiss, queue
  - Auto-checks on page changes, awards 100 XP per achievement
- **Skill breakdown chart** — bar chart on Dashboard showing Kana/Kanji/Vocab/Grammar mastery %
- **Combination kana (拗音)** — 33 hiragana + 33 katakana combos (きゃ, しゃ, ちゃ, etc.) with "Combinations" section in KanaGrid

## [0.9.0] - 2026-03-16

### Added
- **Practice page** — Real-world sentence exercises (the "not Duolingo" feature)
  - **Sentence Builder**: Drag word tiles into correct Japanese order
    - 35 exercises across 8 real-world scenarios (convenience store, restaurant, train station, meeting people, shopping, home, directions, school/work)
    - Every sentence is something you'd actually say in Japan
    - Distractor tiles to increase difficulty
    - 10 XP per correct sentence
  - **Fill-in-the-Blank**: Choose correct particle, verb, or expression
    - 16 exercises testing particles (は/が/を/に/で/から/まで), verb forms, adjectives, polite expressions
    - Multiple blanks per sentence for harder questions
    - Keyboard shortcuts (1-4 for options)
  - Scenario filter (all, convenience store, restaurant, station, etc.)
  - Exercise type selector with preview cards
  - Added to sidebar navigation as "Practice"
- **Reading page** — Mini stories with comprehension quizzes
  - 7 stories using only N5 grammar/vocab:
    - At the Convenience Store, At the Restaurant, Taking the Train, Meeting a Friend, My Room, Weekend Plans, A Day at School
  - Sentence-by-sentence reading with tap-to-reveal translation
  - Furigana toggle (show/hide ruby text)
  - Audio playback per sentence (Web Speech API)
  - 2-3 comprehension questions per story
  - 15 XP per correct comprehension answer
  - Added to sidebar navigation as "Reading"
- New data files: `sentenceExercises.ts` (51 exercises), `readingStories.ts` (7 stories)
- New components: `SentenceBuilder.tsx`, `FillInTheBlank.tsx`
- New pages: `PracticePage.tsx`, `ReadingPage.tsx`
- Updated `PageId` type and `NAV_ITEMS` for new pages

## [0.8.0] - 2026-03-16

### Added
- **Guided lesson system** (Duolingo-style teach-then-quiz flow)
  - `KanaLesson.tsx` — full lesson component with 3 phases:
    1. **Introduce**: Show character with stroke animation + audio + romaji explanation
    2. **Drill**: Immediate quiz after each character (type-answer or multiple-choice)
    3. **Reinforce**: Mix all characters together in random quiz questions
  - Completion screen with learned characters, accuracy, and XP earned
  - Auto-plays audio pronunciation on teach steps
  - Keyboard shortcuts: Enter/Space to advance teach, 1-4 for MC, Enter to check
  - XP awarded (5 XP per correct drill answer)
  - Mastery recorded per character
- **Learn mode** on Hiragana and Katakana pages
  - Row-by-row lesson selector (Vowels, K Row, S Row, etc.)
  - Each row card shows all characters + mastery progress (e.g., "3/5 learned")
  - Completed rows highlighted in green
  - Replaces old "Study" button in nav with "Learn"

## [0.7.0] - 2026-03-16

### Added
- **Vocabulary quiz system** — 3 quiz modes on Vocabulary page
  - Meaning quiz (show word → type English meaning)
  - Reading quiz (show word + meaning → type hiragana reading)
  - Multiple-choice recognition quiz (show meaning → pick correct word from 4 options)
  - Quiz mode selector UI
  - XP earned (5 XP per correct) with completion stats
  - Keyboard shortcuts (1-4 for MC, Enter for next)
  - Duolingo-style QuizFeedback bar on all quiz types
- **Audio pronunciation** (Web Speech API)
  - `useAudio` hook with `play()` and `stop()` functions
  - `AudioButton` component (speaker icon, inline playable)
  - Added to KanaDetailModal, VocabDetailModal
  - Japanese voice auto-detection, 0.85 rate for learning pace
- **DB Migration 005**: Unique indexes on `vocabulary(word, reading)` and `grammar_points(pattern, jlpt_level)` — fixes duplicate seeding bug

## [0.6.0] - 2026-03-16

### Added
- **Duolingo-style kana trainer**
  - **Multiple-choice "Romaji → Kana" quiz** — Shows romaji prompt, pick correct kana from 4 choices
    - Random distractor generation (avoids same romaji)
    - Keyboard shortcuts: 1-4 to select, Enter/Space to continue
    - Reuses QuizFeedback bar and ConfettiEffect
  - **Quiz mode selector** — Choose between "Kana → Romaji" (type) and "Romaji → Kana" (multiple choice)
  - **XP earned in quizzes** — 5 XP per correct answer (lower than SRS 10 XP to prevent farming)
  - **Per-character mastery tracking** via new `kana_mastery` database table
    - Tracks correct/incorrect counts per user per character
    - Mastery levels 0-5 with accuracy weighting (penalized below 70%)
  - **Mastery visualization**
    - `MasteryIndicator` component: 5-dot strength bar (gray → accent → matcha → gold)
    - Mastery dots shown below each character in KanaGrid
    - "X/46 mastered" summary on grid view
  - **"+5 XP" floating animation** on correct quiz answers
  - **XP earned stat** in quiz completion screen
  - DB migration 004: `kana_mastery` table with unique constraint on (user_id, kana_id)
  - Both HiraganaPage and KatakanaPage fully updated with all new features

## [0.5.0] - 2026-03-16

### Added
- **Review engine extended for vocab + grammar**
  - `getCardContent()` now handles `vocab` and `grammar` content types
  - ReviewPage renders vocab cards (word + reading front, meaning + POS back)
  - ReviewPage renders grammar cards (pattern + formation front, meaning + notes back)
- **Keyboard shortcuts for Review page**
  - `Space` = show answer
  - `1-4` = rate card (Again, Hard, Good, Easy)
- **FuriganaText component** (`src/components/shared/FuriganaText.tsx`)
  - Parses `{漢字|かんじ}` syntax into `<ruby>` HTML
  - Reusable for grammar examples, vocab sentences
- **Dashboard enhancements**
  - Activity heatmap (GitHub-style, 26 weeks, 4-level intensity based on daily reviews)
  - Weak items display (cards with most lapses, sorted by stability)
  - Goal ring component (SVG circular progress indicator)
  - Both integrated into DashboardPage

## [0.4.0] - 2026-03-16

### Added
- **N5 Vocabulary expansion** — 300 words total (batch 2: food/drink, body, clothing, objects, nature, 30+ more verbs, na-adjectives, i-adjectives, numbers/counters, transport, adverbs, time expressions, places, school, misc essentials)
- **N5 Grammar system** (40 essential patterns)
  - `grammarN5.ts` — 40 patterns: copula, particles, adjectives, te-form, requests, comparisons, desire, existence, giving reasons
  - `seedGrammar.ts` — auto-seed on launch
  - `grammarService.ts` — queries, search, SRS card creation
  - `GrammarPage.tsx` — full grammar browser replacing placeholder
    - Search by pattern, meaning, or formation
    - List view with inline examples
    - Detail modal with formation rules, all examples with readings, notes
    - "Add all N5 grammar to SRS" button
- **Radical learning system** (42 radicals)
  - `radicals.ts` — 42 common radicals with meanings, stroke counts, example kanji
  - "Radicals" view tab on Kanji page with 2-column card layout
  - Each radical shows character, meaning, names, stroke count, and example kanji

## [0.3.0] - 2026-03-16

### Added
- **Kanji stroke order system**
  - KanjiVG stroke path data for 102 N5 kanji (fetched from KanjiVG project, CC BY-SA 3.0)
  - `kanjiStrokeData.ts` — separate data file for kanji stroke paths
  - `strokeData.ts` updated to look up kanji strokes via `getStrokeData()`
  - Stroke animation in kanji detail modal with adaptive speed (scales with stroke count)
  - Kanji grid enhanced with readings, stroke count badges, and meaning on hover
  - Color-coded readings in modal (sakura for on'yomi, indigo for kun'yomi)
- **Kanji quiz system** — 3 quiz modes on Kanji page
  - Meaning quiz (existing, type English meaning)
  - Reading quiz (type hiragana or romaji, accepts both on/kun readings)
  - Recognition quiz (show reading + meaning, pick correct kanji from 4 choices)
  - Romaji-to-hiragana conversion utility (`src/lib/romajiToHiragana.ts`)
  - Shared `QuizComplete` results screen
- **N5 Vocabulary system**
  - `vocabN5.ts` — 100 essential N5 words (greetings, pronouns, family, time, verbs, adjectives, places, essentials)
  - `seedVocab.ts` — vocabulary seeding service (auto-seed on launch)
  - `vocabService.ts` — service layer with queries, search, POS filter, SRS card creation
  - `VocabularyPage.tsx` — full vocabulary browser replacing placeholder
    - Part-of-speech filter pills with color coding
    - Search by word, reading, or meaning
    - Detail modal with word, reading, meanings, POS badge, tags
    - "Add all N5 vocab to SRS" button
- **Canvas drawing practice**
  - `DrawingCanvas.tsx` — HTML5 Canvas component for handwriting practice
    - Smooth quadratic bezier curve rendering
    - Character guide overlay (toggleable)
    - Stroke counter (shows current vs. expected strokes)
    - Undo last stroke, clear canvas
    - Touch support for tablets
    - High-DPI canvas scaling
  - "Write" practice mode added to Hiragana and Katakana pages
    - Side-by-side reference animation + drawing canvas
    - Previous/Next navigation through all characters

## [0.2.0] - 2026-03-15

### Added
- **SRS Service Layer** (`src/services/srsService.ts`)
  - Card creation (`INSERT OR IGNORE` with unique constraint)
  - Due card queries (priority-ordered: relearning > learning > new > review)
  - Review submission via Rust FSRS engine with full persistence
  - Review history recording (rating, elapsed time, state transitions)
  - Content fetching for review cards
- **Progress Service Layer** (`src/services/progressService.ts`)
  - Daily progress tracking with UPSERT pattern
  - Streak calculation from consecutive study days
  - XP award system (10 XP per correct review, 25 XP per new card)
  - Dashboard stats aggregation (due cards, today's activity, learned counts)
  - Progress page data (totals, last 7 days)
- **Migration 003**: Unique constraint on `srs_cards(user_id, content_type, content_id)`
- **Review page fully wired**: Reviews persist to SQLite, XP awarded, streak updated
- **Auto-card creation**: SRS cards created for all kana on first review session
- **Dashboard real data**: Due cards, reviews today, learned counts from database
- **Progress page real data**: Total reviews, accuracy, study time, 7-day history
- **Streak recalculation on app launch**: Consecutive-day algorithm
- **KanjiVG stroke data** for all 92 basic kana (46 hiragana + 46 katakana)
  - Sourced from KanjiVG project (CC BY-SA 3.0)
  - Accurate bezier curve paths matching standard handwriting
- **Stroke animation engine** (Web Animations API)
  - Sequential stroke drawing with `stroke-dasharray/dashoffset` technique
  - Font character as textbook reference, stroke overlay for teaching
  - Pause shows complete font character for writing practice
  - Play/Pause/Replay controls with stroke count display
  - Numbered stroke-start indicators (fade out after completion)
- **Kana detail modal** (Radix UI Dialog)
  - Opens on grid cell click with stroke animation + details
  - "Study in detail" button to switch to study mode
- **Duolingo-style quiz feedback**
  - Confetti particle effect on correct answers (35 particles)
  - Animated SVG checkmark with spring physics
  - Bottom bar overlay (green for correct, red for incorrect)
  - Shake animation on wrong input
  - Auto-advance on correct (1.6s delay)
  - Animated completion screen with counting stats
- **Shared kana components** (extracted from duplicated code)
  - `KanaGrid` — character grid with hover hints
  - `KanaStudyCard` — slide transitions with AnimatePresence
  - `KanaQuiz` — quiz engine with feedback
  - `QuizFeedback` — Duolingo-style bottom bar
  - `ConfettiEffect` — particle burst
- **Japanese IME typing practice** mode
  - Composition event handling for proper IME support
  - Expected kana display, shake on incorrect
  - 30-word bank with meanings
  - macOS IME setup help panel

### Fixed
- Tauri SQL plugin permissions (added `capabilities/default.json`)
- SQL plugin configuration format (`preload` array)
- Database initialization race condition (singleton promise + `INSERT OR IGNORE`)
- React StrictMode double-mount causing duplicate kana seeding
- Migration system refactored to support multiple ordered migrations
- "Next" button in study mode showing same character twice (monotonic render key)
- White-on-white correct answer styling in quiz
- Grid cell click discoverability (hover hints + instruction text)

## [0.1.0] - 2026-03-15

### Added
- Initial project scaffold with Tauri v2 + React + TypeScript + Vite
- SQLite database with full schema (15 tables) via Tauri SQL plugin
- FSRS algorithm implementation in Rust (10 unit tests)
- Tauri IPC commands for review submission, progress tracking, streak updates
- Hiragana learning module (71 characters: grid, study, quiz)
- Katakana learning module (71 characters: grid, study, quiz)
- Kanji page (preview with N5 kanji samples)
- Vocabulary page (preview with sample N5 words)
- Grammar page (preview with sample N5 grammar patterns)
- Typing practice module (60-second romaji speed test)
- SRS Review session page (card-based, 4-tier rating)
- Dashboard with quick stats and JLPT progress
- Progress page with study history
- Settings page (study, display, language, data management)
- Sidebar navigation with collapsible mode
- Top bar with streak, XP, and level display
- Dark/light theme (macOS system preference)
- Japanese-inspired color palette (sakura, sumi, matcha, gold, indigo)
- i18n architecture with English translations
- Zustand state management (3 stores)
- Database seeding system for kana data
- Framer Motion page transitions
- Project tracking files (CHANGELOG, TODO, DECISIONS, DEPLOYMENT)
