# Quickstart: Investment Tracking (005)

**Branch**: `005-investment-tracking`

## Prerequisites

- Node.js 18+ and npm (or the package manager used by the project)
- Repository checked out on branch `005-investment-tracking`

## Install & Run

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`. All data is stored in browser `localStorage`; no backend is required.

## Run Tests

```bash
npm test
```

To run with coverage enforcement:

```bash
npm run test:cov
```

Coverage thresholds: branches 55%, functions/lines/statements 63%.

## Files Touched by This Feature

### New files

| File | Purpose |
|------|---------|
| `src/types/investmentLog.ts` | `InvestmentLogEntry`, `MonthlyInvestmentSummary`, `MonthGroup`, payload types |
| `src/domain/investmentLog.ts` | Pure domain functions: cumulative totals, monthly comparison, grouping |
| `src/domain/investmentLog.test.ts` | Unit tests for all domain functions |
| `src/pages/Planner/components/GoalCard/components/InvestmentTracker/index.tsx` | "Track" section container: comparison table + add button |
| `src/pages/Planner/components/GoalCard/components/InvestmentTracker/index.test.tsx` | Component smoke tests |
| `src/pages/Planner/components/GoalCard/components/LogEntryForm/index.tsx` | Modal form: month picker, investment type, amount input |
| `src/pages/Planner/components/GoalCard/components/InvestmentLogHistory/index.tsx` | History list with edit/delete per entry |

### Modified files

| File | Change |
|------|--------|
| `src/domain/PlannerData.ts` | Add `investmentLogs: InvestmentLogsMap` field and constructor param |
| `src/store/plannerDataActions.ts` | Add 3 new action types + 3 action creator functions |
| `src/store/plannerDataReducer.ts` | Handle 3 new action types; cascade delete from `DELETE_FINANCIAL_GOAL`; migrate old data in `getInitialData()` |
| `src/pages/Planner/components/GoalCard/index.tsx` | Add `trackExpanded` state; "Track Investments" toggle row; pass `investmentLogs` + `dispatch` to `InvestmentTracker`; update `memo` comparator |

## Key Patterns to Follow

### Adding domain logic
All calculation functions go in `src/domain/investmentLog.ts` as pure exported functions. No imports from `src/pages/` or `src/components/`.

### Adding reducer actions
1. Add enum value to `PlannerDataActionType` in `plannerDataActions.ts`.
2. Add action creator function in the same file.
3. Add a `case` in `plannerDataReducer.ts` that returns a new `PlannerData` instance.

### Persisting data
No changes needed to the persistence call — `persistPlannerData()` in `src/pages/Home/index.tsx` already serialises the full `PlannerData` object on every state change.

### GoalCard memo comparator
Add `logEntryCount` (total entries for this goal) as a prop to `GoalCard` and include it in the custom comparator so the card re-renders after log mutations.

## Manual Testing Checklist

1. Add a goal → open GoalCard → "Track Investments" toggle appears only when investment suggestions exist.
2. Click "Track Investments" → SIP breakdown and Track section expand independently.
3. Log an entry (valid month, positive amount) → entry appears in history and comparison view.
4. Try logging for a future month → form blocks submission.
5. Try logging for a month before goal start → form blocks submission.
6. Edit an entry → amount updates in history and comparison.
7. Delete an entry → entry disappears; cumulative total decreases.
8. Delete the parent goal → all associated log entries are removed from storage.
9. Refresh browser → all log entries persist.
10. Change investment allocations → comparison view updates suggested amounts retroactively; logged actuals unchanged.
