# Quickstart: Portfolio Growth Projection Chart

**Feature**: 014-portfolio-growth-chart  
**Date**: 2026-06-07

## Overview

This guide covers everything needed to develop, test, and verify the Portfolio Growth Projection Chart feature from scratch.

## Prerequisites

- Node.js 20+, npm
- Project already cloned and dependencies installed (`npm install`)
- On the feature branch: `git checkout 014-portfolio-growth-chart`

## Running the App

```bash
npm start          # Starts Vite dev server at http://localhost:5173
npm run build      # Production build (run before merging)
```

## Running Tests

```bash
npm test                     # Watch mode (Vitest)
npm run test:ci              # Single run (CI mode)
npm run test:cov             # Coverage report
```

## Files Touched by This Feature

### New files (create these)

```
src/domain/
└── goalProjections.ts                      # Pure projection calculation function

src/pages/Planner/
├── hooks/
│   └── useGoalProjections.ts               # React hook (memoized wrapper)
└── components/
    └── GoalGrowthChart/
        ├── index.tsx                        # Main chart component
        └── index.test.tsx                   # Unit tests for chart component
```

### Modified files

```
src/domain/
└── investmentCalculations.ts               # No change — import from here only

src/pages/Planner/
├── components/InvestmentSuggestions/
│   └── index.tsx                           # Add "Growth Chart" as Tab 2
└── components/PrintableReport/
    └── index.tsx                           # Add projected values table section
```

## Key Interfaces

### `buildGoalProjectionSeries` (new domain function)

```typescript
// src/domain/goalProjections.ts

export type ProjectionPoint = { date: string; amount: number };

export type GoalProjectionSeries = {
  goalId: string;
  goalName: string;
  projectionPoints: ProjectionPoint[];
  targetAmount: number;
  targetDate: string;
  currentValue: number;
  isCompleted: boolean;
};

export function buildGoalProjectionSeries(
  goal: FinancialGoal,
  investmentSuggestions: InvestmentSuggestion[],
): GoalProjectionSeries
```

### `useGoalProjections` (new hook)

```typescript
// src/pages/Planner/hooks/useGoalProjections.ts

export function useGoalProjections(
  plannerData: PlannerData,
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[],
): GoalProjectionSeries[]
```

### `GoalGrowthChart` (new component)

```typescript
// src/pages/Planner/components/GoalGrowthChart/index.tsx

export type GoalGrowthChartProps = {
  projections: GoalProjectionSeries[];
};

export default function GoalGrowthChart({ projections }: GoalGrowthChartProps)
```

## Verification Steps

1. **Start the dev server** (`npm start`)
2. **Add at least two goals** with different target dates (e.g., a 2-year goal and a 10-year goal)
3. **Navigate to the Planner page** and click the "Growth Chart" tab in the Investment Plan box
4. **Verify**: Each goal appears as a distinct colored line; a legend shows goal names
5. **Verify**: The X-axis spans from today to the furthest goal's target date
6. **Verify**: The Y-axis accommodates the largest goal's target amount
7. **Verify milestone markers**: Each goal's target date should have a visible annotation
8. **Verify empty state**: Remove all goals — the chart area should show a prompt to add goals
9. **Verify PDF export**: Click Export PDF and confirm the projected values table appears in the PDF
10. **Mobile test**: Resize the browser to ≤375px and verify the chart is readable without scrolling

## Running Tests for This Feature

```bash
# Domain logic tests
npx vitest run src/domain/goalProjections.test.ts

# Hook tests  
npx vitest run src/pages/Planner/hooks/useGoalProjections.test.ts

# Component tests
npx vitest run src/pages/Planner/components/GoalGrowthChart/index.test.tsx
```

## Constitution Compliance Checklist

- [ ] Projection math lives in `src/domain/goalProjections.ts` (not in the component)
- [ ] Component imports `useGoalProjections` hook (not raw domain functions)
- [ ] `GoalGrowthChart` component is pure presentational (no direct domain calls)
- [ ] No `any` types introduced
- [ ] All new types defined in domain or types directories
- [ ] Unit tests cover `buildGoalProjectionSeries` edge cases
