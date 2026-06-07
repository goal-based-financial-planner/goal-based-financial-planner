# Implementation Plan: User-Configurable Inflation Rate

**Branch**: `013-configurable-inflation-rate` | **Date**: 2026-05-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-configurable-inflation-rate/spec.md`

## Summary

Add a user-editable plan-level inflation rate (default 5 %) that replaces the hardcoded constant used today. The rate is stored on `PlannerData`, surfaced as a persistent inline control near the TargetBox on the Planner page, and applied uniformly to both one-time and recurring goals via the existing `getInflationAdjustedTargetAmount()` method (which currently skips recurring goals entirely). GoalCard continues to display the inflation-adjusted corpus as the primary figure and adds a tooltip showing the original nominal amount entered by the user.

## Technical Context

**Language/Version**: TypeScript 4.x  
**Primary Dependencies**: React 19.2.4, MUI v6 (`@mui/material`), react-hook-form (existing), Vite 8.0.0, Vitest  
**Storage**: Browser `localStorage` (local) + Google Drive REST API (cloud) — via `src/util/storage/storageProvider.ts`  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web browser (desktop-first, responsive)  
**Project Type**: React SPA (no backend)  
**Performance Goals**: All goal recalculations update within 1 second of inflation rate change (SC-001)  
**Constraints**: Offline-capable; no backend API; plan data persisted as JSON blob  
**Scale/Scope**: Single-user plan; all calculations are client-side, O(n) over number of goals

## Constitution Check

| Principle | Assessment | Notes |
|-----------|------------|-------|
| I. Clear Layering (Domain → State → UI) | ✅ Pass | Inflation formula stays in `src/domain/FinancialGoals.ts`; `inflationRate` field on `PlannerData`; UI components only read and dispatch — no business logic added to components |
| II. Feature Co-location + Stable Shared Surface | ✅ Pass | New `InflationRateControl` component lives under `src/pages/Planner/components/`; no shared component polluted |
| III. Upgrade-Friendly Boundaries | ✅ Pass | `DEFAULT_INFLATION_RATE` constant remains in `src/domain/constants.ts`; only the rename from `INFLATION_PERCENTAGE` is a cross-cutting change, done in one place |
| IV. Type Safety and Explicit Contracts | ✅ Pass | `inflationRate: number` on `PlannerData`; all callsites explicitly typed; no `any` introduced |
| V. Predictable Change (Tests Where It Counts) | ✅ Pass | Domain formula change (recurring goal inflation + parameterised rate) MUST have unit tests; existing tests updated to pass the rate explicitly |

**No violations.** Complexity Tracking table omitted.

## Project Structure

### Documentation (this feature)

```text
specs/013-configurable-inflation-rate/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── constants.ts                        ← rename INFLATION_PERCENTAGE → DEFAULT_INFLATION_RATE
│   ├── FinancialGoals.ts                   ← update getInflationAdjustedTargetAmount(rate)
│   └── PlannerData.ts                      ← add inflationRate: number (default DEFAULT_INFLATION_RATE)
├── store/
│   ├── plannerDataActions.ts               ← add UPDATE_INFLATION_RATE enum value + action creator
│   └── plannerDataReducer.ts               ← handle UPDATE_INFLATION_RATE; pass inflationRate through all PlannerData constructors
└── pages/Planner/
    ├── components/
    │   ├── InflationRateControl/
    │   │   └── index.tsx                   ← NEW: inline % input with validation, dispatches UPDATE_INFLATION_RATE
    │   └── GoalCard/
    │       └── index.tsx                   ← add Tooltip wrapping the corpus figure, showing nominal amount
    ├── hooks/
    │   └── useInvestmentCalculator.ts      ← thread inflationRate into getInflationAdjustedTargetAmount() calls
    └── index.tsx                           ← pass plannerData.inflationRate to all components; place InflationRateControl near TargetBox
```

**Structure Decision**: Single-project layout (existing). All changes are within `src/`. No new top-level directories.
