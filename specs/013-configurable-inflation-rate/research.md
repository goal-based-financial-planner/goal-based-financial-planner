# Research: User-Configurable Inflation Rate

**Feature**: 013-configurable-inflation-rate  
**Date**: 2026-05-13

## Decision 1: Where to store `inflationRate`

**Decision**: Add `inflationRate: number` as a field on the existing `PlannerData` class (`src/domain/PlannerData.ts`), defaulting to `DEFAULT_INFLATION_RATE` (5).

**Rationale**: `PlannerData` is already the single plan-level data container persisted to both localStorage and Google Drive. Adding the field here means persistence is automatic — both storage providers serialize the entire `PlannerData` object. A default parameter value ensures legacy plans (with no stored `inflationRate`) deserialize correctly and continue to behave identically (backward compatibility, SC-003).

**Alternatives considered**:
- Separate `planSettings` object on `PlannerData` — adds indirection for a single scalar; rejected as over-engineering.
- `localStorage` key separate from plan data — breaks Google Drive sync; rejected.

---

## Decision 2: How to pass `inflationRate` into `getInflationAdjustedTargetAmount()`

**Decision**: Add `inflationRate` as an explicit parameter with a default value of `DEFAULT_INFLATION_RATE`:
```
getInflationAdjustedTargetAmount(inflationRate: number = DEFAULT_INFLATION_RATE): number
```

**Rationale**: `FinancialGoal` is a domain entity and must not import from `PlannerData` (would create a circular dependency). The caller (component or hook) holds `plannerData.inflationRate` and passes it explicitly. The default value preserves all existing tests and callers that don't supply a rate.

**Alternatives considered**:
- React Context for inflation rate — avoids prop-drilling but violates the domain layer's independence from React. Rejected per Constitution Principle I.
- Global mutable singleton — unsafe for testing and violates the immutability pattern in the reducer. Rejected.

---

## Decision 3: Reducer action for updating inflation rate

**Decision**: Add `UPDATE_INFLATION_RATE` to `PlannerDataActionType` enum and a corresponding `updateInflationRate(dispatch, rate: number)` action creator. The reducer creates a new `PlannerData` instance with the new rate and all other fields unchanged.

**Rationale**: Consistent with the existing action/reducer pattern for all other plan mutations. Keeps state changes traceable and testable.

**Alternatives considered**:
- Local `useState` in Planner — would not persist to storage (autosave is triggered by reducer state changes). Rejected.

---

## Decision 4: UI placement of the inflation rate control

**Decision**: New `InflationRateControl` component placed inside the Planner page layout adjacent to `TargetBox`. It is a small inline numeric input (0–20 %) with a `%` suffix adornment.

**Rationale**: `TargetBox` displays "Total Goal Target" — the inflation-adjusted corpus across all goals. The inflation rate directly drives this displayed number, so placing the control next to it makes the cause-effect relationship immediately visible. The spec (Clarifications, Q1) explicitly chose a persistent inline control near the total monthly investment header.

**Alternatives considered**:
- Inside `TargetBox` — would require `TargetBox` to accept a dispatch prop for a concern unrelated to its primary purpose. Rejected; prefer a sibling component.
- Modal/settings drawer — ruled out by user clarification (Q1 answer: Option A).

---

## Decision 5: Applying inflation to recurring goals

**Decision**: Remove the `if (this.goalType === GoalType.RECURRING) return this.targetAmount` early-return guard in `getInflationAdjustedTargetAmount()`. Apply the same compound formula using `this.recurringDurationYears ?? 1` as the exponent.

**Rationale**: This matches the spec (FR-005, FR-006) and the user's intent. A recurring goal with a 3-year duration and 5 % inflation should require a 15.76 % larger monthly contribution to keep pace with costs.

**Alternatives considered**:
- Average-year inflation (apply half the duration) — more sophisticated but not aligned with how one-time goals work; rejected for consistency.
- No inflation on recurring goals — the existing behaviour that this feature explicitly fixes. Rejected.

---

## Decision 6: Displaying nominal vs inflation-adjusted target

**Decision**: `GoalCard` already shows the inflation-adjusted amount as the primary figure. Add a MUI `Tooltip` wrapping the corpus value, with tooltip content showing the original nominal amount: e.g., "Original target: ₹10,00,000".

**Rationale**: Matches spec Clarification Q2 (Option C). MUI `Tooltip` is already in use throughout the app (Constitution Principle III — use existing library, wrapped if widely used). No new dependencies needed.

**Alternatives considered**:
- Inline secondary text below the corpus — takes vertical space in an already dense GoalCard. Rejected.
- Info icon with popover — more discoverable but heavier implementation for a small informational note. Deferred.

---

## Callsites requiring `inflationRate` parameter

All production callsites of `getInflationAdjustedTargetAmount()` that must be updated to pass `plannerData.inflationRate`:

| File | Line | Context |
|------|------|---------|
| `src/pages/Planner/index.tsx` | 55 | `targetAmount` useMemo |
| `src/pages/Planner/index.tsx` | 117 | `termTypeSum` in termTypeWiseProgressData |
| `src/pages/Planner/index.tsx` | 255 | CongratulationsPage goal data |
| `src/pages/Planner/components/GoalCard/index.tsx` | 55 | `formattedTargetAmount` |
| `src/pages/Planner/components/GoalCard/index.tsx` | 61 | `progressPercentage` |
| `src/pages/Planner/components/PrintableReport/index.tsx` | 119 | `targetAmount` variable |
| `src/pages/Planner/components/PrintableReport/index.tsx` | 128 | formatted display |
| `src/pages/Planner/hooks/useInvestmentCalculator.ts` | 78 | `calculateTotalMonthlySIP` input |

Test callsites (lines 207, 222, 250, 263 in `FinancialGoals.test.ts`) will continue to work without change due to the default parameter, but should be updated to explicitly test configurable rates and recurring goal inflation.

---

## Existing test coverage gap

`FinancialGoals.test.ts` line 222 currently asserts:
```
expect(goal.getInflationAdjustedTargetAmount()).toBe(100000);  // recurring → no inflation
```
This test will change behaviour after the fix. It must be updated to reflect the new expected value: `100000 * (1.05)^1 = 105000` (1-year default). New test cases to add:
- Custom rate on one-time goal
- Custom rate on recurring goal with multi-year duration
- Rate of 0% returns nominal amount
