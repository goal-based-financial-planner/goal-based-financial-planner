# Data Model: Goal Risk Dashboard

All entities below are **derived at render time** and **not persisted** — no changes to
`PlannerData`, `localStorage`, or the Google Drive schema. Everything is a pure function of data
that already exists: `financialGoals`, `investmentAllocations`, and `investmentLogs` on the current
`PlannerData`.

## GoalRiskDisplayStatus

A per-goal, non-persisted classification shown directly on the UI.

```ts
export type GoalRiskDisplayStatus = 'on-track' | 'at-risk' | 'not-evaluated';
```

| Value | Meaning | Applies to |
|---|---|---|
| `on-track` | The shared invested corpus is projected to fully cover this goal's withdrawal at its target date, under the plan's current (unmodified) assumptions. | One-time goals only |
| `at-risk` | The shared invested corpus is projected to be insufficient at this goal's target date. | One-time goals only |
| `not-evaluated` | No shortfall projection exists for this goal type today (FR-008). Never implies either of the above. | Recurring goals only |

**Derivation** (`src/domain/goalRiskStatus.ts`, new file):

```ts
export function deriveGoalRiskStatuses(
  goals: FinancialGoal[],
  baseline: PortfolioWhatIfResult, // built with EMPTY adjustments — see research.md
): Record<string /* goal.id */, GoalRiskDisplayStatus>
```

- For each goal with `goalType !== GoalType.ONE_TIME` → `'not-evaluated'`.
- For each one-time goal, look up its `WhatIfGoalMarker` in `baseline.markers` by `goalId`:
  - `marker.portfolioValueAfter < 0` → `'at-risk'`
  - otherwise → `'on-track'`
- A one-time goal will always have exactly one corresponding marker whenever `baseline` was built
  from a goal list that included it (see `buildPortfolioWhatIfResult` in `whatIf.ts`), so no
  fallback/undefined case needs to be designed for in practice — the function is still total or
  falls back to `'on-track'` defensively if a lookup ever misses, without throwing.

## GoalRiskSummary

A portfolio-level aggregate for the always-visible stat strip (User Story 2 / FR-005).

```ts
export type GoalRiskSummary = {
  atRisk: number;
  total: number; // one-time goals only; recurring goals never counted (FR-005)
};
```

**Derivation** (`src/domain/goalRiskStatus.ts`, new file):

```ts
export function summarizeGoalRisk(
  statuses: Record<string, GoalRiskDisplayStatus>,
): GoalRiskSummary
```

- Filters out every `'not-evaluated'` entry, then counts `'at-risk'` vs. the remaining total.
- `total === 0` (no one-time goals in the plan, or no goals at all) is the caller's signal to
  suppress the summary/caption entirely (FR-006, and the edge case for all-recurring plans).

## Relationship to existing types

```text
FinancialGoal[]  ──┐
investmentAllocations ─┼─▶ buildPortfolioWhatIfResult(goals, sips, allocations, EMPTY_ADJUSTMENTS)
investmentLogs (sips) ─┘        │  (whatIf.ts — UNCHANGED)
                                 ▼
                        PortfolioWhatIfResult
                         { markers: WhatIfGoalMarker[], totalShortfall, status, ... }
                                 │
                                 ▼
                  deriveGoalRiskStatuses(goals, baseline)   ──▶  Record<goalId, GoalRiskDisplayStatus>
                                 │                                        │
                                 ▼                                        ▼
                  summarizeGoalRisk(statuses)                    GoalCard chip (per goal,
                    ──▶ GoalRiskSummary                            inside Goals drawer)
                                 │
                                 ▼
                  PlannerStatStrip summary + reconciled
                  "Monthly Investing" caption/color (FR-009)
```

No new entity is stored in `PlannerData`. No new IndexedDB/localStorage/Drive fields. No schema
migration.
