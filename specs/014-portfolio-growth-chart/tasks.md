# Tasks: Portfolio Growth Projection Chart

**Input**: Design documents from `/specs/014-portfolio-growth-chart/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Unit tests are included for the domain function (pure math — high value) and chart component (marker/milestone presence). Visual/responsive tests are manual quickstart steps.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

---

## Phase 1: Setup (File Scaffolding)

**Purpose**: Create all new file stubs so parallel work in Phase 2 can begin immediately. No logic yet — just empty exports.

- [x] T001 Create `src/domain/goalProjections.ts` with exported empty stubs for `ProjectionPoint`, `GoalProjectionSeries` types and `buildGoalProjectionSeries` function signature
- [x] T002 [P] Create `src/domain/goalProjections.test.ts` with import of `buildGoalProjectionSeries` and empty `describe` block
- [x] T003 [P] Create `src/pages/Planner/hooks/useGoalProjections.ts` with exported empty `useGoalProjections` hook stub
- [x] T004 [P] Create `src/pages/Planner/components/GoalGrowthChart/index.tsx` with exported empty `GoalGrowthChart` component stub accepting `projections: GoalProjectionSeries[]` prop

**Checkpoint**: All new files exist and import cleanly — `npm run build` passes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain function, hook, and tab wiring that ALL user stories depend on. Must complete before any US phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Implement `buildGoalProjectionSeries(goal, investmentSuggestions)` in `src/domain/goalProjections.ts` — generates monthly `ProjectionPoint[]` from goal's `investmentStartDate` to `targetDate` using `calculateFutureValue`, sets `currentValue` from SIP math × elapsed months (always computed, no log entries required), sets `isCompleted` when `targetDate < today`
- [x] T006 [P] Write unit tests in `src/domain/goalProjections.test.ts` covering all 6 cases from plan.md: (1) 2-year one-time goal → 25 projection points with last ≈ targetAmount, (2) 1-year recurring goal → 13 points, (3) goal with past targetDate → `isCompleted=true` + empty `projectionPoints`, (4) goal with 0-month term → empty series without error, (5) zero investment suggestions → all-zero projectionPoints, (6) goal with elapsed months and no logs → `currentValue` > 0
- [x] T007 Implement `useGoalProjections(plannerData, investmentBreakdownForAllGoals)` in `src/pages/Planner/hooks/useGoalProjections.ts` — `useMemo` over `plannerData.financialGoals`, looks up each goal's suggestions from `investmentBreakdownForAllGoals`, returns `GoalProjectionSeries[]`
- [x] T008 Update `src/pages/Planner/components/InvestmentSuggestions/index.tsx` — add `projections: GoalProjectionSeries[]` prop, change `activeTab` type from `0 | 1` to `0 | 1 | 2`, add `<Tab label="Growth Chart" />` as third tab and empty Tab 2 tabpanel rendering `<GoalGrowthChart projections={projections} />`
- [x] T009 Update `src/pages/Planner/index.tsx` — call `useGoalProjections(plannerData, investmentBreakdownForAllGoals)` and pass the returned `projections` array as a new prop to `InvestmentSuggestionsBox`

**Checkpoint**: "Growth Chart" tab appears in the UI (empty), `npm run test:ci` passes, `npm run build` passes

---

## Phase 3: User Story 1 — See the Full Projection Picture (Priority: P1) 🎯 MVP

**Goal**: Render a distinct area line per active financial goal on the "Growth Chart" tab, spanning from the goal's investment start date to its target date, with correct endpoint values and a color+line-style legend.

**Independent Test**: Add two goals with different target dates → open "Growth Chart" tab → verify two distinct lines appear, each ending at the correct inflation-adjusted target amount, with a legend naming both goals.

- [x] T010 [US1] Implement empty-state message in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — when all projections are completed or `projections` is empty, render a `<Typography>` prompt ("Add financial goals to see your growth projection") instead of the chart
- [x] T011 [US1] Build shared X-axis date array in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — compute sorted union of all active `projectionPoints[].date` values (naturally spans `min(investmentStartDate)` to `max(targetDate)`); map each active projection's points to this shared axis (inserting `null` where a goal has no data)
- [x] T012 [US1] Render `LineChart` from `@mui/x-charts` in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — one series per active goal with `area: true`, unique color from MUI palette, and cycled line-dash pattern (solid → dashed → dotted → dash-dot for goals 1–4+); X-axis formatted as `"MMM YYYY"`; Y-axis auto-scaled and currency-formatted; legend visible showing goal name with its line-style swatch; tooltip showing date + amount per goal
- [x] T013 [P] [US1] Add `aria-label="Portfolio growth projection chart"` to the chart container `<Box>` in `src/pages/Planner/components/GoalGrowthChart/index.tsx` for screen-reader accessibility
- [x] T014 [P] [US1] Write component smoke tests in `src/pages/Planner/components/GoalGrowthChart/index.test.tsx` — (1) renders empty-state when passed empty projections, (2) renders without crashing when passed a valid active projection series

**Checkpoint**: "Growth Chart" tab shows colored + dashed area lines per goal; empty state renders correctly; `npm run test:ci` passes

---

## Phase 4: User Story 2 — Track Actual Accumulated Value vs. Projection (Priority: P2)

**Goal**: Show a vertical "Today" reference line on the chart with a per-goal dot/marker at each goal's current accumulated value (`currentValue`), making the on-track vs. behind-track state visually obvious.

**Independent Test**: With an existing goal that has elapsed months, open "Growth Chart" tab → verify a "Today" vertical line is visible and each goal's line has a distinct marker at today's date showing the accumulated value.

- [x] T015 [US2] Add a vertical `referenceLines` entry for today's date to the `LineChart` in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — label it `"Today"` and style it distinctly (dashed vertical line)
- [x] T016 [US2] Render a highlighted dot marker per goal at the `currentValue` position on today's date in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — use the chart's `markLine` or a custom `slots` overlay; marker must be visible regardless of whether the user has investment log entries (value always comes from `GoalProjectionSeries.currentValue`)
- [x] T017 [P] [US2] Extend component tests in `src/pages/Planner/components/GoalGrowthChart/index.test.tsx` — verify the "Today" reference line is present in the rendered output when projections contain at least one active goal with elapsed months

**Checkpoint**: "Today" vertical line and per-goal value markers are visible; marker is shown even when no investment log entries exist; `npm run test:ci` passes

---

## Phase 5: User Story 3 — Understand Per-Goal Milestones (Priority: P3)

**Goal**: Show a milestone annotation at each goal's target date on the chart, labeled with the goal name and inflation-adjusted target amount. Two goals with the same target year must both be legible.

**Independent Test**: Add two goals sharing the same target year → open "Growth Chart" tab → verify both milestone markers are visible and labeled without overlapping or hiding each other.

- [x] T018 [US3] Add milestone annotations at each active goal's `targetDate` in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — render as a secondary `referenceLines` entry or custom overlay; each annotation shows the goal name and formatted `targetAmount`
- [x] T019 [US3] Handle overlapping milestone labels in `src/pages/Planner/components/GoalGrowthChart/index.tsx` — when two or more goals share the same target year, vertically stagger or offset their annotations so both remain readable (e.g., alternate label position above/below the marker line)
- [x] T020 [P] [US3] Extend component tests in `src/pages/Planner/components/GoalGrowthChart/index.test.tsx` — verify milestone annotation content (goal name + amount) is present in rendered output for each active goal

**Checkpoint**: All goal target dates show labeled milestone markers; co-dated goals are both legible; `npm run test:ci` passes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: PDF table export, mobile responsiveness verification, and final validation.

- [x] T021 Add "Section 5: Growth Projection Summary" to `src/pages/Planner/components/PrintableReport/index.tsx` — accept `projections: GoalProjectionSeries[]` as a new prop; render a table with columns: Goal Name | Target Date | Target Amount | Year 1 | Year 2 | Year 3 … (up to the goal's full term); values pulled from `projectionPoints` at 12-month intervals; matches the format confirmed in spec clarification Q1
- [ ] T022 [P] Pass `projections` from `src/pages/Planner/index.tsx` to `PrintableReport` and confirm the projected values table appears in the exported PDF (run `npm start`, export PDF, visually verify Section 5 is present and populated)
- [ ] T023 [P] Verify chart responsiveness: run `npm start`, resize browser to 375px width, confirm "Growth Chart" tab is readable without horizontal scrolling and no labels overlap — satisfies SC-004
- [ ] T024 [P] Run the full 10-step verification checklist from `specs/014-portfolio-growth-chart/quickstart.md` against the running app and mark all steps complete

**Checkpoint**: PDF export includes the projected values table; chart is mobile-readable; all quickstart steps verified; `npm run build` passes cleanly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002, T003, T004 can run in parallel after T001
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story phases; T006 can run in parallel with T005
- **US1 (Phase 3)**: Depends on Foundational complete — T013 and T014 can run in parallel after T012
- **US2 (Phase 4)**: Depends on Phase 3 complete (needs `GoalGrowthChart` rendering); T017 can run in parallel after T016
- **US3 (Phase 5)**: Depends on Phase 3 complete; T020 can run in parallel after T018/T019
- **Polish (Phase 6)**: Depends on all US phases complete; T022, T023, T024 can run in parallel after T021

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational phase — no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 (`GoalGrowthChart` must be rendering before markers can be added)
- **US3 (P3)**: Depends on US1 (`GoalGrowthChart` must be rendering before milestone overlays)
- US2 and US3 can proceed in parallel once US1 is complete

### Parallel Opportunities Per Phase

```bash
# Phase 1 — after T001:
Task: T002 "Create goalProjections.test.ts stub"
Task: T003 "Create useGoalProjections.ts stub"
Task: T004 "Create GoalGrowthChart/index.tsx stub"

# Phase 2 — T005 then:
Task: T006 "Write unit tests for buildGoalProjectionSeries"  ← parallel with T007

# Phase 3 — after T012:
Task: T013 "Add aria-label to chart container"
Task: T014 "Write component smoke tests"

# Phase 5 — after T018/T019:
Task: T020 "Write milestone marker component tests"

# Phase 6 — after T021:
Task: T022 "Verify PDF export"
Task: T023 "Verify mobile responsiveness at 375px"
Task: T024 "Run quickstart.md checklist"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (scaffolding)
2. Complete Phase 2: Foundational (domain + hook + tab wiring)
3. Complete Phase 3: User Story 1 (projection lines)
4. **STOP and VALIDATE**: Two goals visible as distinct colored+dashed area lines; legend correct; empty state works
5. Demo/review before continuing

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready, tab visible (empty)
2. Phase 3 (US1) → Projection lines visible → MVP ✅
3. Phase 4 (US2) → Today marker visible → Plan tracking enabled
4. Phase 5 (US3) → Milestone markers → Full goal sequencing view
5. Phase 6 (Polish) → PDF table + mobile + final QA

### Single-Developer Sequence

```
T001 → T002/T003/T004 (parallel) → T005 → T006/T007 (parallel) →
T008 → T009 → T010 → T011 → T012 → T013/T014 (parallel) →
T015 → T016 → T017 →
T018 → T019 → T020 →
T021 → T022/T023/T024 (parallel)
```

---

## Notes

- [P] tasks touch different files with no blocking inter-dependencies
- `buildGoalProjectionSeries` (T005) + its tests (T006) are the highest-value unit-tested code in this feature — the math must be correct before anything renders
- `currentValue` is always derived from SIP math in `buildGoalProjectionSeries` — never from investment log entries — so the US2 marker is always present
- Color + line-dash cycling (T012) is required for color-blind accessibility (spec FR-003)
- PDF export uses a data table (T021), not a chart image capture — confirmed in spec clarification Q1
- Commit after each phase checkpoint to keep history clean and rollback cheap
