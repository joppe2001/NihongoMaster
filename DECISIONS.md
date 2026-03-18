# Architecture Decisions

Record of key technical decisions for NihongoMaster.

---

## ADR-001: Tauri v2 over Electron

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Need a desktop framework for macOS Japanese learning app.

**Decision:** Use Tauri v2 with React + TypeScript frontend.

**Rationale:**
- App size: <5MB (Tauri) vs 150MB+ (Electron) — Tauri uses native macOS WKWebView
- Memory: ~30MB RAM vs 200MB+ — no bundled Chromium
- Rust backend: performant SRS calculations, native SQLite access
- React frontend: rapid UI development with rich ecosystem
- Cross-platform potential: same codebase can target Windows/Linux later

**Alternatives Rejected:**
- Electron: Too heavy for a learning app
- SwiftUI: Swift-only, slower UI iteration, no cross-platform
- Flutter: Dart ecosystem less mature for desktop

---

## ADR-002: FSRS over SM-2 for SRS Algorithm

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Need a spaced repetition algorithm for card scheduling.

**Decision:** Implement FSRS (Free Spaced Repetition Scheduler).

**Rationale:**
- FSRS is state-of-the-art, adopted by Anki 23.10+
- 20-40% better retention than SM-2 at same review load (research-backed)
- Models stability, difficulty, and retrievability as separate parameters
- More nuanced scheduling: adapts to individual learning patterns
- Open source reference implementation available

**Trade-offs:**
- More complex to implement than SM-2 (19 parameters vs 5)
- Slightly harder to debug scheduling issues
- Must validate against reference implementation

---

## ADR-003: SQLite for Local Data Storage

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Need persistent storage for user progress, content, and SRS state.

**Decision:** Use SQLite via Tauri SQL plugin.

**Rationale:**
- Zero-config: single file, no server process
- Tauri has built-in SQLite plugin with excellent performance
- Handles our data volume easily (10K+ vocab, 100K+ reviews)
- Portable: user can backup/restore by copying one file
- Future migration to cloud sync is possible without schema changes

**Alternatives Rejected:**
- IndexedDB: Limited to browser context, harder to query
- JSON files: No query capability, scale poorly
- Remote DB (Supabase): Requires internet, adds complexity

---

## ADR-004: i18n Architecture from Day One

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** App starts English→Japanese, but needs to support other source languages.

**Decision:** Use i18next + JSON keyed content from the start.

**Implementation:**
- UI strings: i18next with `en.json` translation files
- Content data (meanings, examples): JSON keyed by language code
  - e.g., `meanings: { "en": ["dog"], "es": ["perro"] }`
- Database `languages` table pre-seeded with 7 languages
- Source language selector in settings (only English active for MVP)

**Rationale:**
- Adding a new source language = adding translations, no code changes
- Avoids costly refactoring later
- Minimal overhead vs hardcoded strings

---

## ADR-005: Multi-Modal Content Delivery

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Users have different learning preferences (visual, textual, kinesthetic).

**Decision:** Present ALL content through multiple channels simultaneously.

**Rationale:**
- "Learning styles" theory (matching one style per person) is debunked
- Research supports multi-modal presentation for all learners
- Each content item delivered via:
  1. Visual: Character display, stroke order, color coding
  2. Textual: Definitions, readings, grammar notes
  3. Kinesthetic: Typing, drawing, fill-in-the-blank
  4. (Future) Auditory: Native pronunciation audio

---

## ADR-006: State Management with Zustand

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Need React state management for user data, review state, app state.

**Decision:** Use Zustand instead of Redux or Context API.

**Rationale:**
- Minimal boilerplate (vs Redux)
- No Provider wrapper components needed (vs Context)
- TypeScript-first with excellent inference
- Tiny bundle size (~1KB)
- Simple mental model: create store, use hook
- Sufficient for our complexity level

---

## ADR-007: Japanese-Inspired Design System

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** UI should feel culturally appropriate and visually engaging.

**Decision:** Custom color palette inspired by Japanese aesthetics.

**Implementation:**
- Sakura (桜): Pink tones for highlights and errors
- Sumi (墨): Ink-based grays for text and backgrounds
- Matcha (抹茶): Green for success states
- Gold (金): Yellow/amber for warnings and streaks
- Indigo (藍): Blue-purple for primary accent
- Font stack: Inter + Noto Sans JP for Japanese text
- macOS system theme detection for dark/light mode

---

## ADR-008: Content-First MVP Scope (N5 Only)

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Full N5-N1 content is 10,000+ items requiring months of work.

**Decision:** Ship MVP with N5 content only, expand progressively.

**Scope:**
- MVP: ~100 kanji, ~800 vocabulary, ~80 grammar points
- All kana (hiragana + katakana) complete in MVP
- Content expansion: N4 after N5 is validated, then N3, etc.

**Rationale:**
- Ship faster, get user feedback
- Validate learning flow before scaling content
- Content accuracy is more important than content volume
- N5 covers the complete beginner experience (150 study hours)

---

## ADR-009: Web Animations API for Stroke Drawing

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Need to animate SVG stroke paths drawing themselves sequentially.

**Decision:** Use the Web Animations API instead of Framer Motion for stroke animation.

**Rationale:**
- Framer Motion's JS-driven transitions cause timing race conditions with SVG `strokeDasharray`/`strokeDashoffset`
- Web Animations API runs in the browser's compositor thread — no frame skips
- The `stroke-dasharray: {len} {len}` + `stroke-dashoffset` technique requires precise synchronization
- Reference implementation (Kanimaji, used by KanjiVG website) uses the same approach
- Framer Motion still used for page transitions and UI animations (where it excels)

**Trade-offs:**
- Less React-idiomatic (imperative `element.animate()` in `useLayoutEffect`)
- Must manage animation lifecycle manually (cancel on unmount)

---

## ADR-010: Font Character as Primary Reference, Strokes as Overlay

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** KanjiVG provides handwriting-style stroke paths, but students need to see textbook-style characters.

**Decision:** The font-rendered character is the primary display. Stroke animation overlays on top as a teaching tool.

**Rationale:**
- Font characters (Noto Sans JP) match what students see in textbooks, websites, and real Japanese
- KanjiVG paths are calligraphic/handwritten — different shape from printed fonts
- Every major learning app (Duolingo, Jisho, WaniKani) uses this same approach
- When paused: show full-opacity font character for writing reference
- When playing: dimmed font at 12% + animated strokes in accent color on top

---

## ADR-011: Service Layer Pattern for Database Operations

**Date:** 2026-03-15  
**Status:** Accepted  
**Context:** Pages were making raw SQL queries directly. Need consistent data access.

**Decision:** Introduce `src/services/` layer between pages and database.

**Implementation:**
- `srsService.ts`: All SRS card CRUD, review submission, content fetching
- `progressService.ts`: Daily progress, streaks, XP, dashboard/progress stats
- Pages call services, services call `query()`/`execute()`
- Tauri IPC (`invoke`) only used for FSRS computation (Rust-side)

**Rationale:**
- Single source of truth for data access patterns
- Business logic (streak calculation, XP rewards) centralized
- Easier to test and refactor
- Pages stay focused on UI

---

## ADR-012: Kanji Lesson Groups by Theme (not stroke count/frequency)

**Date:** 2026-03-16
**Status:** Accepted
**Context:** Need to organize kanji into learnable batches for the new lesson system. Options: by stroke count, by frequency rank, by school grade, or by thematic category.

**Decision:** Group kanji by semantic theme (Numbers, Time, People, Nature, Actions, etc.) in batches of ~5.

**Rationale:**
- Matches how textbooks (Genki, Minna no Nihongo) organize kanji — by topic
- Thematic grouping creates meaningful associations (learning 春夏秋冬 together = all seasons)
- Mirrors the successful kana row-group pattern (あ-row, か-row, etc.)
- More engaging than arbitrary stroke-count ordering
- Users can choose groups that interest them, increasing motivation
- Each group tells a mini-story (Days of Week, Family, Body Parts)

**Alternatives considered:**
- By stroke count: No semantic connection, feels random
- By frequency: Top-N lists lose thematic coherence
- By school grade: Doesn't map well to JLPT levels

---

## ADR-013: Separate Kanji Mastery from SRS

**Date:** 2026-03-16
**Status:** Accepted
**Context:** Already have SRS cards for spaced repetition. Kanji lessons need per-character mastery tracking for the teach→drill→reinforce cycle.

**Decision:** Create a separate `kanji_mastery` table (mirroring `kana_mastery`) instead of reusing SRS cards.

**Rationale:**
- SRS tracks long-term recall scheduling; mastery tracks short-term learning progress
- Mastery levels (0-5) based on correct/incorrect counts are simpler than FSRS parameters
- Lesson completion and group progress depend on mastery data, not SRS state
- Same pattern proven with kana mastery — consistent architecture
- Both systems can coexist: mastery for lessons, SRS for review sessions

---

## ADR-014: Unified Learn Mode Across Kanji, Vocab, Grammar

**Date:** 2026-03-16
**Status:** Accepted
**Context:** Users need a structured way to learn — not just browse and try to remember. The kana lesson system (teach → drill → reinforce) proved effective and users want the same for kanji, vocabulary, and grammar.

**Decision:** Implement a "Learn" tab on Kanji, Vocabulary, and Grammar pages, all following the same pattern: thematic groups → guided lesson → mastery tracking.

**Rationale:**
- Consistent learning UX across all content types (familiar pattern)
- Group-based learning creates context and meaning (e.g., learning all seasons together)
- Teach → drill → reinforce cycle proven effective in kana lessons
- Per-content mastery tracking enables progress visualization
- Interleaved repetition within sessions prevents "see once, forget" pattern

---

## ADR-015: Bucket-Based Interleaving for Lesson Sessions

**Date:** 2026-03-16
**Status:** Accepted
**Context:** Simple sequential lesson plans (teach all, then quiz all) cause students to forget items by the time they're quizzed. Need spaced repetition within a single session.

**Decision:** Use a bucket-based interleaving algorithm:
- Bucket -1 (failed): re-quiz within 1-2 steps
- Bucket 0 (new): re-quiz within 2-3 steps
- Bucket 1 (seen once): re-quiz within 4-6 steps
- Bucket 2 (reinforced): done for session

**Rationale:**
- Items seen 3-4 times per session instead of 1-2
- Exercise types escalate per repetition (recognition → recall → production)
- Failed items get immediate re-exposure
- Algorithm is content-agnostic (works for kanji, vocab, grammar)
- Similar to Leitner system but adapted for short sessions

---

Last updated: 2026-03-16
