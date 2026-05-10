# Tasks: Onboarding Wizard

**Input**: Design documents from `/specs/012-onboarding-wizard/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Directory Structure)

**Purpose**: Create the file skeleton so all subsequent tasks have concrete targets.

- [x] T001 Create `src/pages/LandingPage/components/OnboardingWizard/` directory with empty index files: `index.tsx`, `useOnboardingWizard.ts`, and `steps/` subdirectory with `WelcomeStep.tsx`, `ConceptsStep.tsx`, `PathChoiceStep.tsx`, `StoragePickerStep.tsx`, `CreateGoalStep.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state infrastructure that ALL user stories depend on. No story work begins until this phase is complete.

**⚠️ CRITICAL**: Phases 3–6 are blocked until this phase is complete.

- [x] T00X Add `isOnboardingComplete()` and `setOnboardingComplete()` exports to `src/util/legacyStorage.ts` using key `'onboardingComplete'`, following the exact same pattern as existing `isTourTaken` / `setTourTaken` functions
- [x] T00X [P] Add unit tests for `isOnboardingComplete` and `setOnboardingComplete` in `src/util/legacyStorage.test.ts` — verify: default returns false when key absent, returns true after setOnboardingComplete, persists across calls
- [x] T00X Implement `useOnboardingWizard.ts` hook in `src/pages/LandingPage/components/OnboardingWizard/useOnboardingWizard.ts` with the full interface from `contracts/README.md`: `currentStep`, `path`, `totalSteps`, `canGoBack`, `goNext`, `goBack`, `skip`, `choosePath`, `handleStorageSelected`, `handleGoalCreated` — `totalSteps` is 5 for `path='new'`, 3 for `path='open'`, null path defaults to 3
- [x] T00X [P] Add unit tests for `useOnboardingWizard.ts` in `src/pages/LandingPage/components/OnboardingWizard/useOnboardingWizard.test.ts` covering: step 1 has no back, goNext/goBack transitions, choosePath sets path and advances to step 4, skip at any step, handleGoalCreated, totalSteps correct for each path
- [x] T00X Implement `OnboardingWizard/index.tsx` wizard shell in `src/pages/LandingPage/components/OnboardingWizard/index.tsx` — MUI `Dialog` with `fullWidth maxWidth="sm"`, uses `useOnboardingWizard` hook, renders active step component, shows `"Step X of Y"` progress label in header, Skip button always visible in header, Back/Next footer buttons (Back hidden on step 1, footer hidden on step 3), `onClose` prop wired to `skip()` so Escape triggers Skip; accepts `OnboardingWizardProps` from contracts/README.md

**Checkpoint**: `useOnboardingWizard` hook is fully unit-tested and the wizard shell renders with dummy step content before any step components exist.

---

## Phase 3: User Story 1 — Complete wizard end-to-end (new plan path) (Priority: P1) 🎯 MVP

**Goal**: A first-time user can open the app, go through all 5 wizard steps (new plan path), create their first goal, and reach the Planner with Joyride firing.

**Independent Test**: Clear `localStorage.removeItem('onboardingComplete')`, visit the app, complete all 5 steps with a valid goal — confirm Planner renders and Joyride fires. Confirm `localStorage.getItem('onboardingComplete') === 'true'`.

- [x] T00X [P] [US1] Implement `WelcomeStep.tsx` in `src/pages/LandingPage/components/OnboardingWizard/steps/WelcomeStep.tsx` — headline "Plan your financial future, goal by goal", 3–4 benefit bullets (e.g. "Define goals by timeline", "Get investment allocation suggestions", "Track progress over time"), no interactive form elements; stateless presentational component receiving no props
- [x] T00X [P] [US1] Implement `ConceptsStep.tsx` in `src/pages/LandingPage/components/OnboardingWizard/steps/ConceptsStep.tsx` — explain short/medium/long-term goal categories with brief examples and timeline ranges; explain that the app suggests equity/debt/gold allocations based on term length; icon + text layout using MUI `Box`, `Typography`, `Stack`; stateless presentational component
- [x] T00X [US1] Implement `PathChoiceStep.tsx` in `src/pages/LandingPage/components/OnboardingWizard/steps/PathChoiceStep.tsx` — two large clickable MUI `Card` components: "Create a new plan" and "Open existing plan"; clicking either calls `choosePath(p)` from props immediately (no separate Next button on this step); hide wizard footer nav when this step is active (wizard shell checks `currentStep === 3` to suppress footer)
- [x] T0XX [US1] Implement `StoragePickerStep.tsx` in `src/pages/LandingPage/components/OnboardingWizard/steps/StoragePickerStep.tsx` — shows storage options (local file, Google Drive) using the existing `StorageProviderPicker` component or inline equivalent; for Google Drive selection: show an inline `TextField` for plan name before proceeding (handles the plan-name flow that LandingPage currently does via a separate Dialog); on selection, calls `initProvider(type, 'new', name?)` then on success calls `handleStorageSelected()`; shows `CircularProgress` during initialization; shows inline error with retry on failure
- [x] T0XX [US1] Implement `CreateGoalStep.tsx` in `src/pages/LandingPage/components/OnboardingWizard/steps/CreateGoalStep.tsx` — renders `FinancialGoalForm` directly (not wrapped in another Dialog — the wizard Dialog is already the container); pass `close` prop wired to `handleGoalCreated(onComplete)` which dispatches `addFinancialGoal` then calls `onComplete`; pass `dispatch` from wizard props; pass `title="Add your first goal"`
- [x] T0XX [US1] Integrate `OnboardingWizard` into `src/pages/LandingPage/index.tsx` — add `const [showWizard, setShowWizard] = useState(!isOnboardingComplete())` on mount; render `<OnboardingWizard initProvider={initProvider} dispatch={dispatch} onComplete={() => setShowWizard(false)} />` when `showWizard === true`; ensure the existing `isFormOpen` / AddGoalPopup code path is NOT triggered when wizard completes (wizard handles goal creation directly — no change to AddGoalPopup needed, just ensure `isFormOpen` starts `false` and is only set by the non-wizard code path)
- [x] T0XX [US1] Wire Joyride firing after wizard completion in `src/pages/LandingPage/components/OnboardingWizard/index.tsx` — after `handleGoalCreated` marks onboarding complete and `onComplete()` is called, the Planner renders (because `plannerData.financialGoals.length > 0`) and the existing `PageTour` component fires naturally; verify by tracing: wizard creates goal → `dispatch(addFinancialGoal)` → `Home` re-renders → shows `Planner` → `PageTour` mounts → checks `isTourTaken()` → fires if not taken (no code change needed here — document this as a verification step)

**Checkpoint**: Full new-plan wizard flow works end-to-end. Planner loads after wizard completion. Joyride fires.

---

## Phase 4: User Story 2 — Skip at any step (Priority: P2)

**Goal**: A user can click Skip on any wizard step (or press Escape) and the wizard closes, onboarding is marked complete, and the landing page becomes interactive.

**Independent Test**: Clear `onboardingComplete`, open wizard, click Skip on step 2 — wizard closes, `localStorage.getItem('onboardingComplete') === 'true'`, landing page is visible, refreshing does not re-show wizard.

- [x] T014 [US2] Verify Skip button in wizard shell (`OnboardingWizard/index.tsx`) calls `skip()` from hook which calls `setOnboardingComplete()` then `onComplete()` — confirm Skip is present on ALL steps including step 3 (PathChoiceStep) where the footer is hidden but the header Skip button remains; add an explicit check that the header Skip button is rendered independently of footer visibility
- [x] T015 [US2] Ensure post-skip state in `src/pages/LandingPage/index.tsx` — after `onComplete()` sets `showWizard(false)`, the user sees the normal landing page content (the existing "NEW PLAN" / "Open existing plan" buttons); confirm no AddGoalPopup opens automatically on skip; confirm `isFormOpen` remains false
- [x] T016 [US2] Handle Escape key Skip: confirm `Dialog`'s `onClose` is wired to `skip()` in `src/pages/LandingPage/components/OnboardingWizard/index.tsx` and does NOT call the default MUI close behavior that would close without marking complete

**Checkpoint**: Skip from any step correctly closes the wizard, marks onboarding complete, and leaves the user on the landing page.

---

## Phase 5: User Story 3 — Back navigation (Priority: P3)

**Goal**: A user can navigate backward through the wizard without losing data, and the Back button is absent on step 1.

**Independent Test**: Reach step 2, click Back — step 1 shown. Reach step 5, click Back — step 4 shown with previously chosen storage provider still selected. Confirm step 1 has no Back button.

- [x] T017 [US3] Hide Back button on step 1: in `OnboardingWizard/index.tsx`, render footer Back button only when `canGoBack === true` (hook returns `canGoBack = currentStep > 1`) — already handled by hook in T004/T006, but explicitly verify the footer renders correctly on step 1
- [x] T018 [US3] Preserve `StoragePickerStep` selection on back navigation — lift selected storage provider type and plan name (Drive only) into wizard shell state in `OnboardingWizard/index.tsx` so that when user goes back from step 5 to step 4, the previously chosen provider is pre-selected in `StoragePickerStep.tsx`; pass these as props to `StoragePickerStep`
- [x] T019 [US3] Preserve `CreateGoalStep` partial form data on back navigation — lift goal form field values into wizard shell state in `OnboardingWizard/index.tsx` and pass as `defaultValues` to `CreateGoalStep.tsx` / `FinancialGoalForm` so that returning to step 5 does not lose entered data

**Checkpoint**: Back navigation works correctly across all steps with state preserved.

---

## Phase 6: User Story 4 — Returning user never sees wizard (Priority: P4)

**Goal**: A user who has completed or skipped onboarding never sees the wizard again, regardless of how they enter the app.

**Independent Test**: Set `localStorage.setItem('onboardingComplete', 'true')`, refresh — landing page appears with no wizard. Click "NEW PLAN" — normal storage picker flow, no wizard.

- [x] T020 [US4] Confirm `isOnboardingComplete()` is read once at `LandingPage` initialization (not on every render) via `useState(!isOnboardingComplete())` in `src/pages/LandingPage/index.tsx` — this means the check fires only on mount; returning users with the flag set see `showWizard = false` from the start and the wizard Dialog is never mounted

**Checkpoint**: No wizard rendered for returning users. Normal "NEW PLAN" flow is unchanged.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, mobile responsiveness, and final validation.

- [x] T021 [P] Add responsive full-screen behavior on mobile in `src/pages/LandingPage/components/OnboardingWizard/index.tsx` — use `useMediaQuery(theme.breakpoints.down('sm'))` and pass `fullScreen` to MUI Dialog on small screens; ensure all step content scrolls vertically rather than overflowing
- [x] T022 [P] Accessibility audit in `src/pages/LandingPage/components/OnboardingWizard/index.tsx` — confirm MUI Dialog's built-in focus trap is active (no `disableEnforceFocus`); add `aria-label` to the Dialog; ensure Skip, Back, Next buttons have descriptive `aria-label` attributes; verify Tab order flows: Skip → step content → Back → Next
- [x] T023 Add the "open existing plan" post-wizard flow — in `OnboardingWizard/index.tsx`, when `choosePath('open')` is called on step 3, call `setOnboardingComplete()`, then call `onComplete()`, then in `LandingPage/index.tsx` the `onComplete` handler must trigger the existing open-plan flow by calling `setPickerMode('open')` (or equivalent) — thread necessary state/callback through `OnboardingWizardProps` or handle via a separate `onChooseOpen` prop
- [x] T024 [P] Run all quickstart.md manual validation scenarios and confirm each scenario produces the expected result; document any deviations
- [x] T025 [P] Ensure `npm run build` passes with no TypeScript errors after all wizard files are created

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — primary MVP deliverable
- **US2 (Phase 4)**: Depends on Phase 2 (uses wizard shell from T006); can run in parallel with US1 if T006 is complete
- **US3 (Phase 5)**: Depends on Phase 3 (T010, T011 must exist for back-nav state tests to be meaningful)
- **US4 (Phase 6)**: Depends on T002 and T012 only — very lightweight
- **Polish (Phase 7)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Foundational complete → start
- **US2 (P2)**: T006 complete → start (parallel with US1 if T006 done)
- **US3 (P3)**: T010 + T011 complete → start
- **US4 (P4)**: T002 + T012 complete → start (can start very early)

### Within Each User Story

- T007, T008 are always parallelizable (different files, no shared deps)
- T009 depends on `choosePath` in hook (T004)
- T010 depends on T009 (path must be set before storage step renders)
- T011 depends on T010 (goal step only renders after storage initialized)
- T012 depends on T006 (shell must exist to embed in LandingPage)

---

## Parallel Execution Examples

### Phase 2 (Foundational)

```text
Parallel:
  T003 — legacyStorage tests
  T005 — useOnboardingWizard tests

Sequential:
  T002 → T003 (tests after implementation)
  T004 → T005 (tests after implementation)
  T004 → T006 (shell depends on hook)
```

### Phase 3 (US1)

```text
Parallel:
  T007 — WelcomeStep
  T008 — ConceptsStep

Sequential:
  T009 → T010 → T011 (path → storage → goal)
  T006 → T012 (shell → LandingPage integration)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — run T003/T005 tests in parallel with T002/T004
3. Complete Phase 3 (US1) — T007/T008 in parallel, then T009 → T010 → T011 → T012 → T013
4. **STOP and VALIDATE**: Full new-plan wizard works, Planner loads, Joyride fires
5. Ship MVP if sufficient

### Incremental Delivery

1. Setup + Foundational → storage utility + hook fully tested
2. Add US1 (Phase 3) → complete first-time new-plan flow → **MVP**
3. Add US2 (Phase 4) → skip behavior polished
4. Add US3 (Phase 5) → back navigation + state preservation
5. Add US4 (Phase 6) → returning user guard (very small — 1 task)
6. Polish (Phase 7) → accessibility + mobile + open-plan path

### Parallel Team Strategy

With two developers after Phase 2:
- Dev A: US1 (T007 → T013)
- Dev B: US2 (T014 → T016) + US4 (T020) in parallel

---

## Notes

- [P] tasks operate on different files and have no in-flight dependencies
- Each user story is independently completable and testable per its checkpoint
- The Google Drive plan-name flow (T010) is the highest-complexity task — it must replicate the `pendingDriveProvider` Dialog behavior inline within `StoragePickerStep`
- T013 is a verification task (no code change expected) — trace the existing Joyride firing to confirm it works post-wizard
- T023 (open-plan post-wizard flow) may require adding an `onChooseOpen` prop to `OnboardingWizardProps` — update `contracts/README.md` if so
- Commit after each phase checkpoint at minimum
