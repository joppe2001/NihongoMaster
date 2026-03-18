# Sentence Generator — Improvement Tracker

Status legend: `[x]` done, `[ ]` todo, `[~]` partial

---

## Critical (affects sentence quality)

- [x] **Intransitive verb template** — Added `{N1}が{V}` pattern with
  `intransitive-verb` and `intransitive-subject` semantic constraints.
  19 intransitive verbs mapped (降る, 止まる, 始まる, 終わる, 咲く, etc.)
  with subject affinity rules (雨→降る, 花→咲く, 授業→始まる).

- [x] **English article on mass nouns** — Templates force "the" on everything.
  `"I drink the water"` should be `"I drink water"`. Need article-logic layer
  that drops articles for mass/uncountable nouns (water, money, food, weather,
  time, music, rain, snow, tea, coffee).

- [x] **English verb infinitive "to" prefix** — DB stores `"to eat"`,
  templates produce `"I to eat the fish"`. Fixed: `getVerbMeaning()` strips
  the prefix.

## High (new sentence patterns)

- [ ] **て-form chaining** — `{V1}て、{V2}` pattern for sequential actions:
  `本を読んで、コーヒーを飲みます` (I read a book and drink coffee). Very
  common N5 grammar. Needs two verb slots with independent object constraints.

- [ ] **ている (progressive)** — `{N1}を{V}ています` for ongoing actions:
  `本を読んでいます` (I am reading a book). Uses te-form + いる. May need
  conjugation engine update to produce te+います.

- [ ] **Time + location pattern** — `{T}に{LOC}で{N}を{V}` for full
  sentences: `明日図書館で本を読みます` (Tomorrow I will read a book at the
  library). Would add a time-word slot with `time` tag constraint.

- [ ] **Adjective negation** — `{N}は{A-i}くないです` / `{N}は{A-na}じゃないです`.
  Need adjective negation in conjugation engine.

- [ ] **たことがある (experience)** — `{N}を{V}たことがあります` (I have
  [verb]ed [noun] before). N4 grammar, very useful for intermediate students.

- [ ] **Conditional patterns** — `{condition}たら、{result}` and `{condition}ば、{result}`.
  N4 grammar. Complex: needs two independent clauses.

## Medium (quality of life)

- [x] **Multi-level vocabulary** — Practice page now loads vocab from
  student's current level AND all easier levels via `getVocabUpToLevel()`.
  N3 student gets N5+N4+N3 words.

- [ ] **Small vocab UX feedback** — When the generator produces fewer
  sentences than requested (student has <30 words), surface a message:
  "We could only generate N sentences from your current vocabulary — learn
  more words to unlock more practice!" Currently silently returns a short list.

- [ ] **N3+ semantic coverage** — Affinity maps cover N5+N4 adjectives and
  verbs. N3 and beyond are handled by the safety net (unknown words → skip
  template). Should add N3 entries as students reach that level.

- [ ] **Deduplication across sessions** — The generator deduplicates within
  a single session but not across sessions. Could track recently generated
  sentences in localStorage and deprioritize them.

- [ ] **Weighted template selection** — Currently all templates have equal
  probability. Could weight by the student's weak grammar points (e.g., if
  they keep failing particle drills, generate more particle-heavy sentences).

## Low (polish)

- [x] **English template naturalness** — Added proper articles ("the", "a"),
  stripped verb "to " prefix, cleaned noun articles.

- [ ] **Politeness register** — All sentences are です/ます (polite). Could
  add casual register templates (`{N}は{A-i}`, `{N}を{V-dict}`) for students
  who've learned casual speech (N4+).

- [ ] **Question forms** — No question templates exist. Could add:
  `{N1}は{A}ですか` (Is the N1 A?), `{N1}を{V}ますか` (Do you V the N1?),
  `何を{V}ますか` (What do you V?).

- [ ] **Counter/quantity patterns** — `{N}を{NUM}{COUNTER}{V}` for
  sentences like `りんごを三つ買います`. Needs counter word data.

- [ ] **Passive voice** — `{N1}が{N2}に{V}られます` for passive
  constructions. N4 grammar.

- [ ] **Giving/receiving** — `{N1}が{N2}に{N3}をあげます/もらいます`.
  N4 grammar, culturally important.

---

## Research findings (2025)

Sources: ACL 2025 (Benedetti et al. — "Automatically Suggesting Diverse Example
Sentences for L2 Japanese Learners"), Wikipedia "Selection (linguistics)",
Tatoeba corpus, Resnik 1996 selectional preferences.

### Key insight: Retrieval > Generation for language learning

The 2025 ACL paper tested PLMs as both sentence scorers (retrieval from a
curated corpus) and direct generators (zero-shot). **Retrieval was preferred
by all evaluator groups** — learners, native speakers, and GPT-4 — especially
for beginner and advanced proficiency levels. Generative approaches produced
lower naturalness scores on average.

**Implication for us**: Our template-based generator should be a SUPPLEMENT
to a curated sentence bank, not the only source. The ideal architecture:

1. **Primary**: Retrieve from a bank of real Japanese sentences (Tatoeba,
   textbook examples, hand-written sentences) filtered by JLPT level and
   target grammar/vocab.
2. **Secondary**: Generate novel sentences with the template engine when
   the bank doesn't cover the student's specific vocabulary.
3. **Scoring**: Use selectional preference scores to rank generated sentences
   by naturalness before showing them to the student.

### Actionable improvements from research

- [x] **Sentence bank infrastructure + curated seed** — Created
  `sentence_bank` SQLite table, seeded with 80+ hand-written natural
  sentences (55 N5 + 28 N4) covering all major grammar points. Retrieval
  service (`sentenceBankService.ts`) provides hybrid retrieval-first,
  generator-fallback for all exercise types. Practice page now uses this.

- [ ] **Expand bank with Tatoeba data** — Download Japanese↔English
  pairs from Tatoeba (CC BY 2.0, 200k+ sentences). Filter by JLPT level,
  tag with grammar points, import into sentence_bank. Would grow bank
  from ~80 to thousands of sentences.

- [ ] **Collocation-based affinity** — Replace hand-coded `ADJ_NOUN_AFFINITY`
  with co-occurrence frequencies extracted from a Japanese corpus (or from
  Tatoeba data). Word pairs that appear together frequently in real text get
  higher affinity scores. This is what Resnik (1996) calls "selectional
  preferences" — probabilistic, not binary.

- [ ] **Naturalness scoring** — After generating a sentence, score it against
  a small language model or n-gram table. Reject sentences below a threshold.
  Even a simple bigram model (does this word pair ever appear adjacent in
  real Japanese?) would catch many unnatural combinations.

- [ ] **Corpus-grounded templates** — Instead of hand-writing templates,
  extract common sentence patterns from Tatoeba data grouped by grammar
  point. `〜を〜ます` pattern → find all sentences matching this in the
  corpus → extract the noun-verb pairs that actually appear → use those as
  the affinity data.

### What the linguistics says (selectional restrictions)

Our `ADJ_NOUN_AFFINITY` and `VERB_OBJECT_AFFINITY` maps are implementing
what linguistics calls **s-selectional restrictions** (Chomsky 1965). The
key distinction:

- **c-selection** (category selection) = our POS matching (`noun`, `verb`)
- **s-selection** (semantic selection) = our tag-based affinity rules

The academic term for our approach is **selectional preferences** (Resnik
1996) — a softened version of hard selectional restrictions that allows
probabilistic scoring rather than binary accept/reject. Our current system
is binary (match or skip), but could be upgraded to scored preferences.

---

## Architecture notes

- **Safety net**: If an adjective/verb isn't in the affinity map, the
  generator returns `null` for that template (no nonsense fallback). This
  means unknown N3+ words produce zero sentences rather than bad ones.

- **Scenario bundles**: 40% of generations use a thematic scenario
  (restaurant, school, etc.) for extra coherence. The other 60% use the
  full constrained vocabulary pool.

- **Scaling**: N5-only = ~59,600 combos. N5+N4 = ~273,000. Estimated
  N5+N4+N3 = 1-2M. Students will never exhaust the pool.

- **Template extensibility**: Adding a new template is one object in the
  `TEMPLATES` array with typed slots and semantic constraints. No other
  code changes needed.
