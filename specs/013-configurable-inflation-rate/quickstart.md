# Quickstart: User-Configurable Inflation Rate

**Feature**: 013-configurable-inflation-rate  
**Date**: 2026-05-13

## What this feature changes

The hardcoded `INFLATION_PERCENTAGE = 5` constant is replaced by a user-editable `inflationRate` field stored on the plan. The change touches five layers:

1. **Domain constant** — `INFLATION_PERCENTAGE` → `DEFAULT_INFLATION_RATE`
2. **Domain method** — `getInflationAdjustedTargetAmount()` accepts the rate as a parameter and now applies it to recurring goals
3. **Plan data model** — `PlannerData` gains `inflationRate: number`
4. **State management** — new `UPDATE_INFLATION_RATE` action + reducer case
5. **UI** — new `InflationRateControl` component + GoalCard tooltip for nominal amount

## Implementation order

Follow this sequence to avoid build breakage at each step:

### Step 1 — Rename constant and update domain method (domain layer only)

1. In `src/domain/constants.ts`: rename `INFLATION_PERCENTAGE` → `DEFAULT_INFLATION_RATE`.
2. In `src/domain/FinancialGoals.ts`: update the import name and change `getInflationAdjustedTargetAmount()` to accept `inflationRate: number = DEFAULT_INFLATION_RATE` and apply it to recurring goals.
3. Run tests: `npm test -- --run src/domain` — existing tests should still pass (default param preserves them). The "should NOT apply inflation to recurring goals" test will now fail and must be updated to expect `105000` (₹1L × 1.05¹).

### Step 2 — Add `inflationRate` to PlannerData

1. In `src/domain/PlannerData.ts`: add the constructor parameter and field.
2. In `src/store/plannerDataReducer.ts`: update every `new PlannerData(...)` call to forward `state.inflationRate` as the 5th argument.
3. Run: `npm run build` — should compile cleanly.

### Step 3 — Add reducer action

1. In `src/store/plannerDataActions.ts`: add `UPDATE_INFLATION_RATE` to the enum and the `updateInflationRate()` creator.
2. In `src/store/plannerDataReducer.ts`: add the case.
3. In `PlannerDataActionPayload` union: add `| number`.

### Step 4 — Thread `inflationRate` through Planner page and hooks

Update all 8 production callsites of `getInflationAdjustedTargetAmount()` to pass `plannerData.inflationRate`. See `research.md` for the full callsite table. Key files: `src/pages/Planner/index.tsx`, `src/pages/Planner/hooks/useInvestmentCalculator.ts`, `src/pages/Planner/components/GoalCard/index.tsx`, `src/pages/Planner/components/PrintableReport/index.tsx`.

### Step 5 — Build `InflationRateControl` component

Create `src/pages/Planner/components/InflationRateControl/index.tsx`:
- MUI `TextField` with `type="number"`, `inputProps={{ min: 0, max: 20, step: 0.01 }}`, and `InputAdornment` showing `%`.
- Controlled by local state; on blur/enter validate range [0, 20] and dispatch `updateInflationRate` if valid.
- Show MUI `FormHelperText` error when out of range.
- Prop: `inflationRate: number`, `dispatch: Dispatch<PlannerDataAction>`.

Place it in `src/pages/Planner/index.tsx` adjacent to `<TargetBox>` in the Grid layout.

### Step 6 — Add nominal amount tooltip to GoalCard

In `src/pages/Planner/components/GoalCard/index.tsx`:
- Wrap the displayed corpus amount in a MUI `Tooltip` with `title="Original target: {formatCurrency(goal.getTargetAmount())}"`.
- Pass `inflationRate` as a prop to `GoalCard` (add to `GoalCardProps` type).

### Step 7 — Update and add tests

Files to update/add tests in:
- `src/domain/FinancialGoals.test.ts` — update recurring goal test; add tests for custom rate and 0% rate
- `src/domain/PlannerData.test.ts` — add test for `inflationRate` default and constructor
- `src/pages/Planner/hooks/useInvestmentCalculator.test.ts` — pass inflationRate in test setups

## Running the feature locally

```bash
npm run dev
```

1. Open a plan with at least one one-time goal and one recurring goal.
2. Find the "Inflation Rate" input near the Total Goal Target box.
3. Change the rate from 5 to 8 — all goal corpus figures and monthly SIPs update immediately.
4. Hover over any goal's corpus amount — a tooltip shows the original nominal amount.
5. Reload the page — the 8 % rate is restored from saved plan data.
6. Change the rate to a recurring-goal plan — verify the SIP amount is now higher than before (previously recurring goals ignored inflation).

## Backward compatibility check

Open a plan created before this feature (no `inflationRate` in the JSON). Verify:
- The inflation rate control shows `5`.
- All goal calculations are identical to before the change.
- Saving the plan and reopening it shows `5` (the default is now written to the file).
