# Tasks: User-Configurable Inflation Rate

**Input**: Design documents from `/specs/013-configurable-inflation-rate/`
**Branch**: `013-configurable-inflation-rate`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Maps to user story from spec.md (US1, US2, US3)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and state layer changes that ALL user stories depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: These tasks unblock US1, US2, and US3 simultaneously.

- [x] T001 Rename `INFLATION_PERCENTAGE` → `DEFAULT_INFLATION_RATE` in `src/domain/constants.ts` (single export, single import site in `FinancialGoals.ts`)
- [x] T00 Add `inflationRate: number` field and constructor parameter (5th arg, default `DEFAULT_INFLATION_RATE`) to `PlannerData` class in `src/domain/PlannerData.ts`
- [x] T00 Add `UPDATE_INFLATION_RATE = 'UPDATE_INFLATION_RATE'` to `PlannerDataActionType` enum and add `updateInflationRate(dispatch, rate: number)` action creator in `src/store/plannerDataActions.ts`
- [x] T00 Add `| number` to `PlannerDataActionPayload` union, handle `UPDATE_INFLATION_RATE` case in `plannerDataReducer`, and update every existing `new PlannerData(...)` call in `src/store/plannerDataReducer.ts` to forward `state.inflationRate` as the 5th argument (prevents field loss during other mutations)

**Checkpoint**: `npm run build` must pass cleanly. No behaviour changes yet — `inflationRate` exists but is not wired to any calculation.

---

## Phase 3: User Story 1 — Set a Custom Inflation Rate (Priority: P1) 🎯 MVP

**Goal**: Users can change the inflation rate from a persistent inline control on the Planner page and immediately see all one-time goal targets and SIP amounts recalculate.

**Independent Test**: Open a plan with one one-time goal of ₹10,00,000 due in 5 years. With rate 5% the corpus shows ~₹12,76,282. Change to 8% → corpus updates to ~₹14,69,328. Enter -1 → error shown, value not applied. Clear field → resets to 5%.

- [x] T00 Update `getInflationAdjustedTargetAmount()` in `src/domain/FinancialGoals.ts` to accept `inflationRate: number = DEFAULT_INFLATION_RATE` as a parameter; remove the hardcoded `INFLATION_PERCENTAGE` reference inside the method body (keep the early-return guard for recurring goals unchanged for now — that is US2)
- [x] T00 [P] [US1] Pass `plannerData.inflationRate` to both `getInflationAdjustedTargetAmount()` call sites in `src/pages/Planner/index.tsx` (line ~55 in `targetAmount` useMemo and line ~117 in `termTypeSum` within `termTypeWiseProgressData` useMemo)
- [x] T00 [P] [US1] Thread `inflationRate` through `useInvestmentCalculator` hook in `src/pages/Planner/hooks/useInvestmentCalculator.ts`: accept it as a parameter (or read from `plannerData`) and pass it to `getInflationAdjustedTargetAmount()` at line ~78
- [x] T00 [P] [US1] Add `inflationRate: number` prop to `GoalCardProps` type and pass `plannerData.inflationRate` through to both `getInflationAdjustedTargetAmount()` call sites in `src/pages/Planner/components/GoalCard/index.tsx` (lines ~55 and ~61)
- [x] T00 [P] [US1] Pass `inflationRate` to both `getInflationAdjustedTargetAmount()` call sites in `src/pages/Planner/components/PrintableReport/index.tsx` (lines ~119 and ~128) and add `inflationRate: number` to its props
- [x] T01 [US1] Create `src/pages/Planner/components/InflationRateControl/index.tsx`: MUI `TextField` (`type="number"`, `inputProps={{ min: 0, max: 20, step: 0.01 }}`), `InputAdornment` showing `%`, controlled by local draft state, dispatches `updateInflationRate` on blur/enter only when value is valid (0–20), shows `FormHelperText` error for out-of-range input, resets to `5` when field is cleared; props: `inflationRate: number`, `dispatch: Dispatch<PlannerDataAction>`
- [x] T01 [US1] Add `<InflationRateControl>` to `src/pages/Planner/index.tsx` layout adjacent to `<TargetBox>` in the top Grid row; pass `plannerData.inflationRate` and `dispatch`; also pass `inflationRate` to all GoalCard and PrintableReport usages
- [x] T01 [US1] Update `src/domain/FinancialGoals.test.ts`: (a) change all existing `getInflationAdjustedTargetAmount()` calls in the test file to pass an explicit rate (e.g., `5`) so they remain green after the signature change; (b) add a test `"should use a custom inflation rate for one-time goals"` that passes `8` and asserts `₹10L × 1.08⁵ ≈ 14693280`; (c) add a test `"should return nominal amount when inflation rate is 0"` asserting `targetAmount === result`

**Checkpoint**: US1 is fully functional. Build passes, all existing tests pass, the new custom-rate test passes. The InflationRateControl is visible and reactive on the Planner page.

---

## Phase 4: User Story 2 — Inflation Applied to Recurring Goals (Priority: P2)

**Goal**: Recurring goal SIP suggestions account for inflation over the goal's active duration.

**Independent Test**: Open a plan with a recurring goal of ₹1,00,000/year for 3 years. With rate 5% the corpus should show ~₹1,15,763 (₹1L × 1.05³). Change to 7% → ~₹1,22,504. A legacy recurring goal with no duration stored should show ~₹1,05,000 (1-year default at 5%).

- [x] T01 [US2] Remove the `if (this.goalType === GoalType.RECURRING) return this.targetAmount;` early-return guard in `getInflationAdjustedTargetAmount()` in `src/domain/FinancialGoals.ts`; replace with a single unified formula using `this.goalType === GoalType.RECURRING ? (this.recurringDurationYears ?? 1) : this.getTerm()` as the exponent
- [x] T01 [US2] Update `src/domain/FinancialGoals.test.ts`: (a) change the existing `"should NOT apply inflation to recurring goals"` test to expect `105000` (₹1L × 1.05¹) instead of `100000`; (b) add `"should apply inflation to recurring goal with 3-year duration"` asserting ~₹1,15,763 at rate 5; (c) add `"should default to 1-year term for legacy recurring goal with no duration"` asserting `100000 × 1.05¹ = 105000`

**Checkpoint**: All domain tests pass. Recurring goal SIP amounts on the Planner page are now visibly higher than before.

---

## Phase 5: User Story 3 — Inflation Rate Persists Across Sessions (Priority: P3)

**Goal**: The inflation rate set by the user is saved as part of the plan and restored on the next visit, in both local and cloud storage modes.

**Independent Test**: Set inflation rate to 8%, close the browser tab, reopen the plan — the control shows 8% and all goal figures match. Open a legacy plan file (JSON without `inflationRate` key) — control shows 5% and all figures are identical to pre-feature behaviour.

- [x] T01 [US3] Add to `src/domain/PlannerData.test.ts`: (a) `"inflationRate defaults to 5 when not provided"` — construct `new PlannerData()` and assert `inflationRate === 5`; (b) `"inflationRate is preserved when goals are added"` — construct with `inflationRate: 8`, dispatch `ADD_FINANCIAL_GOAL` via reducer, assert the returned state still has `inflationRate === 8`; (c) `"inflationRate defaults to 5 for legacy plan data missing the field"` — simulate deserialization by passing `undefined` and assert it resolves to `5`
- [x] T01 [US3] Manually verify persistence end-to-end per quickstart.md step 5: set rate to 9%, save plan (local file), reload page, confirm rate reads back as 9% and corpus figures match

**Checkpoint**: Persistence is confirmed. The inflation rate survives a full save-and-reload cycle.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI completeness (FR-011) and final quality pass.

- [x] T01 [P] Wrap the displayed corpus amount in `src/pages/Planner/components/GoalCard/index.tsx` with a MUI `Tooltip` whose `title` is `"Original target: {formatCurrency(goal.getTargetAmount())}"` — this surfaces the nominal amount as an info indicator (FR-011, clarification Q2)
- [x] T01 [P] Add edge case test `"should treat 0% inflation as returning the nominal amount for both goal types"` in `src/domain/FinancialGoals.test.ts` (passes `0` to `getInflationAdjustedTargetAmount()` and asserts result equals `targetAmount`)
- [x] T01 Run `npm run build` and `npm test -- --run` to confirm zero build errors and all tests pass; fix any type errors introduced by new prop signatures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. Blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational complete (T001–T004). T006, T007, T008, T009 can run in parallel after T005.
- **US2 (Phase 4)**: Depends on T005 (method signature) from US1. T013 is a one-line change; T014 is test updates.
- **US3 (Phase 5)**: Persistence infrastructure is complete after Foundational (T002, T004). This phase adds verification only.
- **Polish (Phase 6)**: Depends on all story phases complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only. No dependency on US2 or US3.
- **US2 (P2)**: Depends on Foundational + T005 (method signature change from US1). Spec notes US2 requires US1 as a prerequisite.
- **US3 (P3)**: Persistence is implicit once Foundational is done; Phase 5 adds automated verification only.

### Within US1 — Parallel Opportunities

```
T005 (method signature change — must complete first)
  │
  ├── T006 [P]  src/pages/Planner/index.tsx
  ├── T007 [P]  src/pages/Planner/hooks/useInvestmentCalculator.ts
  ├── T008 [P]  src/pages/Planner/components/GoalCard/index.tsx
  └── T009 [P]  src/pages/Planner/components/PrintableReport/index.tsx
       │
       └──── (all four complete) → T010 (InflationRateControl component)
                                        │
                                        └── T011 (wire into Planner layout)
                                                 │
                                                 └── T012 (update + add tests)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T004) — ~30 min
2. Complete Phase 3: User Story 1 (T005–T012) — core of the feature
3. **STOP and VALIDATE**: Change inflation rate on the Planner page, confirm corpus and SIP update live
4. US1 alone is already a shippable feature — recurring goals keep existing (no-inflation) behaviour

### Incremental Delivery

1. Foundational → US1: Plan-level inflation rate works for one-time goals ✅
2. US2: Apply inflation to recurring goals → SIP amounts now accurate for recurring ✅
3. US3: Persistence verified by tests → confidence it survives reloads ✅
4. Polish: Tooltip for nominal amount → UI completeness (FR-011) ✅

### Notes

- Tasks marked [P] touch different files and have no shared write conflicts — safe to parallelize
- T004 is the highest-risk task: it touches every `new PlannerData(...)` call in the reducer. Run `npm run build` immediately after.
- The existing test at `FinancialGoals.test.ts:222` (`"should NOT apply inflation to recurring goals"`) **will fail** after T013 — this is expected and T014 updates it.
- T016 is a manual verification step (no automated test for cross-tab persistence behaviour).
