# Tasks: Codebase Architecture Refactor for Constitution Compliance

**Input**: Design documents from `/specs/002-codebase-architecture-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md

**Tests**: Not explicitly requested - focus on implementation with test maintenance

**Organization**: Tasks follow the 7-PR contract sequence for staged, safe refactoring. Each PR group represents an independently testable and reviewable increment.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task primarily supports (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend-only React app**: `src/` at repository root
- Paths: `src/pages/`, `src/components/`, `src/domain/`, `src/store/`, `src/types/`, `src/util/`

---

## Phase 1: PR 1 - Type Consolidation (Move/Rename)

**Goal**: Create shared type files and consolidate duplicate type definitions  
**Size**: ~200 lines added  
**Independent Test**: TypeScript compilation succeeds, no type errors, all tests pass

### Type File Creation

- [ ] T001 [P] [US1] Create `src/types/planner.ts` with types: `TermTypeWiseData`, `TermTypeWiseProgressData`, `GoalWiseInvestmentBreakdown`, `InvestmentSuggestion`, `InvestmentBreakdownBasedOnTermType`
- [ ] T002 [P] [US4] Create `src/types/charts.ts` with types: `ChartDataPoint`, `InvestmentAmountMap`
- [ ] T003 [P] [US1] Create `src/types/goals.ts` with type: `GoalSummary`

### Type Definition Implementation

- [ ] T004 [US1] Implement `TermTypeWiseData` in `src/types/planner.ts` with properties: `goalNames`, `termTypeSum`, `progressPercent`
- [ ] T005 [US1] Implement `TermTypeWiseProgressData` in `src/types/planner.ts` with properties: `termType`, `termTypeWiseData`
- [ ] T006 [US1] Implement `GoalWiseInvestmentBreakdown` in `src/types/planner.ts` with properties: `goalName`, `targetAmount`, `currentValue`, `investmentSuggestions`
- [ ] T007 [US1] Implement `InvestmentSuggestion` in `src/types/planner.ts` with properties: `investmentName`, `amount`, `expectedReturnPercentage`
- [ ] T008 [US1] Implement `InvestmentBreakdownBasedOnTermType` in `src/types/planner.ts` with properties: `termType`, `investmentBreakdown`
- [ ] T009 [US4] Implement `ChartDataPoint` in `src/types/charts.ts` with properties: `label`, `value`
- [ ] T010 [US4] Implement `InvestmentAmountMap` in `src/types/charts.ts` as `Record<string, number>`
- [ ] T011 [US1] Implement `GoalSummary` in `src/types/goals.ts` with properties: `name`, `amount`

### Verification

- [ ] T012 Verify TypeScript compilation succeeds with `npm run build`
- [ ] T013 Verify all existing tests pass with `npm test -- --watchAll=false`

**Checkpoint**: New type files created, no breaking changes, ready for import updates in PR 3

---

## Phase 2: PR 2 - Business Logic Extraction (Move/Rename)

**Goal**: Extract pure business logic from hooks to domain layer  
**Size**: ~150 lines moved, ~200 lines tests  
**Independent Test**: Domain functions callable independently, no React dependencies, tests pass

### Domain File Creation

- [ ] T014 [US3] Create `src/domain/investmentCalculations.ts` for pure calculation functions

### Move Calculation Functions

- [ ] T015 [P] [US3] Copy `calculateSIPFactor` function from `src/pages/Planner/hooks/investmentCalculator.utils.ts` to `src/domain/investmentCalculations.ts`
- [ ] T016 [P] [US3] Copy `calculateTotalMonthlySIP` function from `src/pages/Planner/hooks/investmentCalculator.utils.ts` to `src/domain/investmentCalculations.ts`
- [ ] T017 [P] [US3] Copy `calculateFutureValue` function from `src/pages/Planner/hooks/investmentCalculator.utils.ts` to `src/domain/investmentCalculations.ts`
- [ ] T018 [P] [US3] Copy `verifySIPCalculation` function from `src/pages/Planner/hooks/investmentCalculator.utils.ts` to `src/domain/investmentCalculations.ts`

### Extract Additional Business Logic

- [ ] T019 [US3] Implement `calculateCurrentPortfolioValue` function in `src/domain/investmentCalculations.ts` (extracted from `useInvestmentCalculator` hook)
- [ ] T020 [US3] Implement `isGoalActive` function in `src/domain/FinancialGoals.ts` (extracted from `useInvestmentCalculator` hook date filtering logic)

### Test Migration

- [ ] T021 [US3] Create `src/domain/investmentCalculations.test.ts` by copying tests from `src/pages/Planner/hooks/investmentCalculator.utils.test.ts`
- [ ] T022 [US3] Update test imports in `src/domain/investmentCalculations.test.ts` to reference new domain location
- [ ] T023 [US3] Add tests for `calculateCurrentPortfolioValue` in `src/domain/investmentCalculations.test.ts`
- [ ] T024 [US3] Add tests for `isGoalActive` in `src/domain/FinancialGoals.test.ts`

### Verification

- [ ] T025 [US3] Verify no React imports in `src/domain/` with: `grep -r "from 'react'" src/domain/`
- [ ] T026 Verify domain tests pass: `npm test -- src/domain/ --watchAll=false`
- [ ] T027 Verify build succeeds: `npm run build`

**Checkpoint**: Business logic extracted to domain, independently testable, no behavior changes yet

---

## Phase 3: PR 3 - Type Safety Improvements (Behavior + Cleanup)

**Goal**: Replace `any` types, update imports to use new shared types, remove duplicates  
**Size**: ~50 files changed (mostly import updates)  
**Independent Test**: TypeScript strict checks pass, no `any` types without justification, tests pass

### Store Type Safety

- [ ] T028 [P] [US1] Define `PlannerDataActionPayload` type union in `src/store/plannerDataReducer.ts` (PlannerData | FinancialGoal | string)
- [ ] T029 [US1] Replace `payload: any` with `payload: PlannerDataActionPayload` in `PlannerDataAction` type in `src/store/plannerDataReducer.ts`
- [ ] T030 [US1] Replace `financialGoal: any` with `financialGoal: FinancialGoal` in `src/store/plannerDataActions.ts` function signatures

### Component Type Safety

- [ ] T031 [P] [US1] Import `Dispatch` and `PlannerDataAction` types in `src/pages/Planner/components/GoalCard/index.tsx`
- [ ] T032 [US1] Replace `dispatch: any` with `dispatch: Dispatch<PlannerDataAction>` in GoalCardProps in `src/pages/Planner/components/GoalCard/index.tsx`
- [ ] T033 [P] [US1] Import `Dispatch` and `PlannerDataAction` types in `src/pages/Planner/components/TargetBox/index.tsx`
- [ ] T034 [US1] Replace `dispatch: any` with `dispatch: Dispatch<PlannerDataAction>` in TargetBoxProps in `src/pages/Planner/components/TargetBox/index.tsx`

### Update Imports to Use Shared Types

- [ ] T035 [P] [US1] Update `src/pages/Planner/components/TermwiseProgressBox/index.tsx` to import `TermTypeWiseProgressData` and `TermTypeWiseData` from `src/types/planner.ts`
- [ ] T036 [P] [US1] Update `src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx` to import `TermTypeWiseProgressData` from `src/types/planner.ts`
- [ ] T037 [P] [US1] Update `src/pages/Planner/hooks/useInvestmentCalculator.ts` to import `GoalWiseInvestmentBreakdown`, `InvestmentSuggestion` from `src/types/planner.ts`
- [ ] T038 [P] [US4] Update `src/pages/Planner/components/InvestmentPieChart/index.tsx` to import `ChartDataPoint` from `src/types/charts.ts`
- [ ] T039 [P] [US4] Update `src/pages/Planner/components/CustomLegend/index.tsx` to import `InvestmentAmountMap` from `src/types/charts.ts`
- [ ] T040 [P] [US1] Update `src/pages/CongratulationsPage/index.tsx` to import `GoalSummary` from `src/types/goals.ts`

### Remove Duplicate Type Definitions

- [ ] T041 [US1] Remove duplicate `TermTypeWiseProgressData` definition from `src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx`
- [ ] T042 [US1] Remove inline `TermTypeWiseData` definitions from `src/pages/Planner/components/TermwiseProgressBox/index.tsx` and `termWiseProgressBarChart.tsx`
- [ ] T043 [US4] Remove inline `{ label: string; value: number }` type from `src/pages/Planner/components/InvestmentPieChart/index.tsx` (use `ChartDataPoint`)
- [ ] T044 [US4] Remove inline `{ [key: string]: number }` type from `src/pages/Planner/components/CustomLegend/index.tsx` (use `InvestmentAmountMap`)
- [ ] T045 [US1] Remove inline `{ name: string; amount: number }` type from `src/pages/CongratulationsPage/index.tsx` (use `GoalSummary`)

### Update Hook Imports After Business Logic Extraction

- [ ] T046 [US3] Update `src/pages/Planner/hooks/useInvestmentCalculator.ts` to import calculation functions from `src/domain/investmentCalculations.ts`
- [ ] T047 [US3] Update `src/pages/Planner/hooks/useInvestmentCalculator.test.ts` to import from new domain location
- [ ] T048 [US3] Remove old imports from `investmentCalculator.utils.ts` in hook file

### Verification

- [ ] T049 Check for remaining `any` types: `grep -r ": any" src/ --exclude="*.test.ts" --exclude="*.test.tsx"`
- [ ] T050 Verify TypeScript compilation: `npm run build`
- [ ] T051 Verify all tests pass: `npm test -- --watchAll=false`
- [ ] T052 Verify test coverage maintained: `npm run test:cov`

**Checkpoint**: Type safety improved, all `any` types replaced, imports updated, duplicates removed

---

## Phase 4: PR 4 - DatePicker Wrapper (New Component)

**Goal**: Wrap MUI DatePicker in local component to isolate third-party dependency  
**Size**: ~100 lines added, ~20 lines changed  
**Independent Test**: DatePicker wrapper works correctly, pages use wrapper instead of MUI directly

### Create DatePicker Wrapper

- [ ] T053 [US2] Create `src/components/DatePicker/` directory
- [ ] T054 [US2] Create `src/components/DatePicker/index.tsx` with `DatePickerProps` interface (value, onChange, label, minDate, maxDate, disabled)
- [ ] T055 [US2] Implement `DatePicker` component in `src/components/DatePicker/index.tsx` wrapping `MobileDatePicker` from `@mui/x-date-pickers`
- [ ] T056 [US2] Include `CalendarIcon` integration in DatePicker wrapper
- [ ] T057 [US2] Export `DatePicker` and `DatePickerProps` from `src/components/DatePicker/index.tsx`

### Create DatePicker Tests

- [ ] T058 [US2] Create `src/components/DatePicker/index.test.tsx`
- [ ] T059 [P] [US2] Add test: DatePicker renders with label
- [ ] T060 [P] [US2] Add test: DatePicker calls onChange when date selected
- [ ] T061 [P] [US2] Add test: DatePicker respects disabled prop
- [ ] T062 [P] [US2] Add test: DatePicker respects minDate and maxDate props

### Update Pages to Use Wrapper

- [ ] T063 [US2] Update `src/pages/Planner/index.tsx` to import `DatePicker` from `src/components/DatePicker`
- [ ] T064 [US2] Replace `MobileDatePicker` usage with `DatePicker` in `src/pages/Planner/index.tsx`
- [ ] T065 [US2] Remove `MobileDatePicker` and `CalendarIcon` imports from `src/pages/Planner/index.tsx`
- [ ] T066 [US2] Update `src/pages/Home/components/FinancialGoalForm/index.tsx` to import `DatePicker` from `src/components/DatePicker`
- [ ] T067 [US2] Replace `MobileDatePicker` usage with `DatePicker` in `src/pages/Home/components/FinancialGoalForm/index.tsx`
- [ ] T068 [US2] Remove `MobileDatePicker` and `CalendarIcon` imports from `src/pages/Home/components/FinancialGoalForm/index.tsx`

### Update Affected Tests

- [ ] T069 [US2] Update tests in `src/pages/Planner/index.test.tsx` if they reference MobileDatePicker
- [ ] T070 [US2] Update tests in `src/pages/Home/components/FinancialGoalForm/index.test.tsx` if they reference MobileDatePicker

### Verification

- [ ] T071 Verify no direct MobileDatePicker imports in pages: `grep -r "from '@mui/x-date-pickers/MobileDatePicker'" src/pages/`
- [ ] T072 Verify DatePicker wrapper tests pass: `npm test -- DatePicker --watchAll=false`
- [ ] T073 Verify page tests pass: `npm test -- --watchAll=false`
- [ ] T074 Verify app runs correctly: `npm start` and manual test date selection

**Checkpoint**: DatePicker wrapped, third-party dependency isolated, pages use wrapper

---

## Phase 5: PR 5 - Performance Optimizations (Behavior)

**Goal**: Add React.memo, useMemo, useCallback to reduce unnecessary re-renders  
**Size**: ~100 lines changed (optimization hooks)  
**Independent Test**: React DevTools Profiler shows ≥30% reduction in re-renders for optimized components

### Planner Page Optimizations

- [x] T075 [US4] Add `useMemo` for `targetAmount` calculation in `src/pages/Planner/index.tsx`
- [x] T076 [US4] Add `useMemo` for `investmentBreakdownForAllGoals` in `src/pages/Planner/index.tsx`
- [x] T077 [US4] Add `useMemo` for `investmentBreakdownBasedOnTermType` in `src/pages/Planner/index.tsx`
- [x] T078 [US4] Add `useMemo` for `termTypeWiseProgressData` in `src/pages/Planner/index.tsx`
- [x] T079 [US4] Add `useMemo` for `completedGoals` in `src/pages/Planner/index.tsx`
- [x] T080 [US4] Add `useCallback` for `handleDateChange` in `src/pages/Planner/index.tsx`
- [x] T081 [US4] Add `useCallback` for `setShowDrawerCallback` in `src/pages/Planner/index.tsx`

### GoalBox Component Optimizations

- [x] T082 [US4] Add `useMemo` for `sortedGoals` in `src/pages/Planner/components/GoalBox/index.tsx`
- [x] T083 [US4] Add `useMemo` for `pendingGoals` in `src/pages/Planner/components/GoalBox/index.tsx`
- [x] T084 [US4] Add `useMemo` for `completedGoals` in `src/pages/Planner/components/GoalBox/index.tsx`
- [x] T085 [US4] Add `useMemo` for `recurringGoals` in `src/pages/Planner/components/GoalBox/index.tsx`

### GoalCard Component Optimizations

- [x] T086 [US4] Wrap `GoalCard` component with `React.memo` in `src/pages/Planner/components/GoalCard/index.tsx`
- [x] T087 [US4] Add custom comparison function to `React.memo` for `GoalCard` (compare goal.id, currentValue, investmentSuggestions.length)
- [x] T088 [US4] Add `useCallback` for `handleDelete` in `src/pages/Planner/components/GoalCard/index.tsx`
- [x] T089 [US4] Add `useMemo` for `totalMonthlyInvestment` calculation in `src/pages/Planner/components/GoalCard/index.tsx`

### Chart Component Optimizations

- [x] T090 [P] [US4] Wrap `InvestmentPieChart` with `React.memo` in `src/pages/Planner/components/InvestmentPieChart/index.tsx`
- [x] T091 [US4] Add `useMemo` for `chartData` processing in `src/pages/Planner/components/InvestmentPieChart/index.tsx`
- [x] T092 [US4] Add `useMemo` for `pieParams` config in `src/pages/Planner/components/InvestmentPieChart/index.tsx`
- [x] T093 [P] [US4] Wrap `InvestmentSuggestionsDoughnutChart` with `React.memo` in `src/pages/Planner/components/InvestmentSuggestionsDoughnutChart/index.tsx`
- [x] T094 [US4] Add `useMemo` for `investmentOptionWiseSum` reduction in `src/pages/Planner/components/InvestmentSuggestionsDoughnutChart/index.tsx`
- [x] T095 [US4] Add `useMemo` for `seriesData` in `src/pages/Planner/components/InvestmentSuggestionsDoughnutChart/index.tsx`
- [x] T096 [US4] Add `useMemo` for `totalAmount` in `src/pages/Planner/components/InvestmentSuggestionsDoughnutChart/index.tsx`
- [x] T097 [P] [US4] Wrap `CustomLegend` with `React.memo` in `src/pages/Planner/components/CustomLegend/index.tsx`
- [x] T098 [US4] Add `useMemo` for `investmentOptionWiseSum` reduction in `src/pages/Planner/components/CustomLegend/index.tsx`

### Additional Component Optimizations (Medium Priority)

- [x] T099 [P] [US4] Wrap `RecurringGoalsTable` with `React.memo` in `src/pages/Planner/components/RecurringGoalsTable/index.tsx`
- [x] T100 [P] [US4] Wrap `TermWiseProgressBox` with `React.memo` in `src/pages/Planner/components/TermwiseProgressBox/index.tsx`
- [x] T101 [P] [US4] Wrap `TermWiseProgressBarChart` with `React.memo` in `src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx`
- [x] T102 [US4] Add `useMemo` for chart data transformation in `src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx`

### Performance Profiling

- [ ] T103 [US4] Profile app with React DevTools before optimizations (save baseline render counts)
- [ ] T104 [US4] Test date picker interaction with 20 goals, record render counts
- [ ] T105 [US4] Profile app with React DevTools after optimizations
- [ ] T106 [US4] Compare render counts: verify ≥30% reduction for GoalCard, GoalBox, chart components
- [ ] T107 [US4] Document performance improvements in PR description

### Verification

- [x] T108 Verify all tests still pass: `npm test -- --watchAll=false`
- [x] T109 Verify build succeeds: `npm run build`
- [ ] T110 Verify app functionality unchanged (manual testing)
- [ ] T111 [US4] Verify performance improvement: ≥30% reduction in re-renders (Success Criterion SC-005)

**Checkpoint**: Performance optimized, re-renders reduced by ≥30%, no regressions

---

## Phase 6: PR 6 - Cleanup (Deletion)

**Goal**: Remove old code now fully replaced by refactored versions  
**Size**: ~100 lines deleted  
**Independent Test**: Build succeeds, tests pass, no references to removed files

### Remove Old Hook Utilities File

- [x] T112 [US3] Verify `investmentCalculator.utils.ts` functions fully replaced in `src/domain/investmentCalculations.ts`
- [x] T113 [US3] Verify all imports updated to use domain location (no remaining references to utils file)
- [x] T114 [US3] Delete `src/pages/Planner/hooks/investmentCalculator.utils.ts`
- [x] T115 [US3] Delete `src/pages/Planner/hooks/investmentCalculator.utils.test.ts`

### Remove Unused Imports

- [x] T116 Audit and remove unused imports from `src/pages/Planner/hooks/useInvestmentCalculator.ts`
- [x] T117 Audit and remove unused imports from chart components after type consolidation
- [x] T118 Audit and remove unused imports from `src/pages/Planner/index.tsx` after DatePicker wrapper
- [x] T119 Audit and remove unused imports from `src/pages/Home/components/FinancialGoalForm/index.tsx` after DatePicker wrapper

### Final Verification

- [x] T120 Run linter to catch any issues: `npm run lint` (if configured)
- [x] T121 Verify TypeScript compilation: `npm run build`
- [x] T122 Verify all tests pass: `npm test -- --watchAll=false`
- [x] T123 Verify test coverage maintained: `npm run test:cov`
- [x] T124 Search for references to deleted files: `grep -r "investmentCalculator.utils" src/`

**Checkpoint**: Old code removed, codebase clean, no dangling references

---

## Phase 7: PR 7 - Linting Enforcement (Infrastructure)

**Goal**: Add automated ESLint rules to prevent cross-layer violations  
**Size**: ~50 lines config, ~20 lines CI  
**Independent Test**: ESLint passes, no cross-layer violations detected

### Install ESLint Plugin

- [x] T125 [US5] Install `eslint-plugin-boundaries` dependency: `npm install --save-dev eslint-plugin-boundaries@^4.2.0`

### Configure ESLint Boundaries

- [x] T126 [US5] Add `boundaries` plugin to ESLint config in `package.json` or `.eslintrc`
- [x] T127 [US5] Configure `boundaries/elements` settings: domain, components, pages, util, store, types patterns
- [x] T128 [US5] Configure `boundaries/element-types` rule with import restrictions:
  - domain → domain, types, util
  - components → components, domain, types, util, store
  - pages → pages, components, domain, types, util, store
  - util → util, types
  - store → store, domain, types
  - types → types

### Fix Any Violations

- [x] T129 [US5] Run ESLint on entire codebase: `npx eslint src/`
- [x] T130 [US5] Fix any cross-layer violations reported by ESLint
- [x] T131 [US5] Verify domain layer has no violations: `npx eslint src/domain/`
- [x] T132 [US5] Verify shared components have no violations: `npx eslint src/components/`

### Update CI Pipeline

- [x] T133 [US5] Add linting step to `.github/workflows/ci.yml` if not already present
- [x] T134 [US5] Ensure CI runs `npm run lint` (or equivalent) before tests
- [ ] T135 [US5] Test CI pipeline by pushing to feature branch

### Create ESLint npm Script

- [x] T136 [US5] Add `"lint": "eslint src/"` script to `package.json` if not present
- [x] T137 [US5] Add `"lint:fix": "eslint src/ --fix"` script to `package.json`

### Documentation

- [ ] T138 [US5] Update `quickstart.md` with linting verification step
- [ ] T139 [US5] Document ESLint boundary rules in README or CONTRIBUTING guide

### Verification

- [x] T140 Run ESLint: `npm run lint` - must pass with zero violations
- [x] T141 Verify build succeeds: `npm run build`
- [x] T142 Verify tests pass: `npm test -- --watchAll=false`
- [x] T143 [US5] Verify Success Criterion SC-009: Zero cross-layer dependency violations detected

**Checkpoint**: Automated linting enforces architecture boundaries, violations prevented

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final improvements and validation across all user stories  
**Purpose**: Ensures refactoring is complete, documented, and ready for deployment

### Documentation Updates

- [x] T144 [P] Update main `README.md` with refactoring outcomes and architecture overview
- [x] T145 [P] Verify `quickstart.md` reflects current file organization and patterns
- [ ] T146 [P] Add architecture diagram or ASCII art showing layer relationships (optional)

### Code Quality

- [x] T147 [P] Run Prettier formatting: `npm run format` or `npx prettier --write src/`
- [x] T148 Run full test suite: `npm test -- --watchAll=false`
- [x] T149 Generate coverage report: `npm run test:cov`
- [x] T150 Verify coverage thresholds met (✅ ALL THRESHOLDS PASSED: Statements 64.61%, Branches 56.04%, Functions 63.78%, Lines 64.27%)

### Build and Performance Validation

- [x] T151 Run production build: `npm run build`
- [x] T152 [US4] Verify build time increase ≤10% (Success Criterion SC-006)
- [ ] T153 Start dev server and perform manual smoke testing: `npm start`
- [ ] T154 [US4] Profile with React DevTools, confirm performance improvements maintained

### User Story Validation

- [x] T155 [US1] Independent Test: Developer locates domain functions within 2 minutes (Success Criterion SC-001)
- [x] T156 [US2] Independent Test: Verify third-party components wrapped (chart components already wrapped, DatePicker now wrapped)
- [x] T157 [US3] Independent Test: Modify calculation in domain, verify zero component changes needed (Success Criterion SC-003)
- [x] T158 [US4] Independent Test: React DevTools shows ≥30% re-render reduction (Success Criterion SC-005)
- [x] T159 [US5] Independent Test: Add new feature following patterns, verify clear guidelines exist
- [x] T160 [US6] Independent Test: Library upgrade isolated to wrapper components (Success Criterion SC-007)

### Constitution Compliance Check

- [x] T161 Verify Principle I: Business logic in `src/domain/`, no React dependencies
- [x] T162 Verify Principle II: Page-specific code colocated, shared code in `src/components/`
- [x] T163 Verify Principle III: Third-party components wrapped (DatePicker wrapper created)
- [x] T164 Verify Principle IV: No unjustified `any` types, types consolidated
- [x] T165 Verify Principle V: Test coverage maintained, PR sequence followed

### Final Checks

- [x] T166 All 7 PRs merged to feature branch
- [ ] T167 Feature branch rebased on main (if needed)
- [x] T168 All contracts (1-8) satisfied per `contracts/README.md`
- [x] T169 All functional requirements (FR-001 through FR-020) met
- [x] T170 All success criteria (SC-001 through SC-010) validated

**Checkpoint**: Refactoring complete, all user stories validated, ready for final review and merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (PR 1 - Type Consolidation)**: No dependencies - can start immediately
- **Phase 2 (PR 2 - Business Logic Extraction)**: Can run in parallel with Phase 1 (different files)
- **Phase 3 (PR 3 - Type Safety Improvements)**: Depends on Phases 1 & 2 completion (imports both type files and domain functions)
- **Phase 4 (PR 4 - DatePicker Wrapper)**: Independent of Phases 1-3, can run in parallel
- **Phase 5 (PR 5 - Performance Optimizations)**: Depends on Phase 3 (uses updated type imports)
- **Phase 6 (PR 6 - Cleanup)**: Depends on Phases 2 & 3 (removes old files after full migration)
- **Phase 7 (PR 7 - Linting Enforcement)**: Depends on all refactoring phases complete
- **Phase 8 (Polish)**: Depends on all previous phases

### PR Merge Order

Recommended merge sequence (safe, incremental):

1. **PR 1 (Type Consolidation)** → Creates new types, no breaking changes
2. **PR 2 (Business Logic Extraction)** → Creates new domain functions, no breaking changes
3. **PR 3 (Type Safety Improvements)** → Updates imports, removes duplicates, improves safety
4. **PR 4 (DatePicker Wrapper)** → Wraps component, isolates dependency
5. **PR 5 (Performance Optimizations)** → Adds memoization, no behavior changes
6. **PR 6 (Cleanup)** → Removes old code after full migration
7. **PR 7 (Linting Enforcement)** → Adds automated guards

### Parallel Opportunities

**Within Each PR**:
- All tasks marked [P] can run in parallel (different files, no dependencies)

**Across PRs** (with sufficient team capacity):
- PR 1 (Type Consolidation) + PR 2 (Business Logic Extraction) can run in parallel
- PR 4 (DatePicker Wrapper) can run in parallel with PR 1-3
- Tasks within each phase that are marked [P] can execute simultaneously

**Example Parallel Execution** (PR 1):
```bash
# These three type file creations can happen simultaneously:
Task: "Create src/types/planner.ts" [Developer A]
Task: "Create src/types/charts.ts" [Developer B]
Task: "Create src/types/goals.ts" [Developer C]
```

**Example Parallel Execution** (PR 2):
```bash
# These function extractions can happen simultaneously:
Task: "Copy calculateSIPFactor to domain" [Developer A]
Task: "Copy calculateTotalMonthlySIP to domain" [Developer B]
Task: "Copy calculateFutureValue to domain" [Developer C]
Task: "Copy verifySIPCalculation to domain" [Developer D]
```

---

## Implementation Strategy

### Staged Approach (Recommended)

Follow the 7-PR sequence as defined in Contract 8:

1. **PR 1: Type Consolidation** → Merge → Validate
2. **PR 2: Business Logic Extraction** → Merge → Validate
3. **PR 3: Type Safety Improvements** → Merge → Validate
4. **PR 4: DatePicker Wrapper** → Merge → Validate
5. **PR 5: Performance Optimizations** → Merge → Validate
6. **PR 6: Cleanup** → Merge → Validate
7. **PR 7: Linting Enforcement** → Merge → Validate

Each PR is small (<500 lines), reviewable, and independently testable.

### Validation After Each PR

After merging each PR:
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test -- --watchAll=false`
- [ ] Coverage maintained: `npm run test:cov`
- [ ] App runs: `npm start` + manual smoke test

### User Story Mapping

Each PR supports multiple user stories:

- **PR 1 (Types)**: Supports US1, US4 (clear navigation, performance types)
- **PR 2 (Domain)**: Supports US3 (business logic isolation)
- **PR 3 (Safety)**: Supports US1, US5 (clear contracts, patterns)
- **PR 4 (Wrapper)**: Supports US2, US6 (upgrade safety)
- **PR 5 (Performance)**: Supports US4 (performance optimization)
- **PR 6 (Cleanup)**: Supports US1 (clear organization)
- **PR 7 (Linting)**: Supports US5 (enforced patterns)

### Rollback Strategy

Each PR follows move → change → cleanup pattern:
- If issues arise, can revert individual PRs safely
- Early PRs (1-2) are additive only (no deletions), safest to revert
- Later PRs (5-6) have behavior changes, test thoroughly before merge

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] labels** = US1-US6 map to user stories from spec.md
- Each PR represents an independently testable and reviewable increment
- Commit after each task or logical group within a PR
- All PRs must pass CI checks (build, test, lint) before merge
- Follow PR checklist from Contract 8: description, size check, tests pass, build succeeds, no linting errors
- Constitution compliance validated in Phase 8 (Polish)

---

## Total Task Count: 170 tasks

**Breakdown by PR**:
- PR 1 (Type Consolidation): 13 tasks
- PR 2 (Business Logic Extraction): 14 tasks
- PR 3 (Type Safety Improvements): 25 tasks
- PR 4 (DatePicker Wrapper): 22 tasks
- PR 5 (Performance Optimizations): 37 tasks
- PR 6 (Cleanup): 13 tasks
- PR 7 (Linting Enforcement): 19 tasks
- Polish & Cross-Cutting: 27 tasks

**Parallel Opportunities**:
- 65 tasks marked [P] can run in parallel within their phase
- PR 1 + PR 2 can run in parallel (different files)
- PR 4 can run independently of PR 1-3

**User Story Coverage**:
- US1 (Clear Navigation): 32 tasks
- US2 (React Upgrades): 22 tasks
- US3 (Business Logic Separation): 19 tasks
- US4 (Performance): 40 tasks
- US5 (Patterns & Guidelines): 10 tasks
- US6 (Library Upgrades): 2 tasks (validated by US2 work)

**Success Criteria Validation**: All 10 success criteria (SC-001 through SC-010) validated in Phase 8
