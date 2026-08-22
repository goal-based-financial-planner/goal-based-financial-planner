# Implementation Plan: Goal Risk Dashboard

**Branch**: `018-goal-risk-dashboard` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-goal-risk-dashboard/spec.md`

## Summary

Surface the goal-attainment signal that today only exists inside the What-If tab (`whatIf.ts`'s
`buildPortfolioWhatIfResult`, called with no adjustments) as an always-visible, non-interactive
on-track/at-risk indicator on the main Planner screen: a per-goal chip on each one-time `GoalCard`
(recurring goals get a distinct "not evaluated" chip instead), a portfolio-level "N of M goals at
risk" summary, and a reconciled `PlannerStatStrip` shortfall caption that replaces its current naive
`totalInvesting >= totalRequired` heuristic. No new simulation logic — a new, small pure derivation
module reads the same per-goal `portfolioValueAfter` data the What-If tab's markers already carry,
guaranteeing the two surfaces can never disagree for an unmodified plan.

## Technical Context

**Language/Version**: TypeScript 4.x + React 19.2.4
**Primary Dependencies**: `@mui/material` v6 (`Chip`, already used by `GoalCard`/`PlannerStatStrip`), existing `src/domain/whatIf.ts` (`buildPortfolioWhatIfResult`, unmodified — reused, not extended), `dayjs` ^1.11.13 (indirectly, via `whatIf.ts`)
**Storage**: N/A — fully derived at render time from the existing `PlannerData` (`financialGoals`, `investmentAllocations`, `investmentLogs`) already loaded via `localStorage`/Google Drive; nothing new persisted, no `PlannerData` shape change
**Testing**: Vitest + `@testing-library/react` ^16.0.1, matching existing conventions (`whatIf.test.ts`, `GoalCard/index.test.tsx`)
**Target Platform**: Browser (modern Chrome, Firefox, Safari); responsive from 375px to 1920px (unchanged from 016-layout-redesign)
**Project Type**: React SPA (single-page web app) — no backend
**Performance Goals**: Negligible — one extra `useMemo`'d pass over data already computed for the What-If tab (typically 3–10 goals); no perceptible render-time change
**Constraints**: No new npm dependencies; MUST NOT modify `whatIf.ts`'s public behavior (only read its existing output); the new per-goal/summary indicators MUST be static (no click/navigation), per the resolved clarification
**Scale/Scope**: Same as existing plan — a handful to a few dozen goals per plan, client-side only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering | ✅ Pass | All new logic lives in `src/domain/goalRiskStatus.ts` (pure functions, no UI). `GoalCard`/`PlannerStatStrip` stay presentational — they receive already-derived `GoalRiskDisplayStatus`/`GoalRiskSummary` values as props, no calculation inside components. `whatIf.ts` itself is untouched. |
| II. Feature Co-location + Stable Shared Surface | ✅ Pass | New domain concept in `src/domain/` (shared, no UI dependency). Derivation is computed once in `Planner/index.tsx` (page-specific, matching that file's existing `useMemo` style for `totalRequired`/`totalInvesting`) and passed down — no new cross-page shared hook manufactured for a single call site. |
| III. Upgrade-Friendly Boundaries | ✅ Pass | No new 3rd-party dependency; reuses the already-wrapped MUI `Chip` pattern already present in `GoalCard` and `PlannerStatStrip`. |
| IV. Type Safety | ✅ Pass | New `GoalRiskDisplayStatus` (`'on-track' \| 'at-risk' \| 'not-evaluated'`) and `GoalRiskSummary` types defined once in `src/domain/goalRiskStatus.ts` and imported everywhere they're used; no `any`. |
| V. Predictable Change | ✅ Pass | `deriveGoalRiskStatuses`/`summarizeGoalRisk` are financial-adjacent derivation logic and get unit tests (one-time at-risk/on-track from markers, recurring → not-evaluated, shared-shortfall-marks-both-goals, empty-goals/all-recurring → total 0). `PlannerStatStrip`'s reconciled caption gets a new component test (none existed before); `GoalCard`'s existing test file is extended for the new chip. |

**No violations. No Complexity Tracking table needed.**

## Project Structure

### Documentation (this feature)

```text
specs/018-goal-risk-dashboard/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md              ← Phase 2 output (/speckit.tasks — not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── goalRiskStatus.ts                  ← NEW: deriveGoalRiskStatuses, summarizeGoalRisk, GoalRiskDisplayStatus, GoalRiskSummary
│   ├── goalRiskStatus.test.ts             ← NEW
│   └── whatIf.ts                          ← UNCHANGED (reused: buildPortfolioWhatIfResult, WhatIfGoalMarker.portfolioValueAfter)
│
└── pages/
    └── Planner/
        ├── index.tsx                              ← MODIFIED: computes baseline (EMPTY_ADJUSTMENTS) + goalRiskStatus.ts derivations via useMemo, passes down to PlannerStatStrip and (via GoalBox) GoalList/GoalCard
        └── components/
            ├── PlannerStatStrip/
            │   ├── index.tsx                       ← MODIFIED: accepts risk summary/status props, replaces totalInvesting>=totalRequired heuristic (FR-009)
            │   └── index.test.tsx                  ← NEW
            ├── GoalBox/
            │   └── goalList.tsx                    ← MODIFIED: threads per-goal status prop through to GoalCard
            └── GoalCard/
                ├── index.tsx                       ← MODIFIED: renders on-track/at-risk/not-evaluated chip
                └── index.test.tsx                  ← MODIFIED: covers new chip's three states
```

**Structure Decision**: Single existing frontend project (no backend, no new top-level directory).
This feature adds one new domain module (`src/domain/goalRiskStatus.ts`) that reuses `whatIf.ts`
without modifying it, and modifies three existing presentational components to render the derived
data as props — consistent with the codebase's existing domain/page/component layering.

## Complexity Tracking

*No entries — Constitution Check has no violations.*
