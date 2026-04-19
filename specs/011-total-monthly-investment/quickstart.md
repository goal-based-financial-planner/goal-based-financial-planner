# Quickstart: Show Total Monthly Investment Summary

**Branch**: `011-total-monthly-investment`

## Files to change

| File | Change |
|------|--------|
| `src/pages/Planner/index.tsx` | Add `totalMonthlyInvestment` `useMemo`; pass as prop to `TargetBox` |
| `src/pages/Planner/components/TargetBox/index.tsx` | Add `totalMonthlyInvestment` prop; render second `LiveCounter` |
| `src/pages/Planner/components/TargetBox/index.test.tsx` | Add/create test for new prop rendering |

## Dev workflow

```bash
# Start dev server
npm start

# Verify manually:
# 1. Add 2+ goals → TargetBox shows "Monthly Investment Required" with animated value
# 2. Change date to past goal's target → total decreases (completed goal excluded)
# 3. Add/remove a goal → total updates immediately

# Run tests
npm test -- --testPathPattern=TargetBox
```

## Key constraint

The `totalMonthlyInvestment` `useMemo` MUST depend on `investmentBreakdownForAllGoals` (which already depends on `selectedDate` and `plannerData`), ensuring automatic reactivity.
