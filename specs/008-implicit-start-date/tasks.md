# Tasks: Implicit Goal Start Date and Auto Investment Tracking

**Input**: Design documents from `/specs/008-implicit-start-date/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. No test tasks are included (not explicitly requested in spec).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: No new project structure or dependencies needed. One constant must be added before domain work begins.

- [x] T001 Add `FEATURE_008_DEPLOY_DATE` constant to `src/domain/constants.ts` (placeholder value — update to actual deploy date before merge)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and storage changes that ALL three user stories depend on. Must be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Update `FinancialGoal` constructor in `src/domain/FinancialGoals.ts`: remove `startDate` param; add `createdAt?: string` (defaults to today's date) and `currentSavings?: number` params
- [x] T003 Add `createdAt: string` field and `currentSavings?: number` field to `FinancialGoal` class in `src/domain/FinancialGoals.ts`
- [x] T004 Update `getInvestmentStartDate()` in `src/domain/FinancialGoals.ts` to return `createdAt` instead of `startDate`
- [x] T005 Update `getTerm()` in `src/domain/FinancialGoals.ts` to compute `dayjs(targetDate).diff(dayjs(), 'year')` (remaining years from today, not from startDate)
- [x] T006 Update `getMonthTerm()` in `src/domain/FinancialGoals.ts` to compute `Math.max(0, dayjs(targetDate).diff(dayjs(), 'month'))` (remaining months from today)
- [x] T007 Update `getElapsedMonths()` in `src/domain/FinancialGoals.ts` to compute `dayjs().diff(dayjs(this.createdAt), 'month')` instead of using `getInvestmentStartDate()`
- [x] T008 Add `getEffectiveTarget(blendedAnnualReturnPct: number): number` method to `FinancialGoal` in `src/domain/FinancialGoals.ts` — returns `max(0, inflationAdjustedTarget − FV(currentSavings, remainingMonths, blendedReturn))` when `currentSavings` is set; otherwise returns `getInflationAdjustedTargetAmount()`
- [x] T009 Delete `isGoalActive` export function from `src/domain/FinancialGoals.ts`
- [x] T010 Update `src/domain/FinancialGoals.test.ts`: remove all `startDate` constructor arguments; update `getTerm`, `getMonthTerm`, `getElapsedMonths` tests to mock today's date; remove `isGoalActive` tests; add tests for `getEffectiveTarget` (no savings, partial savings, sufficient savings → 0)
- [x] T011 [P] Update `_parsePlannerData` in `src/util/storage/localFileProvider.ts`: pass `g.createdAt ?? FEATURE_008_DEPLOY_DATE` and `g.currentSavings` to `new FinancialGoal(…)`; update `validateParsedGoal` to permit missing `startDate`
- [x] T012 [P] Apply same migration pattern to `src/util/storage/googleDriveProvider.ts` as done in T011
- [x] T013 Update `src/util/storage/localFileProvider.test.ts`: add tests for legacy goal with no `createdAt` → gets deploy date; goal with `createdAt` → preserved; goal with `currentSavings` → preserved

**Checkpoint**: Domain model and storage migration are complete. All existing tests pass. User story work can begin.

---

## Phase 3: User Story 1 — Create a Goal Without Choosing a Start Date (Priority: P1) 🎯 MVP

**Goal**: The goal creation form no longer shows a start date field. Goals are saved with a `createdAt` date set automatically to today.

**Independent Test**: Open the goal creation form, verify no start date field is present, create a goal, and confirm the planner shows a monthly investment figure calculated from today's date.

- [x] T014 [US1] Remove `startDate` state, `setStartDate`, `handleStartYearChange`, start date `DatePicker`, `startDatePickerRef`, and start date validation from `src/pages/Home/components/FinancialGoalForm/index.tsx`
- [x] T015 [US1] Update `new FinancialGoal(…)` call in `src/pages/Home/components/FinancialGoalForm/index.tsx` to remove the `startDate` argument (constructor now auto-sets `createdAt`)
- [x] T016 [US1] Update target date validation in `src/pages/Home/components/FinancialGoalForm/index.tsx`: replace `dayjs(targetDate).isBefore(dayjs(startDate))` check with `dayjs(targetDate).isBefore(dayjs())` (target must be in the future)
- [x] T017 [US1] Update `UPDATE_FINANCIAL_GOAL` case in `src/store/plannerDataReducer.ts`: remove `goalToBeUpdated.startDate = updatedPayload.startYear` assignment; update the `updateFinancialGoal` payload type in `src/store/plannerDataActions.ts` to remove `startYear`

**Checkpoint**: User Story 1 is complete. A new goal can be created without a start date, and the planner renders correctly.

---

## Phase 4: User Story 2 — Return to Plan After Time Has Passed (Priority: P2)

**Goal**: The date picker is removed from the planner header entirely. Investment figures recalculate automatically based on today's date every time the planner loads.

**Independent Test**: Open the planner — verify no date picker is visible in the header. Check that each goal's monthly investment figure reflects the remaining months from today to the goal's target date (not from a manually selected date).

- [x] T018 [US2] Remove `selectedDate` state, `setSelectedDate`, `handleChange`, `DatePicker` component, `datePickerRef`, `CalendarIcon` import, and associated `StyledBox` wrapper from `src/pages/Planner/index.tsx`
- [x] T019 [US2] Replace `completedGoals` memo in `src/pages/Planner/index.tsx` with a today-based expired check: `plannerData.financialGoals.filter(goal => dayjs().isAfter(goal.getTargetDate()))`
- [x] T020 [US2] Remove `selectedDate` prop from both `GoalBox` usages in `src/pages/Planner/index.tsx` (inline and Drawer instances)
- [x] T021 [US2] Remove `selectedDate` from `GoalBoxProps` and all internal usages in `src/pages/Planner/components/GoalBox/index.tsx`; update `pendingGoals` filter to `!dayjs().isAfter(goal.getTargetDate())`; update `completedGoals` filter to `dayjs().isAfter(goal.getTargetDate())`; rename section heading from "Completed Goals" to "Expired Goals"
- [x] T022 [US2] Remove `selectedDate` parameter from `calculateInvestmentNeededForGoals` in `src/pages/Planner/hooks/useInvestmentCalculator.ts`; replace `isGoalActive` call with inline expired check (`dayjs().isAfter(goal.getTargetDate())`); remove `isGoalActive` import
- [x] T023 [US2] Update `calculateInvestmentNeededForGoals` call in `src/pages/Planner/index.tsx` to remove the `selectedDate` argument
- [x] T024 [US2] Update `goalDuration` display in `src/pages/Planner/components/GoalCard/index.tsx`: replace `goal.startDate` with `goal.createdAt`; format as `${dayjs(goal.createdAt).format('MM/YYYY')} – ${dayjs(goal.targetDate).format('MM/YYYY')}`
- [x] T025 [US2] Add "Expired" status badge in `src/pages/Planner/components/GoalCard/index.tsx` when `dayjs().isAfter(goal.getTargetDate())` — show badge instead of investment breakdown and SIP toggle
- [x] T026 [US2] Update `src/pages/Planner/hooks/useInvestmentCalculator.test.ts`: remove `selectedDate` arguments from all test calls; add test for expired goal → returns empty `investmentSuggestions`

**Checkpoint**: User Story 2 is complete. The date picker is gone, SIP figures update daily, expired goals show a badge.

---

## Phase 5: User Story 3 — Override Current Savings for Accuracy (Priority: P3)

**Goal**: Users can enter an optional "current savings" amount per goal. The SIP recalculates to reflect only the remaining amount needed after accounting for savings growth.

**Independent Test**: Open a goal card, enter a current savings amount, confirm the monthly SIP decreases. Enter an amount sufficient to fully fund the goal, confirm the "Fully Funded" badge appears and no SIP is shown.

- [x] T027 [US3] Add `UPDATE_GOAL_CURRENT_SAVINGS` to `PlannerDataActionType` enum in `src/store/plannerDataActions.ts`
- [x] T028 [US3] Add `updateGoalCurrentSavings(dispatch, goalId, currentSavings)` action creator in `src/store/plannerDataActions.ts`
- [x] T029 [US3] Add `UPDATE_GOAL_CURRENT_SAVINGS` reducer case in `src/store/plannerDataReducer.ts`: find goal by `goalId`, set `goal.currentSavings = payload.currentSavings`; update `PlannerDataActionPayload` union type to include `{ goalId: string; currentSavings: number | undefined }`
- [x] T030 [US3] Update `src/store/plannerDataReducer.test.ts`: add test for `UPDATE_GOAL_CURRENT_SAVINGS` — updates correct goal; other goals unchanged
- [x] T031 [US3] Update `calculateInvestmentPerGoal` in `src/pages/Planner/hooks/useInvestmentCalculator.ts`: compute `blendedAnnualReturn = sum(a.expectedReturnPercentage × a.investmentPercentage / 100)` for the goal's allocations; pass `goal.getEffectiveTarget(blendedAnnualReturn)` to `calculateTotalMonthlySIP` instead of `goal.getInflationAdjustedTargetAmount()`; return empty suggestions when `effectiveTarget <= 0` (fully funded)
- [x] T032 [US3] Update `src/pages/Planner/hooks/useInvestmentCalculator.test.ts`: add test for goal with `currentSavings` → lower SIP; add test for goal with sufficient `currentSavings` → empty `investmentSuggestions`
- [x] T033 [US3] Add inline `currentSavings` edit field to `src/pages/Planner/components/GoalCard/index.tsx`: small text input pre-filled with `goal.currentSavings ?? ''`; on confirm dispatch `updateGoalCurrentSavings`; on clear dispatch `updateGoalCurrentSavings` with `undefined`
- [x] T034 [US3] Add "Fully Funded" status badge in `src/pages/Planner/components/GoalCard/index.tsx` when `investmentSuggestions.length === 0 && !dayjs().isAfter(goal.getTargetDate())` — show badge instead of SIP toggle, no investment breakdown

**Checkpoint**: All three user stories are complete. The current savings override works end to end.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T035 [P] Run `npm run build` and fix any TypeScript errors caused by removed `startDate` / `selectedDate` references across all files
- [x] T036 [P] Run `npm test` and fix any test failures in snapshot tests (e.g., `GoalBox`, `GoalCard` snapshots that include old date picker or `startDate` text)
- [ ] T037 Update `FEATURE_008_DEPLOY_DATE` constant in `src/domain/constants.ts` to the actual deploy date before merging

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 — blocks all user stories
- **US1 (Phase 3)**: Depends on Foundational complete — can start after T013
- **US2 (Phase 4)**: Depends on Foundational complete — can start in parallel with US1 after T013
- **US3 (Phase 5)**: Depends on Foundational complete AND T031 depends on US2's `calculateInvestmentPerGoal` changes (T022) being in place
- **Polish (Phase 6)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — independent of US2/US3
- **US2 (P2)**: Depends only on Foundational — independent of US1/US3
- **US3 (P3)**: Depends on Foundational + T022 (calc hook) from US2 before T031 can complete correctly

### Within Each User Story

- Foundational domain tasks (T002–T009) must complete in order (each builds on the previous)
- T011 and T012 are parallelizable (different storage providers, same pattern)
- US1 tasks (T014–T017) are sequential (form changes before constructor call update)
- US2 tasks (T018–T026): T018–T023 are sequential; T024–T026 can run in parallel with earlier tasks
- US3 tasks: T027–T029 (state) in parallel with T031 (calc hook); T033–T034 (UI) after T029 and T031

---

## Parallel Example: Foundational Phase

```
# After T001 (constants), these can run in parallel:
T011 — localFileProvider.ts migration
T012 — googleDriveProvider.ts migration

# After T009 (FinancialGoal fully updated):
US1 and US2 can begin simultaneously
```

## Parallel Example: US2 and US3 Setup

```
# Once Foundational is complete, start simultaneously:
[US2] T018 — Remove date picker from Planner/index.tsx
[US3] T027 — Add UPDATE_GOAL_CURRENT_SAVINGS action type

# Once T022 (calc hook) is done:
[US3] T031 — Update calculateInvestmentPerGoal with effectiveTarget
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T013)
3. Complete Phase 3: US1 (T014–T017)
4. **STOP and VALIDATE**: Create a goal, confirm no start date field, confirm planner shows SIP
5. Merge as MVP if validated

### Incremental Delivery

1. Setup + Foundational → domain and migration ready
2. US1 → goal creation without date picker (MVP)
3. US2 → date picker removed from planner header, SIP auto-updates
4. US3 → current savings override
5. Polish → build + test cleanup

### Notes

- `startDate` field will still appear in old JSON files — the migration in T011/T012 handles it gracefully; it is read but not passed to the constructor
- `isGoalActive` removal (T009) may affect snapshot tests — update them in T036
- `FEATURE_008_DEPLOY_DATE` is a placeholder in T001; must be set to the real merge date in T037 before the PR lands
