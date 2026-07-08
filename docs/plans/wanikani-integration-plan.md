# WaniKani Progress Import — Implementation Plan

Status: proposed (not started). Owner sign-off needed on the Open Decisions section before execution.
Produced from a Fable 5 design + adversarial red-team pass (8 agents). Every "must-change" the red-team
surfaced is folded into this plan as a hard requirement, not a suggestion.

---

## 1. What we are building

Two user-facing capabilities, both driven off a user's own WaniKani (WK) account:

1. **Import progress into the SRS.** Kanji/words the user has studied on WaniKani get seeded into
   NihonMaster's FSRS system — finished items marked known, in-progress items joined to reviews — so
   they skip work they have already done. Additive only: it never erases or downgrades local progress.
2. **Feed WaniKani trouble items into the Tricky-item coach.** WK items with poor accuracy
   (`percentage_correct < 75`) are routed into the existing remediation ("tricky items") flow.

WaniKani exposes an **online REST API only** (no file export, no OAuth). The user generates a
read-only *personal access token* at `wanikani.com/settings/personal_access_tokens` and pastes it once;
we sync over HTTPS. This is the same sanctioned pattern KameSame / KaniWani / Tsurukame use.

**Honest scope:** this is a large feature — a new cross-platform Rust HTTP module, OS-keychain token
storage (incl. an Android JNI path), one DB migration, a pure matching engine, an apply engine, and two
UI surfaces, plus a heavy test matrix. Estimate 5 phases (see §9). It is not a weekend add.

---

## 2. Airtight invariants (the rules every component obeys)

These are the load-bearing guarantees. If a design choice conflicts with one of these, the invariant wins.

1. **Never destructive, never regressive.** Import only ever adds or *raises* maturity. It never DELETEs
   a card, never lowers any column, never touches a card the user is actively learning or has suspended.
2. **One migration, one schema, one owner per table.** All WK tables live in a single `MIGRATION_061`.
   No column is defined twice. (The red-team's #1 critical finding was three conflicting 061s.)
3. **Logical key is truth; rowid is a cache.** A match's durable identity is `(matched_word, matched_reading)`
   for vocab and `(character)` for kanji — never `vocabulary.id` (AUTOINCREMENT, unstable across reseed).
   `content_id` is re-resolved from the logical key on every apply.
4. **Matching fails closed.** A vocab probe without a non-empty reading is forbidden. Ambiguity →
   `needs_review`, never a silent "first row wins". A wrong "known" mark is the worst outcome.
5. **Timestamps: WK values stay in `wk_*` columns (raw ISO-UTC), never compared to local time.**
   Everything else is local `'YYYY-MM-DD HH:MM:SS'`. `last_review` on any seeded card = **import time**,
   never WK's `data_updated_at`.
6. **No fabricated history.** Zero rows written to `review_history` or `learning_events`. Leech detection
   is never spoofed with fake `lapses`.
7. **Crash-safe by write order, not by transactions.** `db.ts` `transaction()` has *no* BEGIN/COMMIT
   (documented at `db.ts:~1481`). Every write is individually idempotent, applied in a fixed order with
   the link marker written **last**.
8. **The token never re-enters the webview.** It is pasted once → stored in the OS keychain → attached to
   requests inside Rust. Rust hard-pins every request URL to `https://api.wanikani.com/v2/`.
9. **Copyright boundary enforced in code.** We persist only `subject_id → characters/readings/level` and
   the user's own progress numbers. No mnemonics, hints, meanings, or context sentences are ever stored.
10. **Nothing surprises the user.** Applying to the SRS always goes through an explicit preview/confirm.
    Background sync only refreshes staging; it never writes to `srs_cards` on its own.

---

## 3. Architecture — four layers with strict boundaries

```
WaniKani API (HTTPS)
        │  Rust: reqwest, host-pinning, rate-limit, keychain
        ▼
[B] Sync engine  ──writes──►  staging tables (wanikani_subjects/_assignments/_review_stats)
        │                                    │
        │ TS orchestrates page loop          │ read-only
        ▼                                    ▼
[C] Matcher (PURE)  ──writes──►  wanikani_link  ◄──reads──  [preview / report UI]
        │  no SQL in loop, no LIMIT 1
        ▼
[A] Applier  ──reads applied_at IS NULL links, writes──►  srs_cards + *_mastery + word_bank
        │  the ONLY writer of applied_at
        ▼
[D] UI: WaniKaniPage (connect→scan→preview→import→report→manage) + SettingsWaniKani + Tricky surfacing
```

Ownership contract (this resolves every cross-component conflict the red-team found):

- **B (sync)** owns fetching and the staging tables + `wanikani_sync` (status/cursors/etags/username).
  It never writes `srs_cards`.
- **C (matcher)** is the *only* writer of match fields on `wanikani_link` (`match_method`, `confidence`,
  `status`, `content_type`, `matched_word`, `matched_reading`). Pure function; no progress writes.
- **A (applier)** is the *only* reader of `status IN ('auto','manual') AND applied_at IS NULL` and the
  *only* writer of `srs_cards` / mastery / word_bank / `applied_at` / `applied_srs_stage`.
- **D (UI)** reads state exclusively through `wanikaniSyncService` selectors — **no parallel
  `persistSetting` copy** of connection state (that duplication was a red-team finding).

---

## 4. The one canonical migration 061

Single `MIGRATION_061_STATEMENTS` in `src/lib/db.ts`, registered once in `allMigrations` after
`060_journal_entries`. Additive DDL only (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`,
one `ALTER TABLE ADD COLUMN`). A shared `src/services/wanikani/schema.ts` exports the table/column
names so all four components reference identical strings.

```sql
-- Per-user account + sync cursor state (the SINGLE home for connection state).
CREATE TABLE IF NOT EXISTS wanikani_sync (
  user_id            INTEGER PRIMARY KEY REFERENCES users(id),
  wk_user_id         TEXT,
  wk_username        TEXT,
  wk_user_level      INTEGER,
  max_level_granted  INTEGER,
  subscription_type  TEXT,
  subscription_active INTEGER NOT NULL DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'idle',   -- idle|validating|syncing|paused|done|error|token_invalid
  status_detail      TEXT,
  auto_sync_enabled  INTEGER NOT NULL DEFAULT 0,
  last_synced_at     TEXT,                            -- local format
  last_full_sync_at  TEXT,                            -- local format
  first_import_done  INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- Fetch cursors + ETags, per resource, PER USER (composite PK fixes multi-profile bleed).
CREATE TABLE IF NOT EXISTS wanikani_sync_checkpoint (
  user_id     INTEGER NOT NULL REFERENCES users(id),
  resource    TEXT NOT NULL,                          -- 'subjects'|'assignments'|'review_statistics'
  next_url    TEXT,
  etag        TEXT,                                   -- keyed to the exact request URL
  etag_url    TEXT,                                   -- the URL the etag was minted for
  updated_after       TEXT,                           -- ISO cursor sent to WK
  pending_updated_after TEXT,
  in_progress INTEGER NOT NULL DEFAULT 0,
  pass_started_at TEXT,
  PRIMARY KEY (user_id, resource)
);

-- Raw WK domain data. NO meanings/mnemonics columns (copyright boundary, enforced by test).
CREATE TABLE IF NOT EXISTS wanikani_subjects (
  user_id INTEGER NOT NULL REFERENCES users(id),
  subject_id INTEGER NOT NULL,
  object TEXT NOT NULL,                               -- radical|kanji|vocabulary|kana_vocabulary
  characters TEXT,                                    -- null for image-only radicals
  primary_reading TEXT,
  level INTEGER,
  hidden INTEGER NOT NULL DEFAULT 0,
  data_updated_at TEXT,                               -- raw ISO UTC
  PRIMARY KEY (user_id, subject_id)
);
CREATE TABLE IF NOT EXISTS wanikani_assignments (
  user_id INTEGER NOT NULL REFERENCES users(id),
  subject_id INTEGER NOT NULL,
  subject_type TEXT,
  srs_stage INTEGER,
  started_at TEXT, passed_at TEXT, burned_at TEXT, available_at TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  data_updated_at TEXT,
  PRIMARY KEY (user_id, subject_id)
);
CREATE TABLE IF NOT EXISTS wanikani_review_stats (
  user_id INTEGER NOT NULL REFERENCES users(id),
  subject_id INTEGER NOT NULL,
  subject_type TEXT,
  meaning_correct INTEGER, meaning_incorrect INTEGER,
  reading_correct INTEGER, reading_incorrect INTEGER,
  total_answered INTEGER,                             -- sum of the four; used for the trouble gate
  percentage_correct INTEGER,                         -- nullable
  hidden INTEGER NOT NULL DEFAULT 0,
  data_updated_at TEXT,
  PRIMARY KEY (user_id, subject_id)
);

-- The subject → local-item link. ONE schema (C's status/confidence model + A's stage/trouble/applied).
CREATE TABLE IF NOT EXISTS wanikani_link (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  wk_subject_id INTEGER NOT NULL,
  wk_object TEXT NOT NULL,                            -- kanji|vocabulary|kana_vocabulary (skips not persisted)
  wk_characters TEXT NOT NULL,
  wk_reading TEXT,                                    -- WK primary reading; NULL for kana_vocabulary
  wk_srs_stage INTEGER,
  wk_passed_at TEXT,                                  -- display metadata only
  wk_percentage_correct INTEGER,
  content_type TEXT,                                  -- 'kanji'|'vocab'; NULL while unmatched
  matched_word TEXT,                                  -- logical key half 1
  matched_reading TEXT NOT NULL DEFAULT '',           -- logical key half 2; '' for kanji, NEVER NULL
  matched_jmdict_id INTEGER,
  content_id INTEGER,                                 -- cache only; re-resolved every apply
  match_method TEXT NOT NULL DEFAULT 'none',          -- see enum below; NO 'word_only'
  confidence TEXT NOT NULL DEFAULT 'none',            -- exact|high|medium|none
  status TEXT NOT NULL DEFAULT 'unmatched',           -- auto|needs_review|manual|rejected|unmatched
  trouble INTEGER NOT NULL DEFAULT 0,
  remediation_started_at TEXT,                        -- high-water mark, prevents re-triggering
  remediation_pct_at_start INTEGER,
  applied_srs_stage INTEGER,                          -- advisory high-water mark
  applied_at TEXT,                                    -- set by APPLIER only, in local format
  first_synced_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  last_synced_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, wk_subject_id)
);
CREATE INDEX IF NOT EXISTS idx_wanikani_link_status  ON wanikani_link(user_id, status);
CREATE INDEX IF NOT EXISTS idx_wanikani_link_logical ON wanikani_link(user_id, content_type, matched_word, matched_reading);
CREATE INDEX IF NOT EXISTS idx_wanikani_link_trouble ON wanikani_link(user_id, trouble) WHERE trouble = 1;

-- Per-run audit (this is the run record; NOT learning_events).
CREATE TABLE IF NOT EXISTS wanikani_sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  started_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  finished_at TEXT,
  outcome TEXT,
  run_now TEXT,                                       -- the single timestamp all seeds in this run use
  subjects_fetched INTEGER NOT NULL DEFAULT 0,
  assignments_fetched INTEGER NOT NULL DEFAULT 0,
  cards_created INTEGER NOT NULL DEFAULT 0,
  cards_updated INTEGER NOT NULL DEFAULT 0,
  cards_skipped_local_wins INTEGER NOT NULL DEFAULT 0,
  items_unmatched INTEGER NOT NULL DEFAULT 0,
  items_skipped INTEGER NOT NULL DEFAULT 0,
  error_detail TEXT
);

-- Card provenance so "remove items I never reviewed" and audit are possible.
ALTER TABLE srs_cards ADD COLUMN origin TEXT NOT NULL DEFAULT 'local';  -- 'local' | 'wanikani'
CREATE INDEX IF NOT EXISTS idx_srs_cards_origin ON srs_cards(user_id, origin);
```

`match_method` enum (no `word_only`): `kanji_exact`, `vocab_exact`, `kana_exact`, `tilde_stripped`,
`variant_bridge`, `suru_bridge`, `none`.

**Runtime schema assertion:** because the migration runner swallows DDL errors, the applier runs
`PRAGMA table_info(wanikani_link)` (and `srs_cards` for `origin`) once before any apply and hard-stops
with a clean error if the expected columns are absent. Never write `srs_cards` against an unverified schema.

**Reset/backup integration (mandatory):**
- Add all `wanikani_*` tables to the shared delete list in `src/services/userDataReset.ts` so a
  "Reset progress" / backup-restore cannot leave `applied_at` set while the cards are gone (which would
  permanently brick re-import via the never-reapply guard).
- Bump the `dataService` export payload version to include `srs_cards.origin` and `wanikani_link`; update
  the fixed insert column list in `importData` (currently omits new columns) so `origin` survives restore.

---

## 5. Component A — Applier (seed & merge)

### Stage → FSRS map (with recency discount)

WK `srs_stage` is the single source of truth (never `passed_at`). Anchored to in-repo precedents
(`markCardAsKnown` stability ≈ 30, migration 016 stability 7.0). `lapses = 0` for every stage.

| stage | label | state | stability | difficulty | reps | due (before discount) |
|------:|-------|-------|----------:|-----------:|-----:|-----------------------|
| 0 | lesson queue | *skip, no card* | — | — | — | — |
| 1 | Apprentice I | learning | 1.0 | 6.0 | 1 | spread over next 1–5d (jitter) |
| 2 | Apprentice II | learning | 2.0 | 6.0 | 1 | spread over next 1–5d (jitter) |
| 3 | Apprentice III | review | 3.5 | 5.5 | 2 | now + 3.5d + jitter |
| 4 | Apprentice IV | review | 5.0 | 5.5 | 2 | now + 5d + jitter |
| 5 | Guru I | review | 7.0 | 5.0 | 2 | now + 7d + jitter |
| 6 | Guru II | review | 14.0 | 5.0 | 3 | now + 14d + jitter |
| 7 | Master | review | 30.0 | 5.0 | 3 | now + 30d + jitter |
| 8 | Enlightened | review | 90.0 | 4.5 | 4 | now + 90d + jitter |
| 9 | Burned | review | 180.0 | 4.0 | 5 | now + 180d + jitter (see discount) |

- **`reps ≥ 2` from stage 3 up** so dashboards (which gate "learned" at reps ≥ 2) count them.
- **Apprentice I/II are NOT "due now".** They are `learning` state, but their due dates are spread over
  the next 1–5 days using the deterministic jitter — otherwise a mid-level user floods their queue the
  instant they confirm (learning-state cards bypass day-bucketing).
- **Deterministic jitter:** `jitter(subjectId) = ((subjectId % 31) - 15) / 100` (±15%). Pure function of
  subject id → re-runs converge to identical due dates.
- **Recency discount (correctness safeguard):** `idle = now - max(assignment.data_updated_at, available_at)`.
  If `idle > ~90 days`, cap the *first* due date to ≤ 45–60 days regardless of stage (keep the mapped
  stability — one good review restores the long interval). Burned items idle > ~1 year get a
  verification-first schedule (due 30–60d, stability stays high). WK stage encodes peak scheduling, not
  current retention; a genuinely forgotten burned word should not vanish for 6 months.
- **`last_review` = the run's single `run_now` timestamp** (local), never WK's `data_updated_at`.
  (A years-old `last_review` + `elapsed_days=0` corrupts the first real FSRS review — red-team high.)
- **"Known" vs "in your reviews" bucketing:** preview/report call stage ≥ 7 "marked as known"; stages 1–6
  "join your reviews". Guru is one week of retention — do not call it "known".

### Merge decision (per matched link, `status IN ('auto','manual')`, `applied_at IS NULL`)

1. Re-resolve `content_id` from the logical key: kanji → `getKanjiByCharacter(matched_word)`; vocab →
   a **fixed two-parameter** query `WHERE word=$1 AND reading=$2` (see §6 — never `getVocabByWord` with an
   optional reading). If reading is empty or resolution returns 0 rows → downgrade link to `unmatched`,
   count it, write nothing.
2. SELECT the existing card at that `content_id`:
   - **No card** → INSERT with mapped values, `origin='wanikani'`.
   - **Card exists, `state='new' AND reps=0`** (created, never studied) → overwrite with mapped values.
   - **Card with real history** → **WK wins only if ALL hold:** (a) `mapped_stability > local.stability`;
     (b) `local.lapses = 0`; (c) `local.state NOT IN ('learning','relearning')`; (d) not suspended
     (`due_date != '9999-12-31T00:00:00'`); (e) card is not a recently-failed local card. On win, promote
     like `markCardAsKnown` but **never touch `difficulty` or `lapses`**, and `reps = MAX(reps, mapped_reps)`.
     Otherwise **local wins**: no card write.
3. **`applied_at` + `applied_srs_stage` are set in EVERY terminal branch** (insert, promote, *and*
   local-wins skip — the skip is still a completed evaluation of this stage). This is what makes re-sync a
   true no-op.
4. **Advisory high-water mark:** honor `applied_srs_stage` only if a card actually exists at the
   re-resolved `content_id` with `stability >= mapped`. Otherwise treat as unapplied and re-seed (self-heals
   after a restore or reseed).
5. **Frozen target:** once `applied_at` is set, the applied `(matched_word, matched_reading)` becomes
   sticky. If later content changes would re-resolve to a *different* row, migrate/retire the existing
   `origin='wanikani'` card in the same batch — never INSERT a second card.

### Write order (crash-safe, since `transaction()` is not atomic)

Per link, in this exact order, each step idempotent:
`srs_cards upsert` → `*_mastery` MAX() mirror → `wordBankService.touch` → **`wanikani_link.applied_at` last.**
All promote due-dates derive from the run's single `run_now`, so a resumed run computes identical dates.

### Shadow state

- `kanji_mastery` / `vocab_mastery`: `INSERT OR IGNORE` then `UPDATE ... correct_count = MAX(correct_count, mapped_reps)`,
  `last_source='wanikani'`. Conservative floor — never import WK's raw correct/incorrect totals (they would
  dwarf and distort local accuracy).
- `word_bank`: `wordBankService.touch({... source:'wanikani'})` (extend the `WordBankSource` union and add
  a `satisfies Record<WordBankSource,string>` exhaustiveness check so every consumer handles it).
- `user_progress`, `review_history`, `learning_events`, IRT logs: **write nothing.**

---

## 6. Component C — Matcher (pure engine + link persistence)

Two files: `src/services/wanikani/wkMatcher.ts` (pure; no SQL, no `LIMIT 1`) and
`src/services/wanikani/wkLinkService.ts` (builds indexes, persists links, dry-run report).

- Build indexes once per run from full scans: `kanjiByChar`, `vocabByPair` (`word\0reading`),
  `vocabByFoldedPair` (`word\0kanaFold(reading)`). `kanaFold` = NFC + katakana→hiragana (reuse
  `romajiToHiragana.katakanaToHiragana`).
- **Skips (report-only, not persisted):** radicals, `hidden_at != null`, null/empty characters.
- **Kanji:** `kanjiByChar.get(chars)` → `kanji_exact` / `exact`. No variant pass. (~92–98% hit.)
- **Vocabulary** (needs WK primary reading): exact pair → folded exact → tilde-stripped → JMdict
  variant-bridge (via `lemmaResolver`/`edrdgPool`) → suru-bridge. **Reading gate is mandatory** on every
  bridge: only bridge through a JMdict entry whose readings include the WK reading (the homograph firewall).
- **Confidence tiers & auto-apply:** `exact` + `high` auto-apply (`status='auto'`). `medium` (cross-reading
  variant, suru-bridge) → `needs_review`, never auto. Any tier with >1 distinct row hit → `needs_review`.
- **Entry-level ambiguity demotion (red-team high):** if >1 JMdict entry survives the reading lookup/gate
  (e.g. かみ → 紙/神/髪), the result is at most `needs_review`. `kana_vocabulary` kanji-spelling bridge may
  auto-apply at `high` only when exactly one JMdict entry carries that reading.
- **`tilde_stripped` single-code-point subjects** (`〜屋`, `〜目`, `〜階` → `階`) demote to `needs_review` — a
  suffix subject should not silently mark the standalone noun known. Only genuinely multi-character stripped
  forms (e.g. `〜年間` → `年間`) may stay `high`. (The demotion is by code-point length, so `〜階` demotes.)
- **Determinism:** total order for entry selection (kanji-form-contains-query > common > lowest id), fixed
  array-order candidate iteration, run-twice deep-equal test.
- **Dry-run report** (`MatchReport`) is a pure value with `matched / needsReview / unmatched / skipped`
  counts, `matchRatePct`, and per-subject results. The commit step consumes the same object → preview can
  never disagree with what gets written.
- **Sticky statuses:** `manual` / `rejected` links are never overwritten by re-resolution; `auto` /
  `unmatched` are recomputed each run (unmatched retried every sync, so future content updates upgrade them).
- **Unmatched UI carries characters + reading + WK level only** — a JMdict gloss is looked up transiently
  when available but never persisted. No WK meaning is stored (ToS). `PreviewSummary` must not carry
  `primaryMeaning`.
- **Re-target/un-apply protocol:** `confirmMatch`/`rejectMatch` that changes the resolved target clears
  `applied_at` + `applied_srs_stage`, and offers removal of the previously seeded `origin='wanikani'` card
  when the user never reviewed it. No blind "Confirm all" — confirmation shows WK word+reading next to NM
  word+reading+gloss, per item or per fully-visible group; cross-reading bridges default unchecked;
  `manual` is reversible.

---

## 7. Component B — Sync engine

- **Rust `reqwest`** (already a dep — used by `voicevox.rs`) in a new cross-platform `src-tauri/src/wanikani/`
  module. Register commands in **both** desktop and mobile `generate_handler!` lists. Do **not** add
  `tauri-plugin-http` (would put the token in the webview). Do **not** let Rust write SQLite (owned by
  `tauri-plugin-sql`; a second connection fights the existing busy-retry queue).
- **Add the `gzip` feature to `reqwest`** in Cargo.toml (currently `stream`+`rustls-tls` only) — otherwise
  the first sync pulls tens of uncompressed MB on metered connections.
- Commands: `wk_store_token`, `wk_has_token`, `wk_clear_token`, `wk_validate_token` (GET /user),
  `wk_fetch_page(url, etag)`, `wk_begin_run → run_id`, `wk_cancel(run_id)`. `WkError { kind, message, retry_after_secs }`
  with `kind ∈ no_token|bad_url|unauthorized|forbidden|rate_limited|network|server|cancelled|keychain`.
  Token is **redacted from every error/log line**.
- `wk_fetch_page`: URL host-pin (`https` + `api.wanikani.com` + `/v2/` prefix) → read token from keychain
  **once per run, held in `WkState` for that run** (a mid-sync keychain lock must not kill an in-flight sync)
  → sliding-window limiter (≤55 req / 60s, 250ms min gap, cancellable sleeps) → headers
  `Authorization: Bearer`, `Wanikani-Revision: 20170710`, `If-None-Match` → handle 200/304/401/403/429/5xx.
  429 honors `RateLimit-Reset` (default 60s if the header is missing/unparseable), capped, cancellable.
- **Per-run cancellation:** `wk_cancel(run_id)` only trips fetches carrying that id (a global bool races
  across onboarding/manual/auto runs). One shared single-flight mutex in `wanikaniSyncService` covers
  **manual + auto-sync + onboarding scan + apply** (apply must not read staging mid-refresh).
- **Token storage** (`keyring` v3): service `com.nihonmaster.app`, account `wanikani_api_token`.
  macOS/iOS apple-native, Windows windows-native, Linux sync-secret-service (Flatpak portal). **Android:**
  no keyring backend → Kotlin `SecureStore` (EncryptedSharedPreferences) via the JNI bridge pattern from
  `commands/widget.rs`. **Keychain preflight** on the get-token screen (write/read/delete a dummy) with
  plain-language failure copy (esp. Linux without Secret Service).
- **Fetch order:** `subjects` → `assignments` → `review_statistics`. First page of each carries the stored
  ETag; a 304 skips the whole resource (no-change re-sync ≈ 4 requests). Page loop upserts staging rows,
  then advances the checkpoint **after** the page's rows are durable (crash replays ≤1 page).
- **Cursor promotion guard:** promote `updated_after = pending_updated_after` **only when it is non-null**
  (WK returns `data_updated_at: null` for empty result sets; promoting null forces a full refetch every
  other sync). Store ETag keyed to its exact URL.
- **Entitlement change → force full sync:** compare fresh `/user` `max_level_granted` / subscription to
  stored values; if increased/reactivated, run with `full=true` (ignore cursors + ETags). Otherwise the
  "upgrade WaniKani then Sync now" copy is a false promise (withheld levels have old `data_updated_at`).
- **State machine** persisted in `wanikani_sync.status`: `idle→validating→syncing→done→idle`, with
  `syncing→paused` (network/server/cancel, checkpoints kept), `paused→syncing` (resume), `→error` (401/403).
  On init, demote a stale `syncing` to `paused` (app was killed) and show Resume.
- **Trigger model (recommended):** manual "Sync now" is primary; opt-in daily background refresh
  (default off) that only refreshes **staging** ~30s post-launch / on focus, gated on toggle + token +
  `last_synced_at` > 24h + `navigator.onLine` + status idle/done + no active review session. Never blocks
  startup or the review flow. Applying always stays behind the explicit preview.

---

## 8. Component D — UX

- New full page `WaniKaniPage` (PageId `'wanikani'` in `src/App.tsx` PAGES map, mirroring `content-packs`);
  a `viewMode` state machine `connect-intro → get-token → confirm-user → scanning → preview → importing →
  report → manage`. Reached from a new `SettingsWaniKani` section and a cross-link on `ContentPacksPage`.
  Not in the sidebar.
- **Connect/token flow:** trust bullets (read-only, no content copied, nothing changed on WK); open the WK
  token page via the **existing `open_url` command** (`src-tauri/src/lib.rs:17`), not a shell plugin; render
  the URL as selectable fallback text; **feature-detect `clipboard.readText`** before showing a Paste
  button; token input `autocapitalize=off autocorrect=off spellcheck=false`, trimmed. Validate via GET /user
  and confirm by showing username + level. Free account (`max_level_granted === 3`) → calm info panel.
- **Preview (Feature 1):** mirror the ContentPacks preview/confirm. Counts come from **dry-running the same
  stage function the applier uses** (never `passed_at`). Show known / joins-reviews split, sample chips, an
  always-visible unmatched panel (characters+reading+level only), the true "due in the next 7 days" number,
  and the bold "adds, never removes" line. Explicit "Add N items" button; no auto-advance.
- **Report:** buckets — marked as known / added to reviews / already tracked (skipped) / no match / tricky
  added — plus a footnote that totals now include WaniKani items (explains the `user_progress` vs
  `srs_cards` divergence).
- **Feature 2 (Tricky items):** import ensures a card exists then calls `startRemediation`. **Prerequisites
  the red-team requires before wiring this on:**
  - `trouble = 1` only when `percentage_correct IS NOT NULL AND total_answered >= 4 AND percentage_correct < 75`.
    Missing stats never treated as 0%.
  - Only auto-start remediation for **`exact`-confidence** matches (a mis-bridge must never become a drill).
  - Extend the tricky-list query to `UNION` `isLeech` cards with `wanikani_link.trouble=1` links so every
    remediating WK item is actually visible in the Tricky tab (else `lapses=0` imports drill silently with
    no list entry). Add the "From WaniKani" chip + dismissible explainer.
  - Only activate remediation for due / near-term items; implement a real activation queue if capping at 20,
    or drop the cap claim and activate one small fixed batch.
  - Remediation high-water mark (`remediation_started_at` + `remediation_pct_at_start`): re-trigger only
    when WK stats materially worsened since, and skip items with an active `leech_remediation` row — else
    every sync re-drills the same 20 forever.
- **Settings section:** status/connect, last-synced + "Sync now" (single-flight; **never hard-disabled on
  `navigator.onLine`** — attempt-and-report instead), auto-sync toggle, linked counts, unmatched modal,
  free-plan row, Disconnect (clears token + sync state, keeps all SRS progress; optional "also forget which
  items came from WaniKani").
- **Edge copy** (plain, no jargon/em-dash/emoji; lucide icons only): invalid token, revoked mid-sync
  (`forbidden` maps to the same reconnect UX as `unauthorized`), offline, rate-limited (heartbeat: a >10s
  timer around each fetch swaps to the "slowing down" caption), 5xx, keychain failure, syncing-in-progress.
- **Store review / privacy:** update Apple App Privacy labels + Google Data Safety + privacy policy to
  disclose the on-device token and progress-data processing before release. If Pro-gating ships later, gate
  *initiating new syncs* only — never access to already-imported progress or the Disconnect action.

---

## 9. Phased execution (Fable 5 subagents)

Build strictly in this order so contracts are locked before dependents consume them.

- **Phase 0 — Contract lock.** Create `src/services/wanikani/schema.ts` (table/column/enum constants),
  write `MIGRATION_061`, wire `userDataReset` + `dataService` export/import + version bump, add the
  `PRAGMA` schema assertion. No behavior yet. Gate: migration applies clean on a fresh and an existing DB;
  reset/restore round-trips the new tables.
- **Phase 1 — Sync engine (B).** Rust module, keychain (all platforms incl. Android JNI), reqwest+gzip,
  limiter, per-run cancel, checkpointed page loop, cursor-null guard, entitlement-change full sync. Gate:
  real-token full sync stays < 60/min; kill-mid-sync resumes; revoke → 401 path; airplane-mode → paused →
  resume; second sync is the ~4-request 304 path.
- **Phase 2 — Matcher (C).** Pure engine + link service + dry-run, with the full test matrix (homograph
  guard, entry-level ambiguity, tilde/suru, kana_vocabulary, determinism). Gate: run-twice deep-equal;
  homograph never mis-binds; measured match rate reported on real content.
- **Phase 3 — Applier (A).** Merge rules, write order, advisory high-water mark, frozen target, shadow
  mirroring, recency discount. Gate: re-run is a byte-identical no-op on `srs_cards`; local-with-lapses and
  suspended cards untouched; crash-replay test; no `review_history`/`learning_events` rows; content-added-
  between-runs does not create a second card.
- **Phase 4 — UI (D) + Feature 2.** WaniKaniPage, SettingsWaniKani, preview/report, tricky surfacing with
  all its prerequisites. Gate: preview counts == applied counts; unmatched visible everywhere; token flow
  works on device (not just emulator — per the "verify on real phone" rule); privacy disclosures updated.

Each phase ends with the **code-review** skill on the diff before moving on.

---

## 10. Test matrix (the airtightness proof)

- **Idempotency:** identical WK data re-run → 0 changes to `srs_cards` (assert row-hash stable).
- **Non-regression:** local card with `lapses>0` never touched; suspended card never touched; learning-state
  card never buried by a WK "burned"; WK stage regression never downgrades.
- **Crash-safe:** kill after `srs_cards` write, re-run → mastery/word_bank correct and `applied_at` set.
- **Matching safety:** empty-reading link writes 0 cards; homograph binds to the reading-correct row; >1
  entry/row → `needs_review`; determinism deep-equal.
- **Sync:** empty incremental pass leaves cursor byte-identical; 304 short-circuits; multi-profile install
  keeps two WK accounts isolated; entitlement upgrade forces full sync.
- **Reset/restore:** after "Reset progress" or backup-restore, a re-sync cleanly re-imports (no bricked
  never-reapply); `origin` survives restore.
- **Copyright:** schema test asserts no WK meaning/mnemonic column exists anywhere.
- **Trouble:** stat-less item never flagged; only `exact` matches drill; completed remediation not re-triggered.

---

## 11. Open decisions for the owner (confirm before Phase 4 copy)

1. **Pro-gating.** Recommend: build everything tier-agnostic; wire `usePaywall('wanikani-sync')` at the
   sync entry point so the gate is a one-line flip. Keep connect + one-time import **free** (best acquisition
   hook for migrating WK users); if anything is gated at v1.0, gate only the automatic daily re-sync.
2. **Sync trigger.** Recommend: manual "Sync now" primary + opt-in daily background *staging* refresh
   (default off). Applying always stays behind the explicit preview.
3. **"Known" threshold.** Recommend: stage ≥ 7 (Master+) shown as "known"; stages 1–6 as "in your reviews".
4. **Burned items.** Recommend: active card at 180d stability (visible to dashboards + trouble tooling),
   with recency discount for very old ones — not suspended.
5. **Disconnect default.** Recommend: clear token + sync state, keep imported progress and links; offer an
   explicit "also forget which items came from WaniKani" checkbox.

---

## Appendix — red-team verdicts folded in

Design pass produced 4 component specs; the adversarial pass returned:
`sync-integrity: has-critical-gap`, `non-regression: needs-changes`, `matching-correctness: has-critical-gap`,
`resilience: needs-changes`. The critical gaps were: (1) three contradictory migration-061 schemas, (2)
apply-time `getVocabByWord` degrading to a word-only homograph probe, (3) two apply paths one of which kept
the banned `word_only` method, (4) missing `user_id` on staging tables (multi-profile bleed). All are
resolved above by the single-schema contract (§4), fail-closed resolution (§5–6), the ownership boundaries
(§3), and composite per-user keys (§4).
