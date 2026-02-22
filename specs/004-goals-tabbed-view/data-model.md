# Data Model: Tabbed Financial Goals View

**Feature**: 004-goals-tabbed-view
**Date**: 2026-02-22

## Overview

This feature involves **no data model changes**. All entities (`FinancialGoal`, `GoalType`) remain identical. The only change is UI state (active tab index) and a label string in the recurring goals table.

---

## Existing Entities (unchanged)

### GoalType (enum)

```
GoalType
├── ONE_TIME  → displayed in "One Time" tab
└── RECURRING → displayed in "Recurring" tab
```

Location: `src/types/enums.ts`
No changes.

### FinancialGoal (domain class)

Key fields used by this feature:

| Field | Type | Used by |
|-------|------|---------|
| `id` | string | React key |
| `goalName` | string | Display name |
| `goalType` | GoalType | Tab routing |
| `targetDate` | string | pending vs completed split |
| `getTargetAmount()` | number | Recurring table (yearly amount) |
| `getInflationAdjustedTargetAmount()` | number | GoalCard display |

Location: `src/domain/FinancialGoals.ts`
No changes.

---

## New UI State

### GoalBox tab state

| Field | Type | Default | Scope |
|-------|------|---------|-------|
| `activeTab` | `0 \| 1` | `0` | Local to `GoalBox/index.tsx` |

- `0` = "One Time" tab
- `1` = "Recurring" tab
- Ephemeral: resets to `0` on page reload

---

## Derived Values (computed, not stored)

| Value | Formula | Used in |
|-------|---------|---------|
| One Time tab count | `pendingGoals.length + completedGoals.length` | Tab label |
| Recurring tab count | `recurringGoals.length` | Tab label |
| pending goals | `goals where goalType === ONE_TIME && targetDate > selectedDate` | One Time tab |
| completed goals | `goals where goalType === ONE_TIME && targetDate <= selectedDate` | One Time tab sub-section |
| recurring goals | `goals where goalType === RECURRING` | Recurring tab |

All derivations already exist in `GoalBox/index.tsx` via `useMemo`. No new calculations introduced.

---

## Component Prop Interfaces (unchanged)

### GoalBox props (no change)

```typescript
type GoalBoxProps = {
  financialGoals: FinancialGoal[];
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
  useStyledBox: boolean;
};
```

### RecurringGoalsTable props (no change)

```typescript
type RecurringGoalsTableProps = {
  recurringGoals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};
```

### GoalList props (no change)

```typescript
type GoalListProps = {
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  goals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};
```
