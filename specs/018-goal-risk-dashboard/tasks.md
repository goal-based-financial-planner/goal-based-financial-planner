# Tasks: Goal Risk Dashboard

**Input**: Design documents from `/specs/018-goal-risk-dashboard/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Included. Constitution Principle V mandates unit tests for financial calculation logic (the new `goalRiskStatus.ts` derivation), and Principle V's existing precedent in this codebase (e.g. `whatIf.test.ts`, `GoalCard/index.test.tsx`) extends that to component-level coverage for the new chip/caption behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

---

## Phase 1: Setup (File Scaffolding)

**Purpose**: Create the new domain module so Foundational work has a file to fill in.

- [x] T001 Create `src/domain/goalRiskStatus.ts` with exported type stubs `GoalRiskDisplayStatus` (`'on-track' | 'at-risk' | 'not-evaluated'`) and `GoalRiskSummary` (`{ atRisk: number; total: number }`), plus empty-bodied exported function signatures `deriveGoalRiskStatuses(goals: FinancialGoal[], baseline: PortfolioWhatIfResult): Record<string, GoalRiskDisplayStatus>` and `summarizeGoalRisk(statuses: Record<string, GoalRiskDisplayStatus>): GoalRiskSummary`
- [x] T002 [P] Create `src/domain/goalRiskStatus.test.ts` with imports of the two functions/types above and an empty `describe('goalRiskStatus', ...)` block

**Checkpoint**: New files exist and import cleanly — `npm run build` passes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The reusable derivation and its wiring into the Planner page that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Export a shared `EMPTY_ADJUSTMENTS: Adjustments` constant (`{ goalInflationRates: {}, investmentReturnRates: {} }`) from `src/domain/whatIf.ts`; update `src/pages/Planner/hooks/useWhatIf.ts` to import it instead of its local `const EMPTY_ADJUSTMENTS` declaration (no behavior change — same object shape, now defined once)
- [x] T004 Implement `deriveGoalRiskStatuses(goals, baseline)` in `src/domain/goalRiskStatus.ts`: for each goal with `goalType !== GoalType.ONE_TIME` → `'not-evaluated'`; for each one-time goal, find its `WhatIfGoalMarker` in `baseline.markers` by `goalId` and map `portfolioValueAfter < 0` → `'at-risk'`, otherwise → `'on-track'` (default to `'on-track'` defensively if no marker is found, per data-model.md)
- [x] T005 Implement `summarizeGoalRisk(statuses)` in `src/domain/goalRiskStatus.ts`: filter out `'not-evaluated'` entries, return `{ atRisk: <count of 'at-risk'>, total: <remaining count> }`
- [x] T006 [P] Write unit tests in `src/domain/goalRiskStatus.test.ts` covering: (1) one-time goal with a positive `portfolioValueAfter` marker → `'on-track'`, (2) one-time goal with a negative `portfolioValueAfter` marker → `'at-risk'`, (3) recurring goal → always `'not-evaluated'` regardless of markers, (4) two one-time goals sharing a negative marker at the same withdrawal month → both `'at-risk'`, (5) empty goals array → empty statuses map and `summarizeGoalRisk` returns `{ atRisk: 0, total: 0 }`, (6) all-recurring plan (no one-time goals) → `summarizeGoalRisk` returns `{ atRisk: 0, total: 0 }` even though goals exist
- [x] T007 In `src/pages/Planner/index.tsx`, add three `useMemo` derivations alongside the existing `totalRequired`/`totalInvesting` ones: `baseline` (`buildPortfolioWhatIfResult(plannerData.financialGoals, plannerData.investmentLogs, plannerData.investmentAllocations, EMPTY_ADJUSTMENTS)`, deps on those three `plannerData` fields), `goalRiskStatuses` (`deriveGoalRiskStatuses(plannerData.financialGoals, baseline)`, deps on `plannerData.financialGoals` + `baseline`), and `goalRiskSummary` (`summarizeGoalRisk(goalRiskStatuses)`, deps on `goalRiskStatuses`)

**Checkpoint**: `npm run build` and `npm run test:ci` pass; no visible UI change yet (values computed but not yet consumed)

---

## Phase 3: User Story 1 - See which goals are at risk without leaving the main screen (Priority: P1) 🎯 MVP

**Goal**: Every one-time goal shows an on-track/at-risk chip (recurring goals show "not evaluated") wherever goals are browsed today — the Goals drawer — without needing the What-If tab.

**Independent Test**: Load a plan with one underfunded and one adequately funded one-time goal, open the Goals drawer (no What-If tab, no sliders), and confirm each goal's chip matches its actual funding state.

- [x] T008 [US1] Add a `riskStatus: GoalRiskDisplayStatus` prop to `GoalCard` in `src/pages/Planner/components/GoalCard/index.tsx`; render a static (non-interactive, no `onClick`) `Chip` near the goal name using the existing `material-symbols-rounded` icon convention already used elsewhere in this file — distinct color + icon + text label per state (e.g. success/"check_circle"/"On track", warning/"warning"/"At risk", neutral/"help"/"Not evaluated") so color is never the only signal (FR-007)
- [x] T009 [P] [US1] Extend `src/pages/Planner/components/GoalCard/index.test.tsx` with cases asserting each of the three `riskStatus` values renders its corresponding label and that the chip has no click handler attached
- [x] T010 [US1] Add a `goalRiskStatuses: Record<string, GoalRiskDisplayStatus>` prop to `GoalListProps` in `src/pages/Planner/components/GoalBox/goalList.tsx`; for each rendered goal, look up `goalRiskStatuses[goal.id]` and pass it as `riskStatus` to `<GoalCard>`
- [x] T011 [P] [US1] Create `src/pages/Planner/components/GoalBox/goalList.test.tsx` (new file, mocking `GoalCard`) asserting that each goal receives the `riskStatus` looked up from the `goalRiskStatuses` map by its `id`
- [x] T012 [US1] Add a `goalRiskStatuses: Record<string, GoalRiskDisplayStatus>` prop to `GoalBoxProps` in `src/pages/Planner/components/GoalBox/index.tsx`; forward it, unchanged, to all three `<GoalList>` call sites (pending, completed, recurring)
- [x] T013 [US1] Pass `goalRiskStatuses={goalRiskStatuses}` from `src/pages/Planner/index.tsx` into its `<GoalBox>` usage (the Goals drawer)
- [x] T014 [P] [US1] Update `src/pages/Planner/components/GoalBox/index.test.tsx`'s `MockGoalList` to capture and expose the `goalRiskStatuses` prop it receives, and add a test asserting `GoalBox` forwards the prop it's given down to `GoalList` unchanged

**Checkpoint**: Opening the Goals drawer shows the correct chip for every goal, including "not evaluated" recurring goals; `npm run test:ci` passes

---

## Phase 4: User Story 2 - See at a glance how many goals need attention (Priority: P2)

**Goal**: The always-visible stat strip shows a one-time-goal risk count ("N of M goals at risk") and its existing shortfall caption/color is reconciled to source from the same computation (FR-005, FR-009) instead of the old `totalInvesting >= totalRequired` heuristic.

**Independent Test**: Load a plan with a known mix of at-risk/on-track one-time goals (and at least one recurring goal), view the Planner page without opening any drawer or tab, and confirm the stat strip's count and caption/color match the per-goal chips from US1 and exclude the recurring goal from the count.

- [x] T015 [US2] Add a `goalRiskSummary: GoalRiskSummary` prop to `PlannerStatStripProps` in `src/pages/Planner/components/PlannerStatStrip/index.tsx`; replace the `isOnTrack = totalInvesting >= totalRequired` heuristic and its derived `investingColor`/`investingCaption` with logic driven by `goalRiskSummary`: when `goalRiskSummary.total === 0` fall back to today's neutral/no-data behavior (e.g. "No SIPs logged yet" when `totalInvesting === 0`, otherwise no risk-specific caption); otherwise show `success.main`/"On track" when `goalRiskSummary.atRisk === 0`, or `warning.main`/"`{atRisk}` of `{total}` goals at risk" when not
- [x] T016 [P] [US2] Create `src/pages/Planner/components/PlannerStatStrip/index.test.tsx` (new file) covering: all-on-track summary renders "On track"/success color, a mixed summary renders "N of M goals at risk"/warning color, `total === 0` with `totalInvesting === 0` falls back to "No SIPs logged yet", `total === 0` with `totalInvesting > 0` shows no risk caption
- [x] T017 [US2] Pass `goalRiskSummary={goalRiskSummary}` from `src/pages/Planner/index.tsx` into its `<PlannerStatStrip>` usage
- [x] T018 [P] [US2] Update `src/pages/Planner/index.test.tsx`'s `MockPlannerStatStrip` to capture and expose the `goalRiskSummary` prop, and add a test asserting `Planner` passes a `goalRiskSummary` consistent with the `financialGoals`/`investmentLogs` in the rendered `plannerData` fixture

**Checkpoint**: Stat strip and per-goal chips agree on every plan (SC-002); `npm run test:ci` passes

---

## Phase 5: User Story 3 - Status stays current as the plan changes (Priority: P3)

**Goal**: Editing a goal, an investment allocation's return rate, or a SIP entry updates both the per-goal chips and the stat-strip summary immediately, with no reload.

**Independent Test**: Load a plan with an at-risk goal, log enough additional SIP funding to close its shortfall, and confirm its chip and the stat-strip count both flip to on-track on the same render — without a page reload — and the reverse (lowering a return rate to create a shortfall) also flips correctly.

- [x] T019 [US3] Review the `useMemo` dependency arrays added in T007 (`baseline`, `goalRiskStatuses`, `goalRiskSummary`) in `src/pages/Planner/index.tsx` and confirm each recomputes on every relevant change: goal add/edit/remove (`plannerData.financialGoals`), allocation return-rate change (`plannerData.investmentAllocations`), and SIP log add/edit/remove (`plannerData.investmentLogs`); correct any missing dependency
- [x] T020 [P] [US3] Add a test in `src/pages/Planner/index.test.tsx` that renders `Planner` with an at-risk `plannerData` fixture, captures the `goalRiskSummary`/`goalRiskStatuses` props passed to the mocked `PlannerStatStrip`/`GoalBox`, then re-renders with an updated `plannerData` (additional SIP entry closing the shortfall) and asserts the props received on the second render reflect the closed shortfall — no unmount/remount involved

**Checkpoint**: All three user stories work together; full `npm run test:ci` and `npm run build` pass

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation against the spec's success criteria and edge cases.

- [x] T021 Run through every step of `quickstart.md` manually (`npm start`) and confirm each passes, paying particular attention to the no-goals case (FR-006), the all-recurring case (edge case), and the two-goals-sharing-a-shortfall case (edge case)
- [x] T022 Run `npm run test:ci` (full suite) and `npm run build`; fix any regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (T003-T007) completion
  - US1 (Phase 3), US2 (Phase 4), and US3 (Phase 5) touch different files at their leaf
    components but each rewires the same `Planner/index.tsx` prop list (T013, T017) and shares the
    `useMemo`s from T007 — safest done sequentially in priority order, though US1 and US2's
    component-level work (T008-T012, T015-T016) can proceed in parallel if staffed separately
  - US3 has no new production code of its own — it verifies/tests what T007, US1, and US2 already
    built, so it naturally comes last
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- Leaf component (`GoalCard` / `PlannerStatStrip`) before the components that thread props into it
- Tests alongside (or immediately after) the implementation task they cover
- Story's `Planner/index.tsx` wiring task last, since it's the integration point

### Parallel Opportunities

- T001/T002 (Setup) in parallel
- T003 and T006 (Foundational) in parallel with each other, but both depend on T004/T005 existing first for T006 to have something to test against — see task order above
- T009, T011, T014 (US1 tests) can run in parallel with each other once their corresponding implementation tasks land
- T016, T018 (US2 tests) in parallel with each other
- US1's component tasks (T008-T009) and US2's component tasks (T015-T016) can be developed in parallel by different people, since they touch entirely different files (`GoalCard` vs. `PlannerStatStrip`)

---

## Parallel Example: User Story 1

```bash
# After T004/T005/T007 (Foundational) land, these can proceed together:
Task: "Add riskStatus prop + chip rendering to GoalCard (T008)"
Task: "Extend GoalCard/index.test.tsx for the three riskStatus states (T009)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open the Goals drawer on a plan with mixed goal health; confirm chips are correct
5. Demo if ready — this alone delivers the feature's entire stated value proposition

### Incremental Delivery

1. Setup + Foundational → derivation exists and is wired, but not yet rendered anywhere
2. Add US1 → per-goal chips visible in the Goals drawer → demo (MVP)
3. Add US2 → always-visible summary + reconciled stat-strip caption → demo
4. Add US3 → confidence that both stay live as the plan changes → demo
5. Polish → quickstart.md walkthrough + full suite/build

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- `src/domain/whatIf.ts` is touched only additively (T003, exporting an existing local constant) —
  no behavior change to any of its existing exported functions
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
