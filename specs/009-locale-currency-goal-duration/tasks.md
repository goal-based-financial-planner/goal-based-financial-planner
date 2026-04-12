# Tasks: Locale Currency Formatting and Recurring Goal Duration

**Input**: Design documents from `/specs/009-locale-currency-goal-duration/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Unit tests included for new utility function and updated domain logic (core calculation changes require test coverage per Constitution Principle V).

**Organization**: Tasks grouped by user story. US1 and US2 are fully independent — they touch different files except `RecurringGoalsTable` (assigned to US2 since it's primarily a data change with a display fix bundled in).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: Verify environment is ready. No new dependencies or files to create.

- [x] T001 Confirm dev environment is working — run `npm install && npm test` from repo root

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the shared `formatCompactCurrency` utility needed by US1's chart axis formatter. US2 has no foundational dependencies.

**⚠️ CRITICAL**: T009 (InvestmentTracker chart) cannot start until this phase is complete.

- [x] T002 Add `formatCompactCurrency(num: number): string` to `src/types/util.ts` — uses `getUserLocale()` and `localeCurrencyMap` to produce INR compact (Cr/L) or generic compact (M/K) with locale currency symbol; falls back to `formatCurrency` below threshold (see data-model.md §formatCompactCurrency for full logic)
- [x] T003 [P] Add unit tests for `formatCompactCurrency` in `src/types/util.test.tsx` — cover INR (Cr, L, below-threshold), USD (M, K, below-threshold), EUR, and unknown-locale fallback to USD

**Checkpoint**: `formatCompactCurrency` exported and tested — T009 can now proceed.

---

## Phase 3: User Story 1 — Locale-Aware Currency Display (Priority: P1) 🎯 MVP

**Goal**: Replace all hardcoded `₹` prefixes with locale-aware currency formatting so users on any locale see the correct symbol and number grouping.

**Independent Test**: Set `localStorage.setItem('preferred_locale', 'en-US')`, reload the app, and verify every monetary value in the UI shows `$` with US number grouping. Repeat with `en-IN` to verify `₹` with Indian grouping.

### Implementation for User Story 1

- [x] T004 [P] [US1] Replace `₹{formatNumber(termTypeSum)}` with `formatCurrency(termTypeSum)` in `src/pages/Planner/components/TermwiseProgressBox/index.tsx` — update import from `formatNumber` to `formatCurrency`
- [x] T005 [P] [US1] Replace `₹{formatNumber(goal.getTargetAmount())}` with `formatCurrency(goal.getTargetAmount())` in `src/pages/Planner/components/RecurringGoalsTable/index.tsx` — update import (note: Duration column and yearly target derivation handled in T015)
- [x] T006 [P] [US1] Replace `₹{formatNumber(totalMonthlyInvestment)}` (line 170) and `₹{formatNumber(suggestion.amount)}` (line 241) with `formatCurrency(...)` calls in `src/pages/Planner/components/GoalCard/index.tsx` — update import
- [x] T007 [P] [US1] Replace `₹${formatNumber(groupTotal)}/mo` and `₹{formatNumber(sip.monthlyAmount)}/mo` with `${formatCurrency(groupTotal)}/mo` and `${formatCurrency(sip.monthlyAmount)}/mo` in `src/pages/Planner/components/GoalCard/components/InvestmentLogHistory/index.tsx`
- [x] T008 [P] [US1] Update `label="Monthly SIP Amount (₹)"` in `src/pages/Planner/components/GoalCard/components/LogEntryForm/index.tsx` — derive currency symbol from `getUserLocale()` using the locale-to-currency map; import `getUserLocale` from `src/types/util`
- [x] T009 [US1] Replace Y-axis `valueFormatter` (lines 92–97) with `formatCompactCurrency` and replace three inline `₹{formatNumber(...)}` amount labels (lines 166, 169, 178) with `formatCurrency(...)` in `src/pages/Planner/components/GoalCard/components/InvestmentTracker/index.tsx` — depends on T002
- [x] T010 [P] [US1] Replace `{formatNumber(Math.round(value))}` with `{formatCurrency(Math.round(value))}` in `src/pages/Planner/components/CustomLegend/index.tsx` — update import
- [x] T011 [P] [US1] Replace `{formatNumber(targetAmount)}` (line 58) and `{formatNumber(goal.amount)}` (line 77) with `{formatCurrency(...)}` in `src/pages/CongratulationsPage/index.tsx` — update import

**Checkpoint**: US1 fully functional. Set browser locale to `en-US`, verify all monetary values in the UI show `$` with correct grouping. US2 can begin independently.

---

## Phase 4: User Story 2 — Recurring Goal Duration (Priority: P2)

**Goal**: Add a 1–3 year duration field to recurring goals, use it in SIP calculations (total target ÷ duration months), and display it in the recurring goals table.

**Independent Test**: Create a recurring goal with target `120000` and duration `2`. In the planner, verify the recurring goals table shows "Yearly Target: 60,000" and "Duration: 2 years". Verify the monthly SIP suggestion for that goal is `5,000/mo` (120,000 ÷ 24).

### Implementation for User Story 2

- [x] T012 [US2] Add optional `recurringDurationYears?: number` field to `FinancialGoal` class in `src/domain/FinancialGoals.ts` — update constructor to accept 6th optional param; update `getTerm()` to return `this.recurringDurationYears ?? 1` for RECURRING; update `getMonthTerm()` to return `(this.recurringDurationYears ?? 1) * 12` for RECURRING (see data-model.md for full spec)
- [x] T013 [P] [US2] Update `_parsePlannerData` in `src/util/storage/localFileProvider.ts` — pass `g.recurringDurationYears` as 6th arg to `FinancialGoal` constructor (undefined for old data → defaults to 1 automatically)
- [x] T014 [P] [US2] Update `_parsePlannerData` in `src/util/storage/googleDriveProvider.ts` — same change as T013: pass `g.recurringDurationYears` as 6th arg to `FinancialGoal` constructor
- [x] T015 [US2] Add duration TextField (type number, default `1`, min `1`, max `3`) to `src/pages/Home/components/FinancialGoalForm/index.tsx` — show only when `goalType === GoalType.RECURRING`; add `recurringDurationYears` state (default `'1'`); validate integer in [1,3] in `handleAdd`; pass parsed value to `FinancialGoal` constructor as 6th arg; reset to `'1'` in `resetForm()` — depends on T012
- [x] T016 [US2] Add "Duration" column and derive yearly target in `src/pages/Planner/components/RecurringGoalsTable/index.tsx` — add "Duration" `TableCell` header; display `${goal.recurringDurationYears ?? 1} year${(goal.recurringDurationYears ?? 1) > 1 ? 's' : ''}` per row; change "Yearly Target" column to display `formatCurrency(goal.getTargetAmount() / (goal.recurringDurationYears ?? 1))` — depends on T012; also removes remaining `₹` hardcode (subsumes T005 for this file)
- [x] T017 [P] [US2] Update `src/domain/FinancialGoals.test.ts` — add tests: `getTerm()` returns `recurringDurationYears` when set; `getMonthTerm()` returns `duration × 12`; `recurringDurationYears = undefined` defaults to 1 for both; non-RECURRING goals unaffected — depends on T012

**Checkpoint**: US2 fully functional. Create 1-year and 2-year recurring goals and verify SIP calculations differ correctly.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Clean up snapshot files broken by display changes and validate full build.

- [x] T018 [P] Update snapshot files broken by currency display changes — delete or regenerate `src/pages/Planner/components/RecurringGoalsTable/__snapshots__/index.test.tsx.snap`, `src/pages/CongratulationsPage/__snapshots__/index.test.tsx.snap`, and any other affected `__snapshots__` directories by running `npx vitest run --update-snapshots`
- [x] T019 Run `npm run build` from repo root and confirm no TypeScript errors or build failures
- [x] T020 [P] Run `npm test` (full suite) and confirm all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks T009 only
- **US1 (Phase 3)**: T004–T008, T010–T011 can start after Phase 1; T009 requires T002
- **US2 (Phase 4)**: Fully independent of US1 — can proceed in parallel with Phase 3 after Phase 1; T015 and T016 depend on T012 within the phase
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent — requires only `formatCompactCurrency` from Phase 2 (T002) for T009; all other US1 tasks use existing `formatCurrency`
- **User Story 2 (P2)**: Independent of US1 — domain change (T012) is the only internal prerequisite for T015 and T016; storage updates (T013, T014) are parallel to T012

### Within Each User Story

- US1: T004–T008, T010–T011 are all parallel; T009 waits for T002
- US2: T012 first; then T013, T014, T017 in parallel; then T015, T016

### Parallel Opportunities

Tasks marked `[P]` operate on distinct files with no shared write conflicts. Within US1, seven of eight tasks are parallel. Within US2, T013/T014/T017 are parallel after T012.

---

## Parallel Example: User Story 1

```bash
# These 7 tasks can all run simultaneously (different files):
T004 – TermwiseProgressBox/index.tsx
T005 – RecurringGoalsTable/index.tsx (currency fix only)
T006 – GoalCard/index.tsx
T007 – GoalCard/InvestmentLogHistory/index.tsx
T008 – GoalCard/LogEntryForm/index.tsx
T010 – CustomLegend/index.tsx
T011 – CongratulationsPage/index.tsx

# T009 runs after T002 completes:
T009 – GoalCard/InvestmentTracker/index.tsx
```

## Parallel Example: User Story 2

```bash
# T012 first:
T012 – FinancialGoals.ts (domain change)

# Then in parallel:
T013 – localFileProvider.ts
T014 – googleDriveProvider.ts
T017 – FinancialGoals.test.ts

# Then in parallel (both depend on T012):
T015 – FinancialGoalForm/index.tsx
T016 – RecurringGoalsTable/index.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify environment
2. Complete Phase 2: Add `formatCompactCurrency` + tests
3. Complete Phase 3: Replace all hardcoded `₹` across 8 UI files
4. **STOP and VALIDATE**: Set locale to `en-US`, confirm all amounts show `$`
5. Ship US1 independently if desired

### Incremental Delivery

1. Phase 1 + 2: Foundation ready
2. Phase 3 (US1): Locale currency everywhere → validate → demo
3. Phase 4 (US2): Recurring duration → validate → demo
4. Phase 5: Polish, snapshots, build gate

---

## Notes

- `[P]` tasks operate on different files and have no shared write conflicts
- US1 and US2 are fully independent — a single developer can work them sequentially, or two developers in parallel
- T005 and T016 both touch `RecurringGoalsTable/index.tsx`: if working sequentially, T005 can be skipped and the `₹` fix bundled into T016; if working in parallel, T005 does the currency fix and T016 adds the Duration column
- Snapshot files (`__snapshots__/`) should be regenerated last (T018) once all component changes are settled
- Constitution gate: run `npm run build` (T019) and `npm test` (T020) before marking feature complete
