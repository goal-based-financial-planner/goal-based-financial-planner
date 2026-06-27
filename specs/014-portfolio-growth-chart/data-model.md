# Data Model: Portfolio Growth Projection Chart

**Feature**: 014-portfolio-growth-chart  
**Date**: 2026-06-07

## Overview

This feature introduces no persistent data — all new entities are derived at render time from existing `PlannerData`. The entities below describe the in-memory data shapes that flow from domain logic to UI.

---

## Entities

### ProjectionPoint

A single data point in a goal's growth projection series.

| Field  | Type     | Description                                      |
|--------|----------|--------------------------------------------------|
| date   | `string` | ISO date `YYYY-MM-DD` for this data point        |
| amount | `number` | Accumulated projected value at this date (in user's currency) |

**Derivation**: Generated month-by-month using `calculateFutureValue(monthlySIP, elapsedMonths, returnPct)` starting from the goal's investment start date.

---

### GoalProjectionSeries

The complete projection series for a single financial goal, plus metadata needed for chart rendering.

| Field              | Type               | Description                                                  |
|--------------------|--------------------|--------------------------------------------------------------|
| goalId             | `string`           | Unique goal identifier (from `FinancialGoal.id`)             |
| goalName           | `string`           | Human-readable name for legend display                       |
| projectionPoints   | `ProjectionPoint[]`| Ordered array of monthly projection points, start → target   |
| targetAmount       | `number`           | Inflation-adjusted target amount (the endpoint value)        |
| targetDate         | `string`           | ISO date `YYYY-MM-DD` of the goal's target date              |
| currentValue       | `number`           | Accumulated value as of today (from existing calculator)     |
| isCompleted        | `boolean`          | True if target date is in the past                           |

**Derivation**: Produced by `buildGoalProjectionSeries(goal, investmentSuggestions)` in `src/domain/investmentCalculations.ts`. Memoized via `useGoalProjections` hook.

---

### ChartSeries (chart-layer only)

The transformed shape consumed directly by `@mui/x-charts` `LineChart`. Not a domain type — lives in the chart component.

| Field    | Type       | Description                                             |
|----------|------------|---------------------------------------------------------|
| id       | `string`   | Goal ID, used as series key                             |
| label    | `string`   | Goal name for legend                                    |
| data     | `number[]` | Projected amounts aligned to the shared X-axis dates    |
| area     | `boolean`  | `true` to enable area shading under the line            |
| color    | `string`   | Assigned from a fixed color palette by goal index       |

---

### GoalMilestone (chart annotation)

Metadata for the milestone marker rendered at each goal's target date. Passed to `LineChart` `referenceLines` or rendered as a custom overlay.

| Field       | Type     | Description                               |
|-------------|----------|-------------------------------------------|
| goalName    | `string` | Label shown at the milestone              |
| targetDate  | `string` | ISO date aligned to the shared X-axis     |
| targetAmount| `number` | Inflation-adjusted target amount displayed|

---

## Data Flow

```
FinancialGoal[] + InvestmentAllocations
        │
        ▼
buildGoalProjectionSeries()         ← src/domain/investmentCalculations.ts (pure)
        │ returns GoalProjectionSeries[]
        ▼
useGoalProjections()                ← src/pages/Planner/hooks/useGoalProjections.ts
        │ memoized, returns GoalProjectionSeries[]
        ▼
GoalGrowthChart (component)         ← src/pages/Planner/components/GoalGrowthChart/
        │ transforms to ChartSeries[] + GoalMilestone[]
        ▼
@mui/x-charts LineChart             ← renders SVG
```

---

## Validation Rules

- A `GoalProjectionSeries` with `projectionPoints.length === 0` means the goal's term is 0 or negative — treat as completed.
- A `GoalProjectionSeries` with `isCompleted === true` is excluded from active chart series; only its milestone marker may be shown.
- `currentValue` must be ≥ 0 and ≤ `targetAmount` for on-track display (over-funded goals where `currentValue > targetAmount` are shown at 100%).
- The shared X-axis spans from `min(all goal start dates)` to `max(all goal target dates)`. Goals with no data at a given X point contribute `null` (so the line does not extend beyond its date range).

---

## No New Persistence

No new `localStorage` keys, IndexedDB stores, or Google Drive fields are introduced. All data is:
- Read from existing `PlannerData` (goals + allocations + logs)
- Computed at render time
- Discarded when the component unmounts
