# Data Model: Planner Page Layout Redesign

**Feature**: 016-layout-redesign
**Date**: 2026-07-11

---

## Overview

This feature is a pure UI restructure. No new domain entities, no storage changes, no new data types. All data already exists and flows through existing props. This document captures the **new prop surfaces** and **lifted computations** introduced by the redesign.

---

## New Component: PlannerStatStrip

```ts
type PlannerStatStripProps = {
  targetAmount: number;      // sum of getInflationAdjustedTargetAmount() across all goals
  totalRequired: number;     // sum of all aggregated investment suggestion amounts
  totalInvesting: number;    // sum of all SIP monthlyAmount values
};
```

**Source of truth for each prop (all computed in Planner/index.tsx):**

| Prop | Derivation |
|------|-----------|
| `targetAmount` | Already exists: `plannerData.financialGoals.reduce(sum + goal.getInflationAdjustedTargetAmount(), 0)` |
| `totalRequired` | New memo: aggregate `investmentBreakdownForAllGoals[*].investmentSuggestions[*].amount` by name, round and sum |
| `totalInvesting` | New memo: `plannerData.investmentLogs.reduce((sum, s) => sum + s.monthlyAmount, 0)` |

---

## Modified Component: Planner (index.tsx)

### New state
```ts
const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0); // 0=Goals, 1=Investment Plan, 2=Portfolio
```

### New memos
```ts
// For stat strip
const totalRequired: number   // aggregated from investmentBreakdownForAllGoals
const totalInvesting: number  // sum of plannerData.investmentLogs[*].monthlyAmount
```

### Removed state
- `showDrawer` / `setShowDrawer` — drawer for goal list on mobile is removed (Goals tab replaces it)

### Props to GoalBox (no change)
GoalBox receives the same props as before; it is just rendered inside the Goals tab instead of as a sidebar.

---

## Modified Component: GoalList

No prop changes. Layout changes only: wraps GoalCard instances in a `Grid2` container instead of a flex column.

```
Before: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
After:  <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>  ← per goal
```

---

## Modified Component: InvestmentTracker

### Removed props
None — props are unchanged.

### Removed internal computations (moved to Planner)
- `totalRequired` computation (was duplicated; now only in Planner for stat strip)
- `totalInvesting` computation (same)

### Removed rendered elements
- Monthly Required / Monthly Investing stat boxes
- `GoalGrowthChart` (moved to Portfolio tab)

### Remaining
- Comparison bars (By Instrument Type)
- SIP list + Add SIP button

---

## No Changes To

- `FinancialGoal` domain class
- Storage layer (`localFileProvider`, `googleDriveProvider`)
- `investmentCalculations.ts`
- `investmentLog.ts`
- `plannerDataReducer.ts` / `plannerDataActions.ts`
- `PlannerData` type
- `SIPEntry` type
- `GoalCard` props (unchanged; only styling)
- `GoalGrowthChart` props (unchanged; just moved in hierarchy)
- `InvestmentSuggestionsBox` props (unchanged)
- `PrintableReport` (self-contained, unaffected)
