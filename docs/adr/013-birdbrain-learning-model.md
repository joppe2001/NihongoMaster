# ADR-013 — Birdbrain Learning Model: Boundaries, Invariants, and Promotion Gates

Status: Proposed (2026-04-28).
Supersedes: nothing. Extends: [ADR-011](../../Agent%20Brain/nihongo-master/prefrontal/decisions/011-irt-adaptive-difficulty.md) (the original IRT MVP).

## Context

The IRT MVP shipped under ADR-011 gave us a working adaptive engine with a single global θ per learner and a single β per item. Field use immediately surfaced the limits of that model:

- A single scalar θ cannot tell "knows N5 vocab cold but fails N3 grammar" from a uniformly-N4 learner.
- Items aren't atomic — a cloze sentence tests vocab recall, particle choice, conjugation, and reading at once. Modelling that as one β throws away every signal except correctness.
- Without skill mastery, "weak particles" can only be inferred from coarse exercise-type weakness scores.
- Without model-version stamps on response logs, we can't refit safely after we change `K_USER_MAX` / `K_ITEM_MAX` or the update rule.
- Without offline calibration, every "we picked the right item" claim is unfalsifiable.
- Recommendations have no explanation surface, so the engine reads as a black box even to us.

This ADR upgrades Birdbrain from "useful adaptive signal" to "validated learner model" without touching FSRS, sync, or content authoring.

## Decision

Adopt a four-layer learner model with explicit boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│  FSRS                                                       │
│  Authority: card scheduling (due dates, stability, lapses)  │
│  Owner: src/services/srsService.ts + src-tauri/src/srs/     │
│  Reads: nothing from Birdbrain.                             │
└─────────────────────────────────────────────────────────────┘
                          ▲ writes review_history
                          │
┌─────────────────────────────────────────────────────────────┐
│  Learning Event Ledger (append-only)                        │
│  Tables: review_history, practice_attempts, learning_events,│
│  irt_response_log — all linked by learning_event_id.        │
│  Owner: src/services/learningEventService.ts                │
│  Source of truth — every aggregate is rebuildable from here.│
└─────────────────────────────────────────────────────────────┘
              │ feeds                      │ feeds
              ▼                            ▼
┌──────────────────────────┐   ┌─────────────────────────────┐
│ Birdbrain IRT v2         │   │ Mastery (BKT-lite)          │
│ Per-skill θ, item β,     │   │ Knowledge component         │
│ uncertainty, model_ver.  │   │ probabilities (guess/slip). │
│ Owner: irtService.ts +   │   │ Owner: masteryService.ts +  │
│ src-tauri/src/irt/       │   │ skillGraphService.ts        │
└──────────────────────────┘   └─────────────────────────────┘
              │                            │
              └────────────┬───────────────┘
                           ▼
        ┌──────────────────────────────────┐
        │  Practice Recommendation Service │
        │  Combines IRT fit + mastery gap +│
        │  FSRS memory risk + exposure ctl.│
        │  Returns ranked items with REASON│
        │  ('memory-risk'|'skill-weak'|    │
        │   'difficulty-fit'|'exploration')│
        │  Owner: practiceRecommendation-  │
        │  Service.ts                      │
        └──────────────────────────────────┘
                           ▼
                  UI surfaces (Practice,
                  Reader chip, Daily challenge)
```

### Hard invariants (enforced by tests + runtime checks)

1. **SRS reviews are non-blocking.** A Birdbrain failure must never cause a "Failed to persist review" surface to the learner. All Birdbrain writes are fire-and-forget from the review hot path, idempotent on retry, and queued so they cannot collide with the SRS UPDATE.
2. **Aggregates are caches.** Every row in `irt_user_state`, `irt_item_difficulty`, `mastery_probabilities`, `learning_profile` is derivable from the append-only event ledger. A repair command rebuilds them deterministically.
3. **Every model state has a `model_version`.** Refits never silently mix formula generations. Migrations bump versions; older logs are upgraded or replayed under the new rules.
4. **Every recommendation has a fallback.** When IRT is uncalibrated, the engine is unavailable, or the candidate pool is small, recommendations fall back to deterministic JLPT/frequency ordering. Never empty.
5. **Promotion gates are settings-flagged.** A new Birdbrain capability ships first as `shadow` (compute, don't route), then `candidate` (visible in debug only), then `limited` (practice-only routing), then `full`. Each step requires backtest evidence in `.planning/reports/` before the gate flips.
6. **Privacy stays local.** No telemetry leaves the device. Backtests run on the user's own log; reports are generated on disk.

### Module ownership

| Module | Owns |
|---|---|
| `src/services/srsService.ts` + `src-tauri/src/srs/` | FSRS card scheduling, review_history writes |
| `src/services/learningEventService.ts` (new) | Idempotent ledger writes, event_id minting |
| `src/services/skillGraphService.ts` (new) | Skill graph reads, item→skill resolution |
| `src/services/masteryService.ts` (new) | BKT-lite per-skill mastery probabilities |
| `src/services/irtService.ts` + `src-tauri/src/irt/` | Per-(scope, item) θ/β, predict, flow_band, refit |
| `src/services/practiceRecommendationService.ts` | Combines all signals, returns ranked items + reasons |
| `src/services/learnerStateService.ts` | UI-friendly aggregate counts (cache layer) |

### Skill scoping

Theta is no longer a single scalar. It's now keyed on `(user_id, skill_scope)` where `skill_scope` is a coarse bucket — `'kana'`, `'kanji'`, `'vocab'`, `'grammar'`, `'particles'`, `'conjugation'`, `'listening'`, `'reading'`. Items get IRT-scored against the relevant scope (or scopes, weighted) instead of one global θ.

A backwards-compatible scope `'global'` row is maintained so existing reads keep working during the migration window. New writers populate scoped rows; old reads fall back to `'global'` when the scoped row is empty.

### Update rule (calibrated v2)

```
K_user(scope) = K_USER_MAX[scope] / (1 + n_user_scope / N_WARM)
K_item        = K_ITEM_MAX        / (1 + n_item        / N_WARM)
```

`K_USER_MAX[scope]` is per-scope — kana converges faster than grammar — and is offline-tuned via the backtest tool. Defaults match the original ADR-011 values until backtest data justifies a change.

Item difficulty seeding uses a richer cold-start prior:

```
β_0 = jlpt_to_beta(level)
    + content_type_offset
    + frequency_offset(rank)
    + token_count_offset(text)
    + prompt_mode_offset
```

All offsets default to 0 in v2; backtests will tune them in v2.1.

### Recommendation contract

```ts
interface PracticeRecommendation {
  itemType: IrtItemType;
  itemId: string;
  predictedP: number;          // σ(θ_scope - β)
  reason: RecommendationReason;
  confidence: 'low' | 'medium' | 'high';  // derived from θ_se, β_se
  modelVersion: string;        // 'irt-v2', 'bkt-v1', 'fsrs-pull-v1'
}
type RecommendationReason =
  | { kind: 'memory-risk'; retrievability: number; daysOverdue: number }
  | { kind: 'skill-weak'; skillId: string; mastery: number }
  | { kind: 'difficulty-fit'; gapToTarget: number }
  | { kind: 'exploration'; betaSe: number };
```

Every recommendation surface in the app reads from this same shape so reasons are consistent across Practice, Reader, Dashboard, and the Birdbrain debug panel.

### Recommendation outcome tracking

Two new linked event types:

- `recommendation_impressions` — written when a recommendation is shown.
- `recommendation_outcomes` — written when the recommended item is subsequently answered (immediate) or reviewed (delayed).

Joining these on `recommendation_id` gives the `learning_gain` metric the backtest tool optimizes against — not just predicted-vs-actual correctness, but downstream lapse reduction and stability gain.

## Consequences

### Positive
- Skill-aware diagnosis: the engine can say "you fail vocab production but ace recognition" with confidence.
- Auditability: every model state has a version stamp; every aggregate rebuilds from logs.
- Calibration: backtest reports keep us honest before any change ships to users.
- Reliability: SRS is hard-walled from the rest of the model; reviews can't be blocked by a Birdbrain bug.

### Negative / trade-offs
- One more table family (skill_components, item_skill_edges, mastery_probabilities, recommendation_impressions, recommendation_outcomes).
- Per-skill θ multiplies the IRT row count by ~8× — still trivial (<1 MB for power users).
- Backtest tooling adds a maintenance surface that must keep pace with model changes.

## Open questions

- Should Birdbrain eventually drive `desired_retention` per (user, item) instead of a global slider? **Currently NO**: ADR-011 keeps FSRS scheduling out of Birbrain's reach. Re-evaluate once skill θ has stable per-scope calibration.
- How much hand-tagging of grammar/particle skills do we accept before falling back to heuristics? **Initial pass is hand-coded** from existing JLPT/POS tags; gaps get a low-confidence fallback edge with a TODO marker.
- Should learners see "this exercise improved your retention by N%" framings? **Not in v1**. Surface inside the debug panel first; UI copy is a separate ADR.

## Related

- [ADR-011](../../Agent%20Brain/nihongo-master/prefrontal/decisions/011-irt-adaptive-difficulty.md) — original IRT MVP
- [ADR-012](../../Agent%20Brain/nihongo-master/prefrontal/decisions/012-unified-word-bank.md) — Word Bank, joins via `jmdict_id` / item id
- [Birdbrain plan](../../) — implementation milestones in `.planning/birdbrain.md`
- Research anchors: FSRS overview, CAT item selection (PMC5968224), Corbett & Anderson BKT, Roediger & Karpicke (test-enhanced learning).
