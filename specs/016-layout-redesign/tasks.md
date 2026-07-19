# Tasks: Planner Page Layout Redesign

**Input**: Design documents from `/specs/016-layout-redesign/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to
- No test tasks — this is a pure UI restructure with no new business logic

---

## Phase 1: Setup

No new dependencies, no project structure changes needed. Proceed directly to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Scaffold the top-level tab shell in Planner and lift shared computations. All user story work builds on this.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Restructure `src/pages/Planner/index.tsx`: (a) add `useState<0|1|2>(0)` for `activeTab`; (b) add `totalRequired` memo by aggregating `investmentBreakdownForAllGoals[*].investmentSuggestions[*].amount` de-duplicated by name then summed and rounded; (c) add `totalInvesting` memo as `Math.round(plannerData.investmentLogs.reduce((sum, s) => sum + s.monthlyAmount, 0))`; (d) add `aggregatedSuggestions` memo (same aggregation logic currently inside `InvestmentSuggestionsBox`); (e) add `goalWiseSuggestions` memo (same derivation currently inside `InvestmentSuggestionsBox`, mapping each goal's suggestions with `goalStartDate` and `goalTargetDate`); (f) replace the two `Grid container` rows (TargetBox+TermWiseProgressBox and InvestmentSuggestionsBox+GoalBox sidebar) with a `Tabs` bar (`Goals` | `Investment Plan` | `Portfolio`) followed by three `Box role="tabpanel" hidden={activeTab !== N}` panels with empty content; (g) remove `showDrawer`, `setShowDrawer`, `setShowDrawerCallback` state and the entire `Drawer` component block; (h) keep the header row (title + date picker + headerRight) and `PrintableReport` unchanged; (i) keep the `completedGoals` memo and `areAllGoalsCompleted` congratulations branch unchanged

**Checkpoint**: App renders with three empty tabs (Goals, Investment Plan, Portfolio) and no sidebar. Header and PDF export still work. TargetBox and TermWiseProgressBox are gone. `totalRequired`, `totalInvesting`, `aggregatedSuggestions`, `goalWiseSuggestions` are available as memos.

---

## Phase 3: User Story 1 — Goals Tab (Priority: P1) 🎯 MVP

**Goal**: Goal cards displayed in a comfortable 2-column grid inside a full-width Goals tab with an Add Goal button.

**Independent Test**: Navigate to the Goals tab, verify goal cards render in 2 columns on desktop with comfortable spacing, and that the Add Goal button opens the form.

- [x] T002 [P] [US1] Convert `src/pages/Planner/components/GoalBox/goalList.tsx` from vertical flex-column to a 2-column responsive Grid: replace the outer `Box sx={{ display:'flex', flexDirection:'column', gap:2 }}` with `<Grid container spacing={2}>` and wrap each goal's `<div key={goal.id}>` in `<Grid size={{ xs: 12, md: 6 }}>` — remove the `Divider` between cards (spacing handles separation)

- [x] T003 [P] [US1] Increase `GoalCard` padding in `src/pages/Planner/components/GoalCard/index.tsx`: change the root `Box` from `px: 1, py: 1` to `px: 2, py: 2`; adjust the absolute-positioned Edit button from `top: 4, right: 4` to `top: 8, right: 8` and Delete button from `top: 36, right: 4` to `top: 40, right: 8`

- [x] T004 [US1] Wire the Goals tab panel in `src/pages/Planner/index.tsx` (the `hidden={activeTab !== 0}` panel): (a) add `isAddGoalOpen` state and `AddGoalPopup` import; (b) render a header row inside the panel with a "Goals" `Typography` heading and an `+ Add Goal` `Button` (variant="contained", startIcon=AddIcon) that sets `isAddGoalOpen = true`; (c) render `GoalBox` below the header passing `financialGoals={plannerData.financialGoals}`, `investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}`, `selectedDate={selectedDate}`, `dispatch={dispatch}`, `useStyledBox={true}`; (d) add `className="goals-tab-panel"` to the panel Box; (e) render `<AddGoalPopup isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} dispatch={dispatch} />`

**Checkpoint**: Goals tab renders all goal cards in a 2-column grid with comfortable padding, Add Goal button works. Investment Plan and Portfolio tabs are still empty.

---

## Phase 4: User Story 2 — Investment Plan Tab (Priority: P2)

**Goal**: Allocation plan and investment tracker at full content width with no sidebar, no redundant arrow icon.

**Independent Test**: Navigate to the Investment Plan tab, verify allocation charts and SIP tracker fill the full content width.

- [x] T005 [P] [US2] Remove the Monthly Required / Monthly Investing stat boxes from `src/pages/Planner/components/GoalCard/components/InvestmentTracker/index.tsx`: delete the `totalRequired` and `totalInvesting` local computations and the `Grid container` block containing the two stat `Box` elements (lines ~36–98); these stats move to the stat strip (US4)

- [x] T006 [P] [US2] Clean up `src/pages/Planner/components/InvestmentSuggestions/index.tsx`: (a) remove the `»»` double-arrow `Grid` block (`size={{ xs:0, sm:0, md:0, lg:1 }}` containing `double_arrow` icon, lines ~149–163); (b) change the donut chart `Grid` breakpoint from `display={{ xs:'none', sm:'none', md:'none', lg:'flex' }}` to `display={{ xs:'none', sm:'none', md:'flex', lg:'flex' }}` so it appears on medium screens

- [x] T007 [US2] Wire the Investment Plan tab panel in `src/pages/Planner/index.tsx` (the `hidden={activeTab !== 1}` panel): render `<InvestmentSuggestionsBox dispatch={dispatch} investmentAllocations={plannerData.investmentAllocations} investmentBreakdownBasedOnTermType={investmentBreakdownBasedOnTermType} investmentLogs={plannerData.investmentLogs} goals={plannerData.financialGoals} />` — this component already has its own internal sub-tabs (Allocation Plan / Investment Tracker)

**Checkpoint**: Investment Plan tab shows full-width allocation charts and investment tracker. Goals tab still works. Portfolio tab still empty.

---

## Phase 5: User Story 3 — Portfolio Tab (Priority: P3)

**Goal**: Portfolio growth chart at full content width in its own tab.

**Independent Test**: Navigate to the Portfolio tab, verify the chart fills the full content width with all goal markers and the mode toggle visible.

- [x] T008 [US3] Move `GoalGrowthChart` from `InvestmentTracker` to the Portfolio tab: (a) in `src/pages/Planner/components/GoalCard/components/InvestmentTracker/index.tsx` remove the `<GoalGrowthChart … />` render (line ~101) and remove the `GoalGrowthChart` import and the `goals` and `goalWiseSuggestions` props from the `Props` type; (b) in `src/pages/Planner/index.tsx` wire the Portfolio tab panel (`hidden={activeTab !== 2}`) with `<GoalGrowthChart sips={plannerData.investmentLogs} goals={plannerData.financialGoals} allSuggestions={aggregatedSuggestions} goalWiseSuggestions={goalWiseSuggestions} />`; (c) in `src/pages/Planner/components/InvestmentSuggestions/index.tsx` remove the `goalWiseSuggestions` prop from the `InvestmentTracker` render and the `GoalSuggestion` import if no longer needed

**Checkpoint**: Portfolio tab shows full-width growth chart. All three tabs functional. Investment Tracker sub-tab now shows only comparison bars and SIP list.

---

## Phase 6: User Story 4 — Stat Strip (Priority: P4)

**Goal**: Persistent three-stat bar always visible above the tabs: Total Goal Target, Monthly Required, Monthly Investing.

**Independent Test**: Open the planner and verify three stat tiles appear above the tab bar regardless of which tab is active.

- [x] T009 [P] [US4] Create `src/pages/Planner/components/PlannerStatStrip/index.tsx`: render a `Box` with `display:'flex', gap:2, mb:2` containing three stat tiles — each tile is a `Box` with `border:'1px solid', borderColor:'divider', borderRadius:1.5, p:2, flex:1` containing an `overline` label and a bold `Typography` value; (a) "Total Goal Target" tile shows `formatCurrency(targetAmount)` in primary colour; (b) "Monthly Required" tile shows `formatCurrency(totalRequired)` with caption "/month across all goals"; (c) "Monthly Investing" tile uses `success.main` colour when `totalInvesting >= totalRequired`, `warning.main` when `totalInvesting > 0`, else `text.secondary` — caption reads "On track" / `formatCurrency(totalRequired - totalInvesting) + " short"` / "No SIPs logged yet"; add `className="stat-total-target"` to the Total Goal Target tile Box; export props type `{ targetAmount: number; totalRequired: number; totalInvesting: number }`

- [x] T010 [US4] Render `PlannerStatStrip` in `src/pages/Planner/index.tsx` directly above the `Tabs` bar: `<PlannerStatStrip targetAmount={targetAmount} totalRequired={totalRequired} totalInvesting={totalInvesting} />`

**Checkpoint**: Stat strip visible above tabs on all three tab views. All four user stories complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T011 Update page tour step selectors in `src/pages/Planner/components/Pagetour/index.tsx`: (a) change `.target-box` element to `.stat-total-target` and update description to "Your total inflation-adjusted goal target across all goals — visible at all times above the tabs"; (b) remove the `.financial-progress-box` step entirely (TermwiseProgressBox is removed); (c) change `.financial-goals-box` element to `.goals-tab-panel` and update description to "All your goals in one place. Each card shows the name, inflation-adjusted target, monthly SIP, and how far along you are"; (d) leave `.add-goals-button`, `.investment-plan-box`, `.customize-button`, `.calendar-button` steps unchanged

- [x] T012 [P] Run `npm run build` and fix any TypeScript errors — likely causes: removed props (`goalWiseSuggestions` from InvestmentTracker, `goals` from InvestmentTracker, `setShowDrawer` from removed TargetBox usage), missing imports in Planner/index.tsx (AddGoalPopup, GoalGrowthChart, PlannerStatStrip, AddIcon)

- [x] T013 [P] Update snapshot tests that fail after layout changes: run `npx vitest run` and for each snapshot failure update the snapshot with `npx vitest run --update-snapshots` — expected failures: `GoalBox/index.test.tsx` (GoalList now uses Grid), `GoalCard/index.test.tsx` (padding changed), any Planner-level snapshots; verify no logic-related test failures (only snapshot diffs)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **US1 (Phase 3)**: T002 and T003 can run immediately (different files from T001); T004 depends on T001
- **US2 (Phase 4)**: T005 and T006 can run immediately (different files); T007 depends on T001, T005, T006
- **US3 (Phase 5)**: T008 depends on T001 (for Portfolio panel) and can be done independently of US2
- **US4 (Phase 6)**: T009 can run immediately (new file); T010 depends on T001 and T009
- **Polish (Phase 7)**: T011, T012, T013 after all user story phases

### Task Dependencies Detail

```
T001 ─────────────────────────────────────────────────────────┐
                                                               ↓
T002 [P] ──────────────────────────────────────────── T004 ──→ done (US1)
T003 [P] ──────────────────────────────────────────────────────┘

T005 [P] ──────────────────────────────────────────┐
T006 [P] ──────────────────────────────────────────┼→ T007 ──→ done (US2)
(T001 required for T007) ──────────────────────────┘

T001 → T008 ───────────────────────────────────────────────── done (US3)

T009 [P] ──────────────────────────────────────────────────┐
T001 ──────────────────────────────────────────────────────┼→ T010 → done (US4)
                                                           ┘

T004 + T007 + T008 + T010 → T011 → T012 → T013 ────── done (Polish)
```

### Parallel Opportunities

- T002, T003, T005, T006, T009 can all start immediately — they all touch different files
- T004, T007, T008, T010 start after T001
- T012 and T013 can run in parallel after T011

---

## Implementation Strategy

### MVP First (Goals Tab Only)

1. T001 — scaffold tab shell
2. T002, T003 — prep GoalCard + GoalList (can run in parallel with T001)
3. T004 — wire Goals tab
4. **STOP AND VALIDATE**: Goals tab works, 2-column grid looks good

### Incremental Delivery

1. T001 + T002 + T003 + T004 → Goals tab done
2. T005 + T006 + T007 → Investment Plan tab done
3. T008 → Portfolio tab done
4. T009 + T010 → Stat strip done
5. T011 + T012 + T013 → Polish complete
