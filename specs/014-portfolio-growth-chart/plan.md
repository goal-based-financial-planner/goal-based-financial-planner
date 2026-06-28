# Implementation Plan: Portfolio Growth Projection Chart

**Branch**: `014-portfolio-growth-chart` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/014-portfolio-growth-chart/spec.md`

## Summary

Add a "Growth Chart" tab to the existing Investment Plan box on the Planner page. The chart displays a time-series line for each active financial goal, showing the projected portfolio accumulation from the goal's start date to its target date, with a vertical marker at today's date indicating the current accumulated value. The projection is computed using the existing annuity-due SIP math — no new financial model. `@mui/x-charts` (already installed at v7.23.6) provides the `LineChart` component. No new persistence is required.

## Technical Context

**Language/Version**: TypeScript 4.x + React 19.2.4  
**Primary Dependencies**: `@mui/material` v6, `@mui/x-charts` ^7.23.6 (already installed), `dayjs` ^1.11.13  
**Storage**: None — all projection data is derived at render time from existing `localStorage` / Google Drive data  
**Testing**: Vitest ^4.1.8 + `@testing-library/react` ^16.0.1  
**Target Platform**: Browser (modern Chrome, Firefox, Safari); responsive from 375px to 1920px  
**Project Type**: React SPA (single-page web app)  
**Performance Goals**: Chart renders in < 2 seconds with 10 goals; projection series generation is O(n × months) — expected < 5ms for typical inputs  
**Constraints**: No new npm dependencies; chart must be readable on mobile; PDF export uses table fallback (not SVG capture)  
**Scale/Scope**: Typical user has 3–10 goals; max projection horizon ~30 years (360 data points per goal)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering | ✅ Pass | Projection math → `src/domain/goalProjections.ts`; hook → `src/pages/Planner/hooks/`; component → `src/pages/Planner/components/GoalGrowthChart/` |
| II. Feature Co-location | ✅ Pass | New component under `src/pages/Planner/components/`; hook under `src/pages/Planner/hooks/`; domain function in `src/domain/` |
| III. Upgrade-Friendly | ✅ Pass | `@mui/x-charts` already in use; new `GoalGrowthChart` component wraps it as a local primitive |
| IV. Type Safety | ✅ Pass | All new types (`ProjectionPoint`, `GoalProjectionSeries`) defined explicitly in `src/domain/goalProjections.ts`; no `any` |
| V. Predictable Change | ✅ Pass | Unit tests required for `buildGoalProjectionSeries` covering edge cases (zero term, past goal, recurring goal) |

**No violations. No Complexity Tracking table needed.**

## Project Structure

### Documentation (this feature)

```text
specs/014-portfolio-growth-chart/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── goalProjections.ts           ← NEW: pure projection function + types
│   ├── goalProjections.test.ts      ← NEW: unit tests for domain function
│   └── investmentCalculations.ts    ← EXISTING: reuse calculateFutureValue (no edits)
│
└── pages/
    └── Planner/
        ├── hooks/
        │   └── useGoalProjections.ts         ← NEW: memoized hook
        └── components/
            ├── GoalGrowthChart/
            │   ├── index.tsx                  ← NEW: LineChart component
            │   └── index.test.tsx             ← NEW: component tests
            ├── InvestmentSuggestions/
            │   └── index.tsx                  ← MODIFIED: add "Growth Chart" tab
            └── PrintableReport/
                └── index.tsx                  ← MODIFIED: add projected values table
```

**Structure Decision**: Single-project React SPA. New code follows the existing `src/pages/<Page>/components/` and `src/domain/` layout.

## Phase 0: Research Findings

See [research.md](./research.md) for full decision records. Summary:

| Topic | Decision |
|-------|----------|
| Chart library | `@mui/x-charts` v7 `LineChart` — already installed, no new deps |
| Data granularity | Monthly data points per goal series |
| UI placement | Third tab in `InvestmentSuggestionsBox` ("Growth Chart") |
| Calculation location | New `buildGoalProjectionSeries` in `src/domain/goalProjections.ts` |
| PDF export | Projected year-end values table in `PrintableReport` (not chart SVG) |
| Actual value marker | Vertical reference line at today's date; dot per goal showing SIP-math accumulated value — always shown, no log entries required |

## Phase 1: Design & Contracts

### Domain Function: `buildGoalProjectionSeries`

**File**: `src/domain/goalProjections.ts`

```
Input:
  goal: FinancialGoal
  investmentSuggestions: InvestmentSuggestion[]

Output:
  GoalProjectionSeries {
    goalId, goalName,
    projectionPoints: [{ date: YYYY-MM-DD, amount: number }, ...],  // one per month
    targetAmount,      // inflation-adjusted
    targetDate,
    currentValue,      // accumulated to today
    isCompleted        // true if targetDate < today
  }

Algorithm:
  1. If isCompleted: return empty projectionPoints, isCompleted=true
  2. monthTerm = goal.getMonthTerm()
  3. If monthTerm <= 0: return empty projectionPoints
  4. totalMonthlySIP = sum of investmentSuggestions[].amount
  5. For month m in [0..monthTerm]:
       date = investmentStartDate + m months
       amount = sum over each suggestion of calculateFutureValue(suggestion.amount, m, suggestion.expectedReturnPercentage)
       append { date, amount }
  6. currentValue = sum of calculateFutureValue(suggestion.amount, elapsedMonths, pct) for each suggestion
     NOTE: always computed from SIP math regardless of whether investment log entries exist;
     this value is always present on the chart as the "Today" marker
```

**Unit test coverage required**:
- One-time goal with 2-year term: projection has 25 points (0..24 months), last point ≈ targetAmount
- Recurring goal with 1-year duration: projection has 13 points
- Goal where targetDate is yesterday: `isCompleted=true`, `projectionPoints=[]`
- Goal where targetDate is this month (term ≈ 0): graceful empty series
- Zero investment suggestions: `projectionPoints` all zero
- Goal with elapsed months > 0 and no investment logs: `currentValue` is still non-zero (derived from SIP math)

---

### Hook: `useGoalProjections`

**File**: `src/pages/Planner/hooks/useGoalProjections.ts`

```
Input:
  plannerData: PlannerData
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[]

Output: GoalProjectionSeries[]

Implementation:
  useMemo(() =>
    plannerData.financialGoals.map(goal => {
      const suggestions = investmentBreakdownForAllGoals
        .find(b => b.goalName === goal.getGoalName())
        ?.investmentSuggestions ?? [];
      return buildGoalProjectionSeries(goal, suggestions);
    })
  , [plannerData.financialGoals, investmentBreakdownForAllGoals])
```

---

### Component: `GoalGrowthChart`

**File**: `src/pages/Planner/components/GoalGrowthChart/index.tsx`

```
Props: { projections: GoalProjectionSeries[] }

Rendering logic:
  1. Filter out isCompleted projections → activeProjections
  2. If activeProjections.length === 0: render empty-state message
  3. Build shared X-axis dates: union of all projection point dates, sorted
     (naturally spans min(investmentStartDate) → max(targetDate) since projectionPoints
     start from each goal's investmentStartDate)
  4. For each activeProjection, map projectionPoints to aligned data array
     (null where the goal has no data for a given date)
  5. Render MUI LineChart with:
     - series: one per active goal (area=true, color from palette, lineDash pattern cycled
       e.g. solid / dashed / dotted / dash-dot for goals 1–4+, then repeat)
     - legend: visible, shows goal name + line style swatch (not color alone)
     - xAxis: date values spanning from min(investmentStartDate) to max(targetDate),
       formatted as "MMM YYYY"
     - yAxis: auto-scaled, formatted as currency
     - referenceLines: [{ x: today, label: 'Today' }]
     - tooltip: shows date + amount per goal
  6. Milestone markers: render as annotations on the chart or as a legend below
     showing each goal's target date + inflation-adjusted amount
```

**Accessibility**: `aria-label` on the chart container.

---

### InvestmentSuggestionsBox Modification

**File**: `src/pages/Planner/components/InvestmentSuggestions/index.tsx`

- Change `activeTab` type from `0 | 1` to `0 | 1 | 2`
- Add `<Tab label="Growth Chart" />` as the third tab
- Receive `projections: GoalProjectionSeries[]` as a new prop
- Render `<GoalGrowthChart projections={projections} />` in the Tab 2 tabpanel

**Planner page (`src/pages/Planner/index.tsx`)**:
- Call `useGoalProjections(plannerData, investmentBreakdownForAllGoals)` 
- Pass `projections` down to `InvestmentSuggestionsBox`

---

### PrintableReport Modification

**File**: `src/pages/Planner/components/PrintableReport/index.tsx`

- Accept `projections: GoalProjectionSeries[]` as a new prop
- Add "Section 5: Growth Projection Summary" with a table:
  - Columns: Goal Name | Start | Target Date | Target Amount | Projected Year-End Values (Year 1, 2, 3…)
  - One row per active goal
  - Year-end values pulled from `projectionPoints` at 12-month intervals

---

## Implementation Sequence

1. **Domain layer** (`goalProjections.ts` + tests) — no UI, independently testable
2. **Hook** (`useGoalProjections.ts`) — depends on domain layer
3. **Chart component** (`GoalGrowthChart/`) — depends on hook output type only
4. **InvestmentSuggestionsBox** tab addition — depends on chart component
5. **Planner page** wiring — connects hook to existing `investmentBreakdownForAllGoals`
6. **PrintableReport** addition — depends on `GoalProjectionSeries` type only

Each step is independently committable and verifiable.
