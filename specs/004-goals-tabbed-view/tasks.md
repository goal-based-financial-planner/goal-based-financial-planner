# Tasks: Tabbed Financial Goals View

**Input**: Design documents from `/specs/004-goals-tabbed-view/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Tests**: Not requested in spec. No test tasks generated.

**Organization**: Tasks grouped by user story. Three files change total — no new files, no new dependencies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the current build and tests pass before making any changes.

- [x] T001 Verify the project builds cleanly by running `npm run build` and confirm zero errors as the baseline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Clean up `GoalList` so it is a pure renderer that does not re-route goals by type. After the tab refactor, `GoalBox` owns all goal-type routing and passes pre-filtered arrays to `GoalList`. The existing internal split in `goalList.tsx` would become dead branching logic (Constitution Principle I violation) if left in place.

**⚠️ CRITICAL**: Complete before US1 tab implementation to avoid conflicting logic.

- [x] T002 In `src/pages/Planner/components/GoalBox/goalList.tsx`: remove the `recurringGoals` and `oneTimeGoals` filter variables (lines 22–27). Update the render to pass `goals` directly — render `RecurringGoalsTable` when any goal in the array is `RECURRING` type, or `GoalCard` rows when goals are `ONE_TIME` type. Verify the component still renders correctly for both types when called with a pre-filtered array.

**Checkpoint**: `goalList.tsx` is now a pure renderer. `GoalBox` is ready for tab implementation.

---

## Phase 3: User Story 1 — Tab Interface (Priority: P1) 🎯 MVP

**Goal**: Replace the stacked three-section layout (Financial Goals / Completed Goals / Recurring Goals) with a two-tab interface ("One Time (N)" / "Recurring (N)") that defaults to the "One Time" tab.

**Independent Test**: Load the Planner with at least one ONE_TIME goal and one RECURRING goal. Confirm two tabs appear with correct counts. Click each tab and confirm only the goals of that type are visible. Verify switching tabs is instantaneous.

### Implementation

- [x] T003 [US1] In `src/pages/Planner/components/GoalBox/index.tsx`: add `useState<0 | 1>(0)` import from React and declare `const [activeTab, setActiveTab] = useState<0 | 1>(0)` inside the component body for tab selection state
- [x] T004 [US1] In `src/pages/Planner/components/GoalBox/index.tsx`: compute `const oneTimeCount = pendingGoals.length + completedGoals.length` and `const recurringCount = recurringGoals.length` using the existing `useMemo`-derived arrays
- [x] T005 [US1] In `src/pages/Planner/components/GoalBox/index.tsx`: import `Tabs` and `Tab` from `@mui/material` and replace the existing three-Grid stacked return block with a single container holding a `<Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as 0 | 1)}>` with two `<Tab>` children labelled `\`One Time (${oneTimeCount})\`` and `\`Recurring (${recurringCount})\``
- [x] T006 [US1] In `src/pages/Planner/components/GoalBox/index.tsx`: implement Tab 0 panel as a `<Box role="tabpanel" hidden={activeTab !== 0}>` containing: a "Financial Goals" `Typography` h6 heading + `<GoalList>` for `pendingGoals` (rendered only when `pendingGoals.length > 0`), followed by a "Completed Goals" `Typography` h6 heading + `<GoalList>` for `completedGoals` (rendered only when `completedGoals.length > 0`)
- [x] T007 [US1] In `src/pages/Planner/components/GoalBox/index.tsx`: implement Tab 1 panel as a `<Box role="tabpanel" hidden={activeTab !== 1}>` containing `<GoalList goals={recurringGoals} ...>` (rendered only when `recurringGoals.length > 0`). Wrap the entire Tabs + panels structure in `<StyledBox>` when `useStyledBox` is true, replacing the per-section `StyledBox` calls from the old layout. Remove the three now-unused helper functions `getPendingGoals()`, `getCompletedGoals()`, `getRecurringGoals()`.

**Checkpoint**: US1 fully functional. Tab switching works. Goal counts show in labels. Active/completed sub-sections appear within the "One Time" tab. Build must pass.

---

## Phase 4: User Story 2 — Yearly Target Label Fix (Priority: P2)

**Goal**: Correct the misleading "Monthly Target" column header in the recurring goals table to "Yearly Target" so it accurately reflects the stored yearly amount.

**Independent Test**: View a recurring goal with a known yearly target. Confirm the column header reads "Yearly Target" and the displayed value matches the stored yearly amount exactly.

### Implementation

- [x] T008 [P] [US2] In `src/pages/Planner/components/RecurringGoalsTable/index.tsx`: change the `TableCell` text in `TableHead` from `Monthly Target` to `Yearly Target` (line 42 of current file). No other changes to this file.

**Checkpoint**: US2 complete. One string changed. Build must pass.

---

## Phase 5: User Story 3 — Empty States and Default Tab (Priority: P3)

**Goal**: When a tab contains no goals, display a clear empty state message instead of a blank area. "One Time" tab is the default on load.

**Independent Test**: Load the Planner with no recurring goals. Click the "Recurring" tab — confirm a message like "No recurring goals added yet." appears. Load with no one-time goals — confirm the "One Time" tab shows an appropriate empty state. Verify the "One Time" tab is always selected by default on page load.

### Implementation

- [x] T009 [US3] In `src/pages/Planner/components/GoalBox/index.tsx`: inside the Tab 0 panel (`hidden={activeTab !== 0}`), add a condition: when `oneTimeCount === 0`, render a `<Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>No one-time goals added yet.</Typography>` in place of the sub-section content. The `useState(0)` default (added in T003) already satisfies the "One Time" tab as default — no additional change needed.
- [x] T010 [US3] In `src/pages/Planner/components/GoalBox/index.tsx`: inside the Tab 1 panel (`hidden={activeTab !== 1}`), add a condition: when `recurringCount === 0`, render a `<Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>No recurring goals added yet.</Typography>` in place of the GoalList content.

**Checkpoint**: US3 complete. All three user stories functional. Both tabs have empty states. Build and tests must pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and final verification.

- [x] T011 [P] In `src/pages/Planner/components/GoalBox/index.tsx`: review the final file for any unused imports left over from the old stacked layout (e.g. `Grid2`, unused `useMemo` dependencies) and remove them to keep the import list clean
- [x] T012 Run `npm run build` and confirm zero TypeScript errors and zero build warnings related to changed files
- [x] T013 Run `npm test -- --watchAll=false` and confirm all existing tests pass with no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks US1
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Independent of all other phases — can run in parallel with any phase after Phase 1
- **US3 (Phase 5)**: Depends on US1 completion (tab panels must exist before empty states can be added)
- **Polish (Phase 6)**: Depends on US1, US2, US3 all complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational phase — no dependency on US2 or US3
- **US2 (P2)**: Fully independent — touches a different file from US1/US3
- **US3 (P3)**: Depends on US1 (adds conditions inside panels created by US1)

### Within Each User Story

- T003 → T004 → T005 → T006 → T007 (sequential within US1 — each task builds on the previous)
- T008 standalone (US2)
- T009 and T010 can run in parallel within US3 (same file, different panels, no conflict if done sequentially)

### Parallel Opportunities

- **US2 (T008)** can be done any time after T001 — completely independent file
- **T011** (import cleanup) can run in parallel with T012/T013 in polish phase
- With two developers: Developer A handles US1 + US3 (GoalBox); Developer B handles US2 (RecurringGoalsTable) simultaneously

---

## Parallel Example: Maximum Parallelism

```text
# After T001 (baseline verify):

Thread A: T002 → T003 → T004 → T005 → T006 → T007 → T009 → T010
Thread B: T008 (US2 — completely independent, different file)

# After both threads complete:
T011 [P] + T012 + T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify baseline (T001)
2. Complete Phase 2: GoalList cleanup (T002)
3. Complete Phase 3: Tab interface (T003–T007)
4. **STOP and VALIDATE**: Two tabs visible, counts correct, switching works, active/completed sub-sections inside "One Time" tab
5. Ship MVP — recurring label fix and empty states can follow

### Incremental Delivery

1. T001–T007: Tab interface live → users can switch between goal types ✅
2. T008: Label fix live → recurring goals correctly labelled "Yearly Target" ✅
3. T009–T010: Empty states live → no blank tabs when goals are missing ✅
4. T011–T013: Clean build confirmed ✅

---

## Notes

- All changes are within `src/pages/Planner/components/` — no shared component or domain changes
- No new npm packages — `Tabs` and `Tab` are already in `@mui/material` v6
- MUI Tabs handle ARIA automatically (`role="tablist"`, `aria-selected`) — no extra accessibility work needed
- `[P]` = different file or independent section, safe to parallelize
- Commit after each completed checkpoint to keep changes reviewable
