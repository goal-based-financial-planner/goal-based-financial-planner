# Data Model: Show Total Monthly Investment Summary

**Branch**: `011-total-monthly-investment` | **Date**: 2026-04-19

## Overview

No new persistent entities. The total monthly investment is a **derived scalar** computed at render time from existing plan data. No schema changes, no new storage keys.

---

## Derived Value

### `totalMonthlyInvestment: number`

**Derivation**:
```
totalMonthlyInvestment =
  sum of investmentSuggestion.amount
  for every investmentSuggestion
  in every GoalWiseInvestmentSuggestions entry
  in investmentBreakdownForAllGoals
```

**Source**: `investmentBreakdownForAllGoals` (already computed in `Planner/index.tsx` via `calculateInvestmentNeededForGoals`).

**Active-goal filtering**: Already handled upstream — the calculator sets `investmentSuggestions = []` for completed/inactive goals (`isGoalActive` check in `useInvestmentCalculator.ts:49`). No additional filtering required at the summation site.

**Rounding**: Round to nearest integer (consistent with other monetary display values in the app).

---

## Prop Surface Change

### `TargetBoxProps` (in `src/pages/Planner/components/TargetBox/index.tsx`)

| Field | Type | Required | Change |
|-------|------|----------|--------|
| `targetAmount` | `number` | yes | existing — unchanged |
| `dispatch` | `Dispatch<PlannerDataAction>` | yes | existing — unchanged |
| `termTypeWiseProgressData` | `TermTypeWiseProgressData[]` | yes | existing — unchanged |
| `setShowDrawer` | `(v: boolean) => void` | yes | existing — unchanged |
| `totalMonthlyInvestment` | `number` | **new** | added |

---

## Data Flow Diagram

```
Planner/index.tsx
  └─ useMemo: investmentBreakdownForAllGoals   (existing)
       └─ useMemo: totalMonthlyInvestment      (NEW — sum of all .amount)
            └─ prop → TargetBox
                 └─ LiveCounter (size="small") — renders formatted value
```
