<p align="center">
  <img src="public/app-icon.png" alt="NihongoMaster" width="120" height="120" />
</p>

<h1 align="center">NihongoMaster</h1>

<p align="center">
  <strong>The desktop Japanese learning app that works entirely offline.</strong><br/>
  Built with Tauri v2, React 19, Rust, and SQLite.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/offline-100%25-success?style=flat-square" alt="Offline" />
  <img src="https://img.shields.io/badge/JLPT-N5%E2%80%93N2-orange?style=flat-square" alt="JLPT" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/rust-%23000000.svg?style=flat-square&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/tauri-v2-24C8D8?style=flat-square&logo=tauri&logoColor=white" alt="Tauri" />
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
</p>

<br/>

<p align="center">
  <img src="docs/screenshots/hero-dashboard.png" alt="NihongoMaster Dashboard" width="800" />
</p>

---

## Why NihongoMaster?

Most Japanese learning apps are cloud-based, subscription-locked, and can't function without an internet connection. NihongoMaster is different.

- **100% offline after install** -- your data never leaves your machine
- **Native Japanese voices** via VOICEVOX -- real AI speech synthesis running locally on your CPU, not a robotic browser voice
- **FSRS spaced repetition** -- the same algorithm behind Anki's latest scheduler, implemented natively in Rust for speed
- **Comprehensive JLPT coverage** -- N5 through N2 kanji, vocabulary, and grammar in a single app
- **Tiny footprint** -- the entire app is under 5 MB (before optional VOICEVOX voice models)
- **No account required** -- no sign-up, no telemetry, no tracking

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [What Makes It Different](#what-makes-it-different)
- [VOICEVOX -- Native Japanese Voices](#voicevox----native-japanese-voices)
- [The SRS Engine](#the-srs-engine)
- [Themes](#themes)
- [Getting Started](#getting-started)
- [Building from Source](#building-from-source)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [JLPT Content](#jlpt-content)
- [Roadmap](#roadmap)
- [Credits](#credits)
- [License](#license)

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### Learn
- **Kana** -- Guided Duolingo-style lessons for all 206 hiragana and katakana (including dakuten and combinations)
- **Kanji** -- Stroke-order animations from KanjiVG, thematic lesson groups, three quiz modes
- **Vocabulary** -- 2,500+ words across N5-N2, grouped by theme with teach-then-drill lessons
- **Grammar** -- 150+ patterns with formation rules, example sentences, and interactive quizzes

</td>
<td width="50%" valign="top">

### Practice
- **Sentence Builder** -- Drag tiles into correct Japanese word order across 35+ real-world scenarios
- **Fill-in-the-Blank** -- Particle, verb, and expression drills
- **Conjugation Drill** -- Verb forms (masu, te, nai, ta, tai, potential)
- **Error Correction** -- Find grammar mistakes in sentences
- **Matching Pairs** -- Timed card matching (JP-EN)
- **Dialogue Completion** -- Multi-turn conversation practice

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Read & Type
- **Reading Stories** -- Mini stories using only grammar you know, with furigana toggle, sentence-by-sentence audio, and comprehension quizzes
- **Interactive Stories** -- Clickable words with instant definitions
- **Typing Practice** -- Romaji speed test and Japanese IME mode with custom word lists

</td>
<td width="50%" valign="top">

### Track
- **SRS Review** -- FSRS-powered spaced repetition for kana, kanji, vocabulary, and grammar
- **Dashboard** -- Smart study guide with personalized recommendations, activity heatmap, skill breakdown chart
- **Progress** -- Streak tracking, XP system with 30 levels, accuracy stats, daily goals
- **Achievements** -- 15 unlockable achievements with animated toast notifications

</td>
</tr>
</table>

---

## Screenshots

> **Note:** Add your own screenshots to `docs/screenshots/` and they will display here automatically.

<details>
<summary><strong>Dashboard & Smart Study Guide</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="700" />
</p>

The dashboard shows your daily progress, due reviews, streak, XP, a GitHub-style activity heatmap, skill breakdown across all four domains (Kana, Kanji, Vocabulary, Grammar), and personalized study recommendations based on your learning data.
</details>

<details>
<summary><strong>Kana Learning -- Guided Lessons</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/kana-lesson.png" alt="Kana Lesson" width="700" />
</p>

Row-by-row lessons with KanjiVG stroke animations, audio pronunciation, and immediate drill-then-reinforce quizzes. Mastery dots track your progress per character.
</details>

<details>
<summary><strong>Kanji -- Stroke Animation & Quizzes</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/kanji-stroke.png" alt="Kanji Stroke Animation" width="700" />
</p>

Every kanji has accurate stroke-order animation. Thematic groups (Numbers, Time, People, Nature...) with three quiz types: meaning, reading, and recognition. Compound words (jukugo) shown for each kanji.
</details>

<details>
<summary><strong>Vocabulary Browse & Learn</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/vocabulary.png" alt="Vocabulary Page" width="700" />
</p>

Browse 2,500+ words by JLPT level and part of speech. Each word has audio, example usage, and mastery tracking. Themed lesson groups for systematic learning.
</details>

<details>
<summary><strong>Grammar Patterns</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/grammar.png" alt="Grammar Page" width="700" />
</p>

150+ grammar patterns with formation rules, multiple example sentences with furigana, usage notes, and interactive quizzes.
</details>

<details>
<summary><strong>Practice -- Sentence Builder & Exercises</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/practice.png" alt="Practice Page" width="700" />
</p>

Six exercise types including drag-and-drop sentence building, conjugation drills, error correction, matching pairs, and dialogue completion. Real-world scenarios: convenience store, restaurant, train station, and more.
</details>

<details>
<summary><strong>Reading Stories</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/reading.png" alt="Reading Page" width="700" />
</p>

Mini stories written with only the grammar and vocabulary you know. Tap any sentence to reveal the translation. Toggle furigana on/off. Comprehension quizzes at the end.
</details>

<details>
<summary><strong>Typing Practice</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/typing.png" alt="Typing Practice" width="700" />
</p>

Two modes: romaji speed test and Japanese IME practice. Custom word lists, session history with WPM and accuracy tracking, and a hide-answer toggle for memory practice.
</details>

<details>
<summary><strong>SRS Review Session</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/review.png" alt="Review Session" width="700" />
</p>

Card-based review with FSRS scheduling. Rate each card Again/Hard/Good/Easy. Keyboard shortcuts for rapid review. Supports kana, kanji, vocabulary, and grammar cards.
</details>

<details>
<summary><strong>Progress & Achievements</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/progress.png" alt="Progress Page" width="700" />
</p>

Track total reviews, accuracy, study streaks, and XP across 30 levels. 15 achievements unlock as you hit milestones.
</details>

<details>
<summary><strong>Settings & Themes</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/settings-themes.png" alt="Settings & Themes" width="700" />
</p>

7 themes including 4 Japanese-inspired color palettes. Full data export/import, daily goal configuration, and VOICEVOX engine management.
</details>

<details>
<summary><strong>Onboarding</strong></summary>
<br/>
<p align="center">
  <img src="docs/screenshots/onboarding.png" alt="Onboarding Wizard" width="700" />
</p>

5-step first-launch wizard: welcome, name input, JLPT level selection, daily goal, and setup complete.
</details>

---

## What Makes It Different

| Feature | NihongoMaster | Duolingo | WaniKani | Anki |
|---|:---:|:---:|:---:|:---:|
| Works 100% offline | **Yes** | No | No | Partial |
| Native Japanese AI voices (VOICEVOX) | **Yes** | No | No | No |
| FSRS spaced repetition | **Yes** | No | SRS (custom) | Yes (plugin) |
| Kanji stroke-order animation | **Yes** | No | No | No |
| Sentence building exercises | **Yes** | Yes | No | No |
| Reading stories with comprehension | **Yes** | Yes | No | No |
| Japanese IME typing practice | **Yes** | No | No | No |
| Drawing canvas for handwriting | **Yes** | No | No | No |
| Multiple Japanese-inspired themes | **Yes** | No | No | No |
| Full data export/import | **Yes** | No | No | Yes |
| No account / No subscription | **Yes** | No | No | Yes |
| No telemetry or tracking | **Yes** | No | No | Yes |
| Native desktop performance (Rust) | **Yes** | No | No | Partial |
| App size | **~5 MB** | ~150 MB | Web | ~100 MB |
| Price | **Free** | $84/yr | $99/yr | Free |

---

## VOICEVOX -- Native Japanese Voices

NihongoMaster integrates [VOICEVOX](https://voicevox.hiroshiba.jp/), an open-source Japanese speech synthesis engine, directly into the app. This gives you **real Japanese voices** -- not the robotic browser Speech API.

### How it works

1. Open **Settings** and go to the VOICEVOX section
2. **Preview voices** -- listen to 40+ voice samples before downloading anything
3. **Select voices** -- pick the characters you want (e.g., Zundamon, Metan, Tsumugi)
4. **One-click install** -- the engine downloads (~200 MB) and extracts automatically
5. **Runs locally** -- the VOICEVOX engine starts on your machine, no internet required after install

### Voice features

- **40+ voice characters** with distinct personalities and tones
- **Speed control** -- normal and slow pronunciation for learning
- **Word-level timing** -- words highlight in sync with audio during reading
- **Automatic fallback** -- if VOICEVOX isn't installed, falls back to pre-generated Google Cloud TTS audio, then to Web Speech API

<p align="center">
  <img src="docs/screenshots/voicevox-setup.png" alt="VOICEVOX Setup" width="600" />
</p>

---

## The SRS Engine

NihongoMaster uses the **FSRS (Free Spaced Repetition Scheduler)** algorithm -- the same algorithm that powers Anki's latest scheduler. Our implementation is written in **Rust** and runs natively, not in a browser sandbox.

### How FSRS works

FSRS models memory with three variables:

- **Stability** -- how long until a memory decays to 90% recall probability
- **Difficulty** -- how inherently hard the material is for you
- **Retrievability** -- the probability you can recall the item right now

After each review, the algorithm recalculates optimal intervals based on your rating (Again, Hard, Good, Easy) and your history with that specific card.

### Mastery dot system

Every item (kana, kanji, vocab, grammar) has a 5-dot mastery indicator:

| Dots | Level | Net Score | Meaning |
|------|-------|-----------|---------|
| 0 | Unseen | 0 | Not yet studied |
| 1 | Seen | 1-2 | Encountered, not yet familiar |
| 2 | Familiar | 3-5 | Recognizing consistently |
| 3 | Intermediate | 6-10 | Recalling with some effort |
| 4 | Advanced | 11-17 | Confident recall |
| 5 | Mastered | 18+ | Automatic recall |

Wrong answers **deduct progress** -- each mistake costs 3 effective points. This prevents inflated mastery from lucky guesses.

---

## Themes

NihongoMaster ships with **7 themes**, including 4 Japanese-inspired color palettes:

<table>
<tr>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-light.png" alt="Light" width="160" /><br/>
  <strong>Light</strong><br/>
  <sub>Clean default</sub>
</td>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-dark.png" alt="Dark" width="160" /><br/>
  <strong>Dark</strong><br/>
  <sub>Twilight focus</sub>
</td>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-sakura.png" alt="Sakura" width="160" /><br/>
  <strong>Sakura</strong><br/>
  <sub>Cherry blossom pinks</sub>
</td>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-matcha.png" alt="Matcha" width="160" /><br/>
  <strong>Matcha</strong><br/>
  <sub>Tea ceremony greens</sub>
</td>
</tr>
<tr>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-fuji.png" alt="Fuji" width="160" /><br/>
  <strong>Fuji</strong><br/>
  <sub>Wisteria purple</sub>
</td>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-momiji.png" alt="Momiji" width="160" /><br/>
  <strong>Momiji</strong><br/>
  <sub>Autumn maple reds</sub>
</td>
<td align="center" width="25%">
  <img src="docs/screenshots/theme-system.png" alt="System" width="160" /><br/>
  <strong>System</strong><br/>
  <sub>Follows OS preference</sub>
</td>
<td width="25%"></td>
</tr>
</table>

Each theme overrides the entire design system: backgrounds, text colors, borders, accents, gradients, shadows, scrollbars, and glow effects. Smooth 500ms transitions when switching.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (latest stable)
- Platform dependencies for Tauri v2:
  - **macOS:** Xcode Command Line Tools
  - **Windows:** Visual Studio Build Tools, WebView2
  - **Linux:** `webkit2gtk-4.1`, `libappindicator3-dev`, `librsvg2-dev`

### Install & Run

```bash
# Clone the repository
git clone https://github.com/joppe2001/NihongoMaster.git
cd NihongoMaster

# Install dependencies
npm install

# Start in development mode
npm run tauri:dev
```

The app opens at `localhost:1420` inside a native Tauri window. The SQLite database initializes automatically on first launch with all JLPT content.

### Optional: Generate audio files

Pre-generated audio files for offline pronunciation are included. To regenerate them (requires a Google Cloud TTS API key):

```bash
# Generate all audio (kana + kanji + vocab)
npm run generate-audio

# Generate specific types
npm run generate-audio:kana
npm run generate-audio:vocab
npm run generate-audio:kanji

# Generate slow-speed variants
npm run generate-audio:slow
```

---

## Building from Source

### macOS (.dmg)

```bash
npm run tauri:build:dmg
```

Output: `src-tauri/target/release/bundle/dmg/NihongoMaster_0.1.0_aarch64.dmg`

### macOS (.app)

```bash
npm run tauri:build:app
```

### Windows (.exe / .msi)

> Must be run on a Windows machine with Visual Studio Build Tools and WebView2 installed.

```bash
npm run tauri:build:windows
```

Output: `src-tauri/target/release/bundle/nsis/NihongoMaster_0.1.0_x64-setup.exe` and `.msi`

### Linux (.deb / .AppImage / .rpm)

> Must be run on a Linux machine with `webkit2gtk-4.1`, `libappindicator3-dev`, and `librsvg2-dev` installed.

```bash
npm run tauri:build:linux
```

Output: `src-tauri/target/release/bundle/deb/`, `appimage/`, and `rpm/`

### All platforms

```bash
npm run tauri:build
```

This creates platform-appropriate installers (.dmg, .app, .exe, .deb, .rpm, .AppImage).

> **Note:** Tauri requires building on the target platform. To produce binaries for all platforms, run the respective build command on each OS or use a CI/CD pipeline (e.g., GitHub Actions) with macOS, Windows, and Linux runners.

---

## Keyboard Shortcuts

| Context | Shortcut | Action |
|---------|----------|--------|
| **Review** | `Space` | Show answer |
| **Review** | `1` `2` `3` `4` | Rate: Again / Hard / Good / Easy |
| **Quiz** | `1` `2` `3` `4` | Select multiple-choice option |
| **Quiz** | `Enter` | Check answer / Continue |
| **Quiz** | `Space` | Advance teach step |
| **Lesson** | `Enter` / `Space` | Advance to next step |
| **Fill-in-the-Blank** | `1` `2` `3` `4` | Select option |
| **General** | `Cmd/Ctrl + ,` | Open settings |

---

## Architecture

```
NihongoMaster
├── src/                        # React 19 frontend
│   ├── pages/                  # 12 page components (lazy-loaded)
│   ├── components/             # 15 component directories
│   │   ├── kana/               # Kana grid, lessons, quizzes
│   │   ├── kanji/              # Stroke animation, lessons
│   │   ├── vocab/              # Vocabulary lessons, browse
│   │   ├── grammar/            # Grammar lessons, browse
│   │   ├── exercises/          # 6 practice exercise types
│   │   ├── reading/            # Interactive story reader
│   │   ├── typing/             # IME and romaji typing
│   │   ├── voicevox/           # VOICEVOX setup & voice picker
│   │   ├── srs/                # Review card components
│   │   ├── dashboard/          # Heatmap, stats, study guide
│   │   ├── onboarding/         # First-launch wizard
│   │   └── shared/             # FuriganaText, AudioButton, etc.
│   ├── services/               # 22 service modules
│   ├── stores/                 # 6 Zustand stores
│   ├── data/                   # 54 data files (JLPT content)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, animations, types
│   ├── i18n/                   # Internationalization
│   └── styles/                 # Tailwind + Japanese themes
│
├── src-tauri/                  # Rust backend
│   └── src/
│       ├── srs/                # FSRS algorithm (Rust)
│       │   ├── fsrs.rs         # Core FSRS implementation
│       │   └── scheduler.rs    # Review scheduling
│       ├── commands/           # Tauri IPC commands
│       │   ├── cards.rs        # SRS card operations
│       │   ├── review.rs       # Review submission
│       │   └── progress.rs     # Progress & XP tracking
│       ├── voicevox.rs         # VOICEVOX engine management
│       └── db/                 # Database migrations
│
├── public/
│   ├── app-icon.png
│   └── voicevox-samples/       # 40 voice preview samples
│
└── scripts/
    └── generate-audio.ts       # Build-time audio generation
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | [Tauri v2](https://tauri.app) | Native desktop shell, IPC, file system |
| **Frontend** | [React 19](https://react.dev) + TypeScript | UI components and state |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS with custom themes |
| **State** | [Zustand](https://zustand.docs.pmnd.rs/) | Lightweight state management |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Page transitions, micro-interactions |
| **UI** | [Radix UI](https://www.radix-ui.com/) | Accessible dialog, tabs, tooltips |
| **Charts** | [Recharts](https://recharts.org) | Dashboard charts and progress graphs |
| **Icons** | [Lucide React](https://lucide.dev) | 1,700+ tree-shakable icons |
| **Backend** | [Rust](https://www.rust-lang.org/) | FSRS engine, IPC commands, VOICEVOX |
| **Database** | [SQLite](https://www.sqlite.org/) | All user data, SRS cards, progress |
| **Build** | [Vite](https://vitejs.dev/) | Frontend bundling with HMR |
| **Audio** | [VOICEVOX](https://voicevox.hiroshiba.jp/) | Japanese speech synthesis (local) |
| **Stroke Data** | [KanjiVG](https://kanjivg.tagaini.net/) | Kanji & kana stroke paths |
| **i18n** | [i18next](https://www.i18next.com/) | Interface localization |

---

## JLPT Content

All content is bundled with the app -- no downloads required.

| Level | Kanji | Vocabulary | Grammar | Status |
|-------|------:|----------:|--------:|--------|
| **N5** | 102 | 300 | 40 | Complete |
| **N4** | 170 | 700 | 55 | Complete |
| **N3** | 370 | 1,300+ | 60+ | Complete |
| **N2** | 380+ | 500+ | 40+ | Complete |
| **N1** | -- | -- | -- | Planned |
| **Total** | **1,000+** | **2,800+** | **195+** | |

Additionally:
- 42 radical definitions with example kanji
- 200+ kanji compound words (jukugo)
- 92 kana mnemonics for memorization
- KanjiVG stroke data for all N5 + N4 kanji
- 35+ sentence building exercises across 8 scenarios
- 7 reading stories with comprehension quizzes

---

## Roadmap

- [ ] N1 content (kanji, vocabulary, grammar)
- [ ] Pitch accent visualization
- [ ] Handwriting recognition (on-device ML)
- [ ] Listening comprehension exercises
- [ ] Grammar conjugation tables
- [ ] Community shared mnemonics
- [ ] Mobile companion (Tauri v2 iOS/Android)
- [ ] Plugin system for custom content packs

---

## Credits

- **[VOICEVOX](https://voicevox.hiroshiba.jp/)** -- Open-source Japanese speech synthesis engine by Hiroshiba
- **[KanjiVG](https://kanjivg.tagaini.net/)** -- Kanji stroke order data (CC BY-SA 3.0) by Ulrich Apel
- **[FSRS](https://github.com/open-spaced-repetition/fsrs4anki)** -- Free Spaced Repetition Scheduler algorithm by Jarrett Ye
- **[Tauri](https://tauri.app)** -- Framework for building desktop apps with web frontends
- **[Google Cloud TTS](https://cloud.google.com/text-to-speech)** -- Neural2-B voice used for pre-generated audio files

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with care for Japanese learners who value privacy, performance, and beautiful design.</sub>
</p>
