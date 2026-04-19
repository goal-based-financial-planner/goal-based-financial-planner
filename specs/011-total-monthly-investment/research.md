# Research: Show Total Monthly Investment Summary

**Branch**: `011-total-monthly-investment` | **Date**: 2026-04-19

## Summary

No external unknowns. All decisions are resolved from direct code inspection. This is a purely additive, display-only change that derives a scalar from existing calculated data.

---

## Decision 1: Where does the total monthly investment value come from?

**Decision**: Sum the `amount` field across all `investmentSuggestions` entries in every element of `investmentBreakdownForAllGoals` in `Planner/index.tsx`.

**Rationale**: `calculateInvestmentNeededForGoals` already returns `GoalWiseInvestmentSuggestions[]`, where each goal's `investmentSuggestions[].amount` is the per-instrument monthly SIP portion. Summing all amounts across all goals gives the total monthly commitment. Goals that are completed/inactive already have their `investmentSuggestions` set to `[]` by the calculator (`isGoalActive` check), so no additional filtering is needed.

**Alternatives considered**: Re-running the SIP formula separately — rejected because the data is already computed and available in the same `useMemo` scope.

---

## Decision 2: Where is the total computed?

**Decision**: Computed as a `useMemo` in `Planner/index.tsx`, derived from `investmentBreakdownForAllGoals`.

**Rationale**: Constitution Principle I requires business/derivation logic to stay out of UI components. `Planner/index.tsx` is already the derivation layer for all investment calculations (all existing `useMemo` blocks live there). Adding one more `useMemo` here is consistent with the pattern.

**Alternatives considered**: Computing inside `TargetBox` — rejected (would require passing raw breakdown data to a component that only needs a scalar, violating single-responsibility and the constitution's UI-stays-presentational rule).

---

## Decision 3: How is the value rendered in TargetBox?

**Decision**: Add a second `LiveCounter` (with `size="small"`) below the existing corpus total, with an `overline`-style label "Monthly Investment Required".

**Rationale**: `LiveCounter` is already the established pattern for animated currency display in `TargetBox`. Using `size="small"` visually subordinates the monthly figure relative to the primary corpus target, preserving information hierarchy. No new component is needed.

**Alternatives considered**: Plain `Typography` — rejected because it breaks visual consistency; all monetary figures in `TargetBox` use `LiveCounter`. A dedicated new component — rejected as over-engineering for a scalar display.

---

## Decision 4: Test strategy

**Decision**: Add a unit test to `TargetBox/index.test.tsx` (or create it if absent) that verifies the "Monthly Investment Required" label and formatted amount render when `totalMonthlyInvestment` is supplied. No test needed for the summation logic since the underlying per-goal SIP calculations are already covered in `useInvestmentCalculator.test.ts`.

**Rationale**: Constitution Principle V requires at least one automated check for key flows. The summation is trivial arithmetic with no branching — the meaningful test is that `TargetBox` surfaces the value correctly.
