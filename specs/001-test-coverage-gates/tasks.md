---

description: "Tasks for implementing Test Coverage Gates"
---

# Tasks: Test Coverage Gates

**Input**: Design documents from `specs/001-test-coverage-gates/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: REQUIRED (explicitly requested in the feature spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend-only React app**: `src/` at repository root with `src/pages/`, `src/components/`, `src/domain/`, `src/store/`, `src/util/`
- Tests are colocated under `src/` using CRA conventions:
  - `src/**/__tests__/**/*.{ts,tsx}`
  - `src/**/*.{spec,test}.{ts,tsx}`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish reliable test commands, coverage reporting, and CI gating.

- [x] T001 Audit current test baseline and test entry points (`src/setupTests.ts`, `package.json`, existing tests under `src/**`) and document gaps in `specs/001-test-coverage-gates/research.md`
- [x] T002 Add CI-friendly test scripts to `package.json` (e.g., `test:ci`, keep/update `test:cov` to be non-interactive)
- [x] T003 Configure Jest coverage gate in `package.json` (`jest.coverageThreshold` + `jest.coverageReporters`)
- [x] T004 Add/adjust coverage collection config in `package.json` (`jest.collectCoverageFrom`, `jest.coveragePathIgnorePatterns`) to avoid noisy files (d.ts, entrypoints) without hiding real logic
- [x] T005 Update GitHub Actions deploy workflow to run tests+coverage before deploy: `.github/workflows/deploy.yml`
- [x] T006 Create a CI workflow that runs on PRs/push to main and enforces coverage: `.github/workflows/ci.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Make tests deterministic and reduce flakiness across environments.

**⚠️ CRITICAL**: No broad test expansion until determinism utilities are in place (dates, locale, storage).

- [x] T007 Update `src/setupTests.ts` to reset/initialize deterministic globals for tests (e.g., stable locale, stable timezone assumptions, safe localStorage reset)
- [x] T008 [P] Add shared test helpers for deterministic date + locale + storage behavior in `src/testUtils/testEnv.ts`
- [x] T009 [P] Add shared helper for mocking “today” date with Day.js in `src/testUtils/mockDayjs.ts`
- [x] T010 Review and keep/adjust existing tests in `src/pages/Planner/hooks/investmentCalculator.utils.test.ts` (remove unused cases, ensure no flaky assertions)

**Checkpoint**: Foundation ready — new tests can be added in parallel without flakiness.

---

## Phase 3: User Story 1 - Prevent silent regressions (Priority: P1) 🎯 MVP

**Goal**: Unit tests validate core calculation and data/derivation logic without relying on UI rendering.

**Independent Test**: `npm run test:cov` passes and core calculation suites cover normal + boundary scenarios.

### Tests for User Story 1 (REQUIRED) ⚠️

> **NOTE: Prefer pure unit tests; avoid snapshotting as a proxy for business correctness.**

- [x] T011 [P] [US1] Add unit tests for `FinancialGoal` date/term logic in `src/domain/FinancialGoals.test.ts`
- [x] T012 [P] [US1] Add unit tests for inflation adjustment + rounding in `src/domain/FinancialGoals.test.ts`
- [x] T013 [P] [US1] Add unit tests for goal summaries and summary text formatting in `src/domain/PlannerData.test.ts`
- [x] T014 [P] [US1] Add unit tests for storage adapter behavior in `src/util/storage.test.ts`
- [x] T015 [P] [US1] Add unit tests for locale + number/currency formatting utilities in `src/types/util.test.ts`
- [x] T016 [P] [US1] Add unit tests for investment suggestion calculations in `src/pages/Planner/hooks/useInvestmentCalculator.test.ts`
- [x] T017 [P] [US1] Add reducer tests for initialization (empty/malformed/valid persisted state) in `src/store/plannerDataReducer.test.ts`
- [x] T018 [P] [US1] Add reducer tests for ADD/UPDATE/DELETE/UPDATE_FINANCIAL_GOAL flows in `src/store/plannerDataReducer.test.ts`
- [x] T019 [P] [US1] Add action creator tests (dispatch payload correctness) in `src/store/plannerDataActions.test.ts`

### Implementation for User Story 1

- [x] T020 [US1] If any production exports are required for testability, make the minimal non-behavioral change in the relevant file(s) and document why in the test (e.g., export a pure helper without changing runtime behavior)
- [x] T021 [US1] Ensure all new tests are colocated next to code under `src/` and follow naming conventions (`*.test.ts`, `*.test.tsx`)

**Checkpoint**: Core logic is protected; regressions in calculations/state/formatting are caught.

---

## Phase 4: User Story 2 - Catch unintended UI changes (Priority: P2)

**Goal**: Snapshot-style tests exist for stable UI surfaces where structural regressions matter.

**Independent Test**: `npm test` shows readable snapshot diffs when UI output changes.

### Tests for User Story 2 (REQUIRED)

- [x] T022 [P] [US2] Add snapshot test for StyledBox wrapper in `src/components/StyledBox/index.test.tsx`
- [x] T023 [P] [US2] Add snapshot + timer-driven behavior test for LiveCounter in `src/components/LiveNumberCounter/index.test.tsx`
- [x] T024 [P] [US2] Add snapshot test for `src/pages/LandingPage/index.tsx` in `src/pages/LandingPage/index.test.tsx` (keep it small and stable)
- [x] T025 [P] [US2] Add snapshot test for `src/pages/CongratulationsPage/index.tsx` in `src/pages/CongratulationsPage/index.test.tsx` (keep it small and stable)

### Implementation for User Story 2

- [x] T026 [US2] Ensure snapshot tests are deterministic (mock date/locale as needed; avoid including random IDs in snapshots)
- [x] T027 [US2] Remove or rewrite any snapshot tests that prove too noisy (large snapshots, frequent churn) and replace them with higher-signal assertions

**Checkpoint**: Selected stable UI areas are protected against unintended structural changes.

---

## Phase 5: User Story 3 - Enforce minimum coverage (Priority: P3)

**Goal**: Build/test fails when coverage falls below the configured minimum threshold.

**Independent Test**: Lowering coverage causes CI to fail with a clear message; meeting threshold passes.

### Tests/Automation for User Story 3 (REQUIRED)

- [x] T028 [P] [US3] Set initial global coverage thresholds in `package.json` (`jest.coverageThreshold`) consistent with `spec.md` assumptions
- [x] T029 [P] [US3] Ensure coverage reporting outputs are usable in CI (e.g., `text`, `lcov`, `json-summary`) via `package.json` Jest config
- [x] T030 [US3] Ensure coverage gate is exercised in CI by running `npm run test:cov` in `.github/workflows/ci.yml`
- [x] T031 [US3] Ensure deploy workflow blocks deploy on test/coverage failures by running `npm run test:cov` before `npm run deploy` in `.github/workflows/deploy.yml`

### Implementation for User Story 3

- [x] T032 [US3] Document how to run/interpret coverage locally in `README.md` and/or `specs/001-test-coverage-gates/quickstart.md`
- [x] T033 [US3] Validate that coverage enforcement is not bypassed by watch mode (CI runs must be non-interactive)

**Checkpoint**: Coverage cannot regress silently; CI enforces the agreed baseline.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Clean up, validate end-to-end, and reduce maintenance burden.

- [x] T034 [P] Remove unused/obsolete tests and snapshots (stale `*.snap`, skipped tests, dead suites) across `src/`
- [x] T035 [P] Standardize test utilities usage (date/locale/storage) to avoid duplicative mocks across test files
- [x] T036 Run `npm run test:cov` and `npm run build` locally and capture any follow-up fixes needed in `specs/001-test-coverage-gates/research.md`
- [x] T037 Confirm GitHub Actions CI + deploy workflows both pass on the branch after changes (`.github/workflows/ci.yml`, `.github/workflows/deploy.yml`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS large-scale test additions
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP (core correctness)
- **User Story 2 (Phase 4)**: Depends on Foundational — can proceed after US1 or in parallel once stable
- **User Story 3 (Phase 5)**: Depends on Setup (threshold config) and should follow once baseline tests exist
- **Polish (Phase 6)**: After all stories are implemented

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories
- **US2 (P2)**: Independent of US1, but should reuse deterministic test utilities from Phase 2
- **US3 (P3)**: Depends on a stable baseline test suite (US1/US2) to avoid failing the gate immediately

---

## Parallel Example: User Story 1

```bash
# These can be done in parallel after Phase 2:
Task: "Add unit tests for FinancialGoal in src/domain/FinancialGoals.test.ts"
Task: "Add reducer tests in src/store/plannerDataReducer.test.ts"
Task: "Add formatting tests in src/types/util.test.ts"
```

