# Tasks: What If

**Input**: Design documents from `/specs/017-scenario-comparison/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Note**: This is the third implementation on this branch — see `research.md` for the two earlier,
abandoned designs. Tasks below reflect what was actually built for the final "What If" model:
ephemeral live sliders, no persistence, one combined chart. Completed and verified with the full
test suite, `tsc --noEmit`, and `npm run build`.

## Format: `[ID] [P?] Description`

---

## Phase 1: Revert prior revision's persistence layer

- [x] T001 Remove `scenarios` field from `PlannerData` in `src/domain/PlannerData.ts` (back to 3-param constructor)
- [x] T002 [P] Revert `src/util/storage/localFileProvider.ts` and `src/util/storage/googleDriveProvider.ts` to stop parsing a `scenarios` field
- [x] T003 [P] Remove the scenario-related test cases added to `src/util/storage/localFileProvider.test.ts`
- [x] T004 Remove all 6 scenario `PlannerDataActionType` entries and dispatch helpers from `src/store/plannerDataActions.ts`
- [x] T005 Remove all 6 scenario reducer cases from `src/store/plannerDataReducer.ts` (and the `MAX_SCENARIOS` export / payload types)
- [x] T006 [P] Remove the "Scenario actions" describe block from `src/store/plannerDataReducer.test.ts`
- [x] T007 [P] Remove the scenario action-creator tests from `src/store/plannerDataActions.test.ts`

**Checkpoint**: `PlannerData` and the reducer/action layer match pre-scenario-feature state; full suite green

---

## Phase 2: Delete prior revision's domain/UI files

- [x] T008 Delete `src/types/scenario.ts`, `src/domain/scenarios.ts`, `src/domain/scenarios.test.ts`
- [x] T009 Delete `src/pages/Planner/hooks/useScenarioProjections.ts`
- [x] T010 Delete `src/pages/Planner/components/ScenarioComparison/` (including `GoalScenarioChart/`, `ScenarioOverrideForm/`, and all tests)

**Checkpoint**: No references to the old `Scenario` model remain (`tsc --noEmit` clean except for the not-yet-rewired Planner tab import)

---

## Phase 3: Build the What If domain layer

- [x] T011 Implement `Adjustments`, `GoalWhatIfResult`, `PortfolioWhatIfResult` types and `buildGoalWhatIfResult` / `buildPortfolioWhatIfResult` functions in `src/domain/whatIf.ts` — fixed baseline SIP via `calculateInvestmentSuggestionsForGoal`; per-goal target via `getInflationAdjustedTargetAmount(rateOverride)`; per-instrument growth via `calculateFutureValue` with overridden rates; combined calendar series summing every goal's own curve (0 before start, own curve during, flat after target)
- [x] T012 [P] Unit tests in `src/domain/whatIf.test.ts`: no-adjustments matches baseline; inflation adjustment changes target not projection; inflation adjustment can flip status to at-risk; return adjustment changes projection not target; one point per month; empty goal list returns zeroed/empty result; combined points span earliest-start to latest-target; return adjustment lowers the combined series

**Checkpoint**: Domain math fully tested independently of UI

---

## Phase 4: Build the What If UI

- [x] T013 Implement `useWhatIf(plannerData)` in `src/pages/Planner/hooks/useWhatIf.ts` — owns `Adjustments` via `useState` (reset on every mount); exposes `oneTimeGoals`, `investmentBaselines` (deduped across all allocation term types), setters, `resetAdjustments`, memoized `baseline`/`adjusted` results
- [x] T014 [P] Hook tests in `src/pages/Planner/hooks/useWhatIf.test.ts`: baseline === adjusted with no adjustments; inflation setter raises adjusted target only; return setter lowers adjusted projection only; reset clears adjustments
- [x] T015 Implement `WhatIfChart` in `src/pages/Planner/components/WhatIf/WhatIfChart/index.tsx` — two-series `LineChart` ("Current Plan" solid, "What If" highlighted), target reference line, empty state
- [x] T016 [P] Component tests for `WhatIfChart`: empty state, two distinctly labeled series + reference line
- [x] T017 Implement `WhatIf` composition in `src/pages/Planner/components/WhatIf/index.tsx` — empty state when no one-time goals; inflation slider per goal (`onChange`, live); return slider per investment type (`onChange`, live); status chips for baseline/adjusted; "Reset" button (disabled when no adjustments); wires `WhatIfChart`
- [x] T018 [P] Component tests for `WhatIf`: empty state; one slider per goal/instrument; baseline on-track by default with Reset disabled; live status update on slider drag; reset restores baseline
- [x] T019 Wire the "What If" tab into `src/pages/Planner/index.tsx` (rename 3rd tab label, swap `ScenarioComparison` import for `WhatIf`, drop the now-unneeded `dispatch`/`aggregatedSuggestions` props since the tab needs only `plannerData`)

**Checkpoint**: Full live slider → chart interaction works end-to-end in the UI

---

## Phase 5: Polish

- [x] T020 Full suite (`npx vitest run`), `tsc --noEmit`, and `npm run build` all clean

---

## Notes

- No new npm dependencies were introduced (`Slider` is existing MUI core).
- No persistence, no reducer actions, no `PlannerData` changes — this revision is deliberately
  smaller in surface area than the two prior designs on this branch.
- `research.md` documents both abandoned designs and why each was replaced; kept for the record.
