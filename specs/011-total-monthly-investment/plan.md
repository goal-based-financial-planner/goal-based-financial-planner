# Implementation Plan: Show Total Monthly Investment Summary

**Branch**: `011-total-monthly-investment` | **Date**: 2026-04-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/011-total-monthly-investment/spec.md`

## Summary

Surface the total monthly investment required across all active financial goals as a single animated currency figure inside the existing `TargetBox` summary panel. The value is derived from the already-computed `investmentBreakdownForAllGoals` in `Planner/index.tsx`; no new storage, no new calculation logic, and no new components are needed.

## Technical Context

**Language/Version**: TypeScript 4.x  
**Primary Dependencies**: React 19.2.4, MUI v6 (`@mui/material`), Vite 8.0.0, Vitest  
**Storage**: N/A — derived display value only  
**Testing**: Vitest + React Testing Library (existing setup)  
**Target Platform**: Web browser (desktop + mobile)  
**Project Type**: React SPA (frontend only)  
**Performance Goals**: Renders within one React cycle on data change (no async work)  
**Constraints**: No new dependencies; no new storage keys; no layout changes outside `TargetBox`  
**Scale/Scope**: Single component change + one new prop + one new `useMemo`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering | ✅ Pass | Total computed in `Planner/index.tsx` (derivation layer); `TargetBox` stays purely presentational, receives a scalar prop |
| II. Feature Co-location | ✅ Pass | All changes within `src/pages/Planner/`; no cross-page imports introduced |
| III. Upgrade-Friendly | ✅ Pass | Only existing MUI + internal components used; `LiveCounter` wrapper already in place |
| IV. Type Safety | ✅ Pass | New `totalMonthlyInvestment: number` prop is typed; `TargetBoxProps` updated |
| V. Predictable Change | ✅ Pass | `TargetBox` test added/updated to cover new prop; underlying SIP math already tested |

No violations. Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/011-total-monthly-investment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (files changed by this feature)

```text
src/pages/Planner/
├── index.tsx                                    # +useMemo totalMonthlyInvestment; pass to TargetBox
└── components/
    └── TargetBox/
        ├── index.tsx                            # +prop totalMonthlyInvestment; +LiveCounter render
        └── index.test.tsx                       # +test for new prop display
```

**Structure Decision**: Single-project, feature co-located under `src/pages/Planner/`. No new directories created.

## Phase 0: Research

*See [research.md](./research.md) for full decision log.*

Key decisions:
1. **Total source**: Sum `investmentSuggestions[].amount` from `investmentBreakdownForAllGoals` — already computed, already filters inactive goals.
2. **Computation site**: New `useMemo` in `Planner/index.tsx` (consistent with existing derivation pattern).
3. **Render**: Second `LiveCounter` (size `"small"`) inside `TargetBox`, below the corpus total.
4. **Test**: Unit test in `TargetBox/index.test.tsx` for label + value rendering.

No NEEDS CLARIFICATION items remain.

## Phase 1: Design & Contracts

*See [data-model.md](./data-model.md) for full entity/prop breakdown.*

### Design

**Step 1 — `Planner/index.tsx`**: Add a `useMemo` that depends on `investmentBreakdownForAllGoals`:

```
totalMonthlyInvestment = Math.round(
  investmentBreakdownForAllGoals
    .flatMap(g => g.investmentSuggestions)
    .reduce((sum, s) => sum + s.amount, 0)
)
```

Pass `totalMonthlyInvestment` to `<TargetBox ... />`.

**Step 2 — `TargetBox/index.tsx`**: Extend `TargetBoxProps` with `totalMonthlyInvestment: number`. Render below the corpus `LiveCounter`:

```
<Typography variant="overline" ...>Monthly Investment Required</Typography>
<LiveCounter value={totalMonthlyInvestment} duration={500} size="small" />
```

**Step 3 — `TargetBox/index.test.tsx`**: Test that given a `totalMonthlyInvestment` prop value, the label "Monthly Investment Required" and the formatted amount appear in the rendered output.

### Contracts

N/A — purely internal React component interface; no external API or public library surface.

## Implementation Sequence

| Step | File | Change | Test |
|------|------|--------|------|
| 1 | `Planner/index.tsx` | Add `totalMonthlyInvestment` `useMemo` | Covered by existing `useInvestmentCalculator` tests |
| 2 | `Planner/index.tsx` | Pass prop to `<TargetBox>` | Visual verification |
| 3 | `TargetBox/index.tsx` | Add prop type + render second `LiveCounter` | New unit test |
| 4 | `TargetBox/index.test.tsx` | Add test for label + formatted value | Vitest |
