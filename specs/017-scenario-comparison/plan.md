# Implementation Plan: What If

**Branch**: `017-scenario-comparison` | **Date**: 2026-07-19 (3rd revision) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-scenario-comparison/spec.md`

## Summary

Add a "What If" tab to the Planner page: a slider per one-time goal for inflation rate, a slider per
investment type for expected return, and one combined chart (`Current Plan` vs `What If`) that
updates live as sliders move, summing every goal's independent projection onto a shared calendar.
Nothing is persisted — adjustments are local component state (`useState` in `useWhatIf`) that
resets whenever the tab is reopened. The planned monthly investment per goal is always the baseline
required amount; a slider only changes the assumption used to project it, never the amount itself.

This is the third design of this feature on this branch. See [research.md](./research.md) for the
two earlier, abandoned designs (named/saved scenarios with SIP-amount overrides on a shared-
withdrawal chart; then named/saved scenarios with per-goal charts) and why each was replaced.

## Technical Context

**Language/Version**: TypeScript 4.x + React 19.2.4
**Primary Dependencies**: `@mui/material` v6 (`Slider`, already available), `@mui/x-charts` ^7.23.6, `dayjs` ^1.11.13
**Storage**: None — no `PlannerData` changes, no storage-provider changes; fully ephemeral
**Testing**: Vitest + `@testing-library/react` ^16.0.1
**Target Platform**: Browser (modern Chrome, Firefox, Safari); responsive from 375px to 1920px
**Project Type**: React SPA (single-page web app)
**Performance Goals**: Slider drag must feel live — recomputation is a `useMemo`'d O(goals × months)
loop per render, cheap enough (typically 3–10 goals × up to 360 months) to run on every drag tick
**Constraints**: No new npm dependencies; slider ranges bounded to 0–20% (both inflation and return)
for a realistic, exploratory feel
**Scale/Scope**: Typical user has 3–10 one-time goals and 2–6 distinct investment types

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering | ✅ Pass | All math in `src/domain/whatIf.ts`, reusing `calculateInvestmentSuggestionsForGoal` / `calculateFutureValue` from `investmentCalculations.ts` and the parameterized `FinancialGoal.getInflationAdjustedTargetAmount`. UI is presentational, driven entirely by `useWhatIf`. |
| II. Feature Co-location | ✅ Pass | `src/pages/Planner/components/WhatIf/` + `src/pages/Planner/hooks/useWhatIf.ts`; domain concept in `src/domain/whatIf.ts`, no UI dependency. |
| III. Upgrade-Friendly | ✅ Pass | Reuses the existing `LineChart`/`ChartsReferenceLine` wrapping pattern; `Slider` is MUI core, no new dependency. |
| IV. Type Safety | ✅ Pass | `Adjustments`, `GoalWhatIfResult`, `PortfolioWhatIfResult` defined once, no `any`. |
| V. Predictable Change | ✅ Pass | `buildGoalWhatIfResult`/`buildPortfolioWhatIfResult` have unit tests covering fixed-SIP-under-inflation-override, reduced-projection-under-return-override, unrelated-instrument-no-effect, empty-goal-list, and combined-calendar-span behavior; `useWhatIf` has hook-level tests for live state updates and reset. |

**No violations. No Complexity Tracking table needed.**

## Project Structure

### Documentation (this feature)

```text
specs/017-scenario-comparison/
├── plan.md              ← this file
├── research.md          ← Phase 0 output (all 3 revisions)
├── data-model.md         ← Phase 1 output
├── quickstart.md         ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md              ← Phase 2 output
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── whatIf.ts                          ← buildGoalWhatIfResult, buildPortfolioWhatIfResult
│   ├── whatIf.test.ts
│   ├── investmentCalculations.ts          ← unchanged from prior revision (calculateInvestmentSuggestionsForGoal)
│   └── FinancialGoals.ts                  ← unchanged from prior revision (rateOverride param)
│
└── pages/
    └── Planner/
        ├── hooks/
        │   └── useWhatIf.ts                       ← owns Adjustments state, exposes baseline/adjusted results
        ├── index.tsx                              ← MODIFIED: third tab now "What If", renders <WhatIf plannerData={plannerData} />
        └── components/
            └── WhatIf/
                ├── index.tsx                       ← sliders (inflation per goal, return per instrument) + status chips
                ├── index.test.tsx
                └── WhatIfChart/
                    ├── index.tsx                   ← two-line LineChart (Current Plan vs What If) + target reference line
                    └── index.test.tsx
```

Reverted from the prior revision (no longer exist): `src/types/scenario.ts`, `src/domain/scenarios.ts`,
`src/pages/Planner/hooks/useScenarioProjections.ts`,
`src/pages/Planner/components/ScenarioComparison/` (and its `GoalScenarioChart`/`ScenarioOverrideForm`
children), the `scenarios` field on `PlannerData`, the 6 scenario reducer actions, and the storage
providers' scenario parsing.

**Structure Decision**: Single-project React SPA, same layout as prior features — but this revision
is deliberately smaller than the previous two: one domain file, one hook, one composition component,
one chart component. No persistence layer at all.

## Phase 0: Research Findings

See [research.md](./research.md) for the full decision log across all three revisions. Summary of
what's live now:

| Topic | Decision |
|-------|----------|
| Persistence | None — `Adjustments` is local `useState`, resets on tab open |
| Scope | No named/saved scenarios, no comparing more than one adjustment at a time |
| Scope | No per-goal chart/browsing — one combined chart, one pair of status figures |
| Planned SIP | Always fixed at baseline; sliders only change inflation/return assumptions |
| Combined series | Sum of independent per-goal curves on a shared calendar, not a withdrawal simulation |
| Interaction | Live update on slider drag (`onChange`, not `onChangeCommitted`) |

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) for full type definitions and the computation algorithm.

## Implementation Sequence (as executed, this revision)

1. Revert persistence layer: `PlannerData.scenarios` field, both storage providers, all 6 scenario
   reducer actions/cases, associated tests
2. Delete prior revision's domain/type/UI files (`types/scenario.ts`, `domain/scenarios.ts`,
   `useScenarioProjections.ts`, `ScenarioComparison/` tree)
3. `src/domain/whatIf.ts` (`buildGoalWhatIfResult`, `buildPortfolioWhatIfResult`) + unit tests
4. `useWhatIf` hook (owns `Adjustments` state, memoized baseline/adjusted results) + hook tests
5. `WhatIfChart` component (two-line chart + target reference line) + tests
6. `WhatIf` composition (slider sections + status chips + chart) + tests
7. `Planner/index.tsx` tab wiring (rename to "What If", swap component)
8. Full verification: `npx vitest run`, `tsc --noEmit`, `npm run build`

Each step was independently testable and verified before moving to the next.
