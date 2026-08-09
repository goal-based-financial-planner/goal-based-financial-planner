# Phase 1 Data Model: What If

Nothing in this feature is persisted. There is no new `PlannerData` field, no new storage-provider
handling, and no reducer actions — everything below is ephemeral, in-memory, component-local state
and derived/computed types.

## In-Memory State

### `Adjustments`

**File**: `src/domain/whatIf.ts`

```ts
export type Adjustments = {
  /** Per-goal inflation rate override (percent). Only goals the user has touched are present. */
  goalInflationRates: Record<string, number>;
  /** Per-investment-type expected return override (percent). Applies wherever that type appears. */
  investmentReturnRates: Record<string, number>;
};
```

Owned by `useWhatIf` via `useState`, initialized to `{ goalInflationRates: {}, investmentReturnRates: {} }`
every time the hook mounts (i.e., every time the What If tab is opened) — there is no
initialization path that reads from `PlannerData` or any storage provider.

## Derived (Computed) Types

### `GoalWhatIfResult`

**File**: `src/domain/whatIf.ts`

```ts
export type GoalWhatIfResult = {
  goalId: string;
  goalName: string;
  investmentStartDate: string;
  targetDate: string;
  targetAmount: number;      // inflation-adjusted, under current adjustments (or baseline)
  projectedValue: number;    // fixed baseline SIP grown at current adjustments (or baseline)
  shortfall: number;         // targetAmount - projectedValue
  status: 'on-track' | 'at-risk';
  projectionPoints: { date: string; value: number }[]; // one per month, start to target
};
```

**Computation** (`buildGoalWhatIfResult(goal, investmentAllocations, adjustments)`) — unchanged from
the prior revision's per-goal math:
1. `baselineSuggestions = calculateInvestmentSuggestionsForGoal(goal, investmentAllocations)` — the
   fixed planned monthly investment, always computed from the goal's own baseline inflation rate
   and the allocation mix's own baseline returns.
2. `targetAmount = goal.getInflationAdjustedTargetAmount(adjustments.goalInflationRates[goal.id] ?? goal.inflationRate ?? DEFAULT_INFLATION_RATE)`.
3. `projectedValue` and `projectionPoints`: each baseline suggestion is grown via `calculateFutureValue`
   using `adjustments.investmentReturnRates[investmentName] ?? suggestion.expectedReturnPercentage`.

### `PortfolioWhatIfResult`

**File**: `src/domain/whatIf.ts`

```ts
export type PortfolioWhatIfResult = {
  totalTargetAmount: number;
  totalProjectedValue: number;
  totalShortfall: number;
  status: 'on-track' | 'at-risk';
  points: { date: string; value: number }[]; // combined calendar series across all goals
};
```

**Computation** (`buildPortfolioWhatIfResult(goals, investmentAllocations, adjustments)`):
1. Compute `GoalWhatIfResult` for every one-time goal.
2. `totalTargetAmount` / `totalProjectedValue` / `totalShortfall`: straight sums across goals.
3. `points`: a shared monthly calendar from the earliest goal's start date to the latest goal's
   target date. At each month, sum every goal's own value at that date — 0 before that goal's
   start, its own curve during its own window, held flat at its final value after its target date.

This function is called twice per render inside `useWhatIf`: once with an empty `Adjustments`
(baseline) and once with the live `adjustments` state (adjusted) — both go through the identical
code path, so baseline and adjusted are guaranteed consistent by construction.

## Component/Hook Wiring

- `useWhatIf(plannerData)` (`src/pages/Planner/hooks/useWhatIf.ts`): owns `adjustments` state,
  exposes `oneTimeGoals`, `investmentBaselines` (distinct investment types + their baseline rate,
  derived from `plannerData.investmentAllocations`), setters (`setGoalInflationRate`,
  `setInvestmentReturnRate`), `resetAdjustments`, and the memoized `baseline`/`adjusted` results.
- `WhatIf` (`src/pages/Planner/components/WhatIf/index.tsx`): renders the two slider sections and
  the chart, reading everything from `useWhatIf`.
- `WhatIfChart` (`src/pages/Planner/components/WhatIf/WhatIfChart/index.tsx`): pure presentational
  component taking `{ baseline, adjusted }` and rendering the two-line `LineChart` + target
  reference line.
