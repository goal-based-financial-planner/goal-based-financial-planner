# Implementation Plan: Implicit Goal Start Date and Auto Investment Tracking

**Branch**: `008-implicit-start-date` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-implicit-start-date/spec.md`

## Summary

Remove the date picker from the financial planner and replace manual start-date selection with automatic investment tracking. `FinancialGoal` gains a `createdAt` field (auto-set at construction) and an optional `currentSavings` field. Term and SIP calculations shift to use today's date as the reference point, making investment figures self-updating. Legacy goals are silently migrated at load time. The `selectedDate` prop and `isGoalActive` function are fully removed.

## Technical Context

**Language/Version**: TypeScript 4.x, React 19.2.4
**Primary Dependencies**: MUI v6, react-hook-form, dayjs, Vite 8
**Storage**: Browser File System Access API + IndexedDB (local); Google Drive REST API (cloud); all via `src/util/storage/`
**Testing**: Vitest + @testing-library/react
**Target Platform**: Browser (desktop + mobile)
**Project Type**: Single-page web application
**Performance Goals**: All calculations are synchronous in-memory; no latency targets
**Constraints**: No new dependencies. All changes must be backward-compatible with existing persisted JSON files.
**Scale/Scope**: Single-user, client-side only

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering (Domain → State → UI) | ✅ Pass | `createdAt` migration logic placed in storage providers. `getEffectiveTarget()` and `getMonthTerm()` changes confined to `src/domain/`. UI components receive data, not calculation logic. |
| II. Feature Co-location + Stable Shared Surface | ✅ Pass | GoalCard `currentSavings` UI stays in `src/pages/Planner/`. Shared `FinancialGoal` domain changes are in `src/domain/`. No page-level imports added to `src/components/`. |
| III. Upgrade-Friendly Boundaries | ✅ Pass | No new third-party dependencies. No deep imports. |
| IV. Type Safety and Explicit Contracts | ✅ Pass | `createdAt: string` and `currentSavings?: number` typed explicitly. New `UPDATE_GOAL_CURRENT_SAVINGS` action has a narrow, typed payload. No `any` introduced. |
| V. Predictable Change (Tests) | ✅ Pass | All changed domain methods (`getMonthTerm`, `getTerm`, `getElapsedMonths`, `getEffectiveTarget`) must have unit tests. `calculateInvestmentPerGoal` with `currentSavings` path must be tested. Migration path in storage provider must be tested. |

No violations. No complexity-tracking table needed.

## Project Structure

### Documentation (this feature)

```text
specs/008-implicit-start-date/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (files touched)

```text
src/
├── domain/
│   ├── constants.ts                           ← add FEATURE_008_DEPLOY_DATE
│   ├── FinancialGoals.ts                      ← core domain changes (createdAt, currentSavings, method updates)
│   └── FinancialGoals.test.ts                 ← update + add tests for changed methods
│
├── store/
│   ├── plannerDataActions.ts                  ← add updateGoalCurrentSavings action creator
│   ├── plannerDataActions.test.ts             ← add test for new action
│   ├── plannerDataReducer.ts                  ← add UPDATE_GOAL_CURRENT_SAVINGS case; fix UPDATE_FINANCIAL_GOAL
│   └── plannerDataReducer.test.ts             ← update tests
│
├── util/storage/
│   ├── localFileProvider.ts                   ← migration in _parsePlannerData
│   ├── localFileProvider.test.ts              ← add migration tests
│   └── googleDriveProvider.ts                 ← same migration pattern
│
└── pages/
    ├── Home/components/FinancialGoalForm/
    │   └── index.tsx                          ← remove startDate field, add currentSavings field
    └── Planner/
        ├── index.tsx                          ← remove selectedDate state, DatePicker, CalendarIcon
        ├── hooks/
        │   ├── useInvestmentCalculator.ts     ← remove selectedDate param; use effectiveTarget
        │   └── useInvestmentCalculator.test.ts← update + add currentSavings path tests
        └── components/
            ├── GoalBox/
            │   └── index.tsx                  ← remove selectedDate prop; inline today-based expiry check
            └── GoalCard/
                └── index.tsx                  ← update goalDuration display; add currentSavings edit UI; add status badges
```

**Structure Decision**: Single-project web app. All changes are within `src/`. No new directories needed.

## Implementation Phases

### Phase A: Domain Model (foundation — no UI changes)

**Goal**: Update the core domain so all calculation methods reflect the new model. All existing tests pass. New tests added.

1. **`src/domain/constants.ts`**
   - Add `FEATURE_008_DEPLOY_DATE = 'YYYY-MM-DD'` (placeholder — update before merge)

2. **`src/domain/FinancialGoals.ts`**
   - Remove `startDate` field and constructor parameter
   - Add `createdAt: string` field — auto-set to `dayjs().format('YYYY-MM-DD')` in constructor; optional param for deserialisation
   - Add `currentSavings?: number` field — optional param, defaults to `undefined`
   - Update `getInvestmentStartDate()` → return `createdAt`
   - Update `getTerm()` → `dayjs(targetDate).diff(dayjs(), 'year')`
   - Update `getMonthTerm()` → `Math.max(0, dayjs(targetDate).diff(dayjs(), 'month'))`
   - Update `getElapsedMonths()` → `dayjs().diff(dayjs(createdAt), 'month')`
   - Add `getEffectiveTarget(blendedAnnualReturnPct: number): number` — see data-model.md
   - Delete `isGoalActive` export function

3. **`src/domain/FinancialGoals.test.ts`**
   - Update all tests that pass `startDate` to constructor
   - Add tests for `getMonthTerm()` / `getTerm()` with mocked today date
   - Add tests for `getEffectiveTarget()`: no savings, partial savings, fully funded
   - Remove tests for `isGoalActive`

### Phase B: Storage Migration

**Goal**: Deserialisation handles legacy files transparently. New files persist `createdAt` and `currentSavings`.

4. **`src/domain/constants.ts`** — already updated in Phase A

5. **`src/util/storage/localFileProvider.ts`**
   - Update `_parsePlannerData`: pass `g.createdAt ?? FEATURE_008_DEPLOY_DATE` and `g.currentSavings` to `new FinancialGoal(...)`
   - Update `validateParsedGoal` to permit missing `startDate` (no longer required) and accept optional `currentSavings`

6. **`src/util/storage/googleDriveProvider.ts`**
   - Apply same migration pattern as `localFileProvider`

7. **`src/util/storage/localFileProvider.test.ts`**
   - Add test: legacy goal with no `createdAt` → gets `FEATURE_008_DEPLOY_DATE`
   - Add test: goal with `createdAt` → preserved
   - Add test: goal with `currentSavings` → preserved
   - Add test: goal with `currentSavings: undefined` → preserved

### Phase C: State Management

**Goal**: Reducer and actions support the new `currentSavings` field.

8. **`src/store/plannerDataActions.ts`**
   - Add `updateGoalCurrentSavings(dispatch, goalId, currentSavings)` action creator

9. **`src/store/plannerDataReducer.ts`**
   - Add `UPDATE_GOAL_CURRENT_SAVINGS` to `PlannerDataActionType`
   - Add reducer case: find goal by id, set `currentSavings`
   - Fix `UPDATE_FINANCIAL_GOAL` case: remove `startDate` / `startYear` assignment

10. **`src/store/plannerDataReducer.test.ts`**
    - Update `UPDATE_FINANCIAL_GOAL` test to not set `startDate`
    - Add `UPDATE_GOAL_CURRENT_SAVINGS` test

### Phase D: Calculation Hook

**Goal**: `useInvestmentCalculator` uses `effectiveTarget` and no longer takes `selectedDate`.

11. **`src/pages/Planner/hooks/useInvestmentCalculator.ts`**
    - Remove `selectedDate` parameter from `calculateInvestmentNeededForGoals`
    - In `calculateInvestmentPerGoal`: compute `blendedReturn` from `investmentAllocationsForType`; call `goal.getEffectiveTarget(blendedReturn)` instead of `goal.getInflationAdjustedTargetAmount()`
    - Replace `isGoalActive` filter with: expired check (`dayjs().isAfter(goal.getTargetDate())`) and fully-funded check (`effectiveTarget <= 0`)

12. **`src/pages/Planner/hooks/useInvestmentCalculator.test.ts`**
    - Remove all `selectedDate` arguments from test calls
    - Add test: goal with `currentSavings` → lower SIP returned
    - Add test: goal with sufficient `currentSavings` → SIP = 0, empty suggestions
    - Add test: expired goal → empty suggestions

### Phase E: UI — Remove Date Picker

**Goal**: `Planner/index.tsx` and `GoalBox` no longer need `selectedDate`.

13. **`src/pages/Planner/index.tsx`**
    - Remove `selectedDate` state and `setSelectedDate`
    - Remove `handleChange` callback
    - Remove `DatePicker` component and import
    - Remove `CalendarIcon` import
    - Remove `datePickerRef` and `useRef`
    - Remove `StyledBox` wrapping the date picker (keep `StyledBox` import if used elsewhere in file)
    - Remove `selectedDate` from `calculateInvestmentNeededForGoals` call
    - Replace `completedGoals` memo with today-based: `dayjs().isAfter(goal.getTargetDate())`
    - Remove `selectedDate` prop from both `GoalBox` usages

14. **`src/pages/Planner/components/GoalBox/index.tsx`**
    - Remove `selectedDate` from `GoalBoxProps`
    - Update `pendingGoals` filter: `!dayjs().isAfter(goal.getTargetDate())`
    - Update `completedGoals` filter: `dayjs().isAfter(goal.getTargetDate())`
    - Rename "completedGoals" → "expiredGoals" and update section heading to "Expired Goals"

### Phase F: UI — Goal Form (remove start date field)

**Goal**: Goal creation form removes the start date DatePicker.

15. **`src/pages/Home/components/FinancialGoalForm/index.tsx`**
    - Remove `startDate` state, `setStartDate`, `handleStartYearChange`
    - Remove start date `DatePicker` field and its `startDatePickerRef`
    - Remove `startDate` validation from `handleAdd`
    - Remove `startDate` from `resetForm()`
    - Update `new FinancialGoal(...)` call: remove `startDate` argument
    - Update target date validation: `dayjs(targetDate).isBefore(dayjs())` check (target must be in the future)

### Phase G: UI — GoalCard (status badges + currentSavings edit)

**Goal**: GoalCard shows correct status and lets users update current savings.

16. **`src/pages/Planner/components/GoalCard/index.tsx`**
    - Replace `goalDuration` display: `${dayjs(goal.createdAt).format('MM/YYYY')} - ${dayjs(goal.targetDate).format('MM/YYYY')}`
    - Add "Expired" badge when `dayjs().isAfter(goal.getTargetDate())`
    - Add "Fully Funded" badge when `investmentSuggestions.length === 0 && currentValue >= goal.getInflationAdjustedTargetAmount()`
    - Add inline `currentSavings` edit field: small text input pre-filled with `goal.currentSavings ?? ''`; on confirm, dispatch `updateGoalCurrentSavings`; on clear, dispatch with `undefined`

## Test Coverage Requirements (Constitution V)

The following must have unit tests before the PR is mergeable:

| Area | Test file | What to cover |
|------|-----------|---------------|
| `getMonthTerm()` today-based | `FinancialGoals.test.ts` | Returns months remaining from today; returns 0 when target is past |
| `getTerm()` today-based | `FinancialGoals.test.ts` | Returns years remaining from today |
| `getElapsedMonths()` with `createdAt` | `FinancialGoals.test.ts` | Correct elapsed months since creation date |
| `getEffectiveTarget()` | `FinancialGoals.test.ts` | No savings → full target; partial savings → reduced; sufficient savings → 0 |
| `calculateInvestmentPerGoal` with `currentSavings` | `useInvestmentCalculator.test.ts` | Lower SIP when currentSavings present; empty result when fully funded |
| Expired goal filtering | `useInvestmentCalculator.test.ts` | Expired goal returns empty suggestions |
| Legacy migration | `localFileProvider.test.ts` | No `createdAt` → deploy date; `createdAt` present → preserved |
| `UPDATE_GOAL_CURRENT_SAVINGS` reducer | `plannerDataReducer.test.ts` | Updates correct goal; other goals unchanged |
