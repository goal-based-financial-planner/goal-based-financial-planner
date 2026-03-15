# Tasks: Dependency and Build Tooling Upgrade

**Input**: Design documents from `/specs/006-upgrade-dependencies/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: No additional test tasks generated — this feature upgrades infrastructure; the existing test suite IS the regression guard. All tests must pass after each phase.

**Organization**: Tasks are grouped by PR (per constitution Principle V — focused, reversible PRs). US3 (build tooling, P3) is implemented before US1 (CVEs, P1) and US2 (React 19, P2) because the Vite migration is the mechanism that resolves the CVEs and is a prerequisite for the React 19 upgrade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1 = Security CVEs, US2 = React 19, US3 = Vite migration)

---

## Phase 1: Setup & Baseline

**Purpose**: Capture pre-migration baseline to validate acceptance criteria after each PR

- [X] T001 Record current build baseline by running `npm run build` and documenting output size and time
- [X] T002 [P] Run `npm audit` and document all current high/critical vulnerability findings as the US1 baseline
- [X] T003 [P] Scan `src/` for any `process.env.REACT_APP_*` references to confirm none exist before migration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared infrastructure changes needed — this is a build tooling replacement. Phase 1 baseline is the only prerequisite.

**⚠️ CRITICAL**: Phase 1 must be complete before Phase 3 begins (baseline needed for acceptance validation)

**Checkpoint**: Baseline captured — PR 1 (Vite migration) can now begin

---

## Phase 3: PR 1 — Build Tooling Migration (Priority: P3 delivers P1) 🎯 MVP

**Goal**: Replace `react-scripts` (CRA 5.0.1) with Vite 8.0.0 and Vitest. This PR simultaneously delivers US3 (modernised build tooling) and resolves US1 (all Dependabot CVEs are in CRA's transitive deps and are eliminated by removing `react-scripts`).

**Independent Test**: `npm run dev` starts on port 3000 with HMR, `npm run build` outputs to `dist/`, `npm run test:ci` passes all tests with coverage above thresholds, `npm audit` reports zero high/critical vulnerabilities.

> **Note on spec priority**: US3 is priority P3 in the spec but must be implemented first. It is the mechanism that resolves US1 (P1) — migrating away from CRA eliminates all CVEs embedded in CRA's dependency tree. US1 acceptance is verified at the end of this phase.

### Implementation for PR 1

- [X] T004 [US3] Update `package.json` — remove `react-scripts` from dependencies; add `vite@^8.0.0`, `@vitejs/plugin-react` to devDependencies; add `vitest`, `@vitest/coverage-v8`, `@testing-library/dom` to devDependencies; update scripts (`start`, `build`, `test`, `test:ci`, `test:cov`, `deploy`) per plan.md Implementation Notes
- [X] T005 [P] [US3] Create `vite.config.ts` at project root — configure `@vitejs/plugin-react` plugin, set `base: '/goal-based-financial-planner/'`, configure `test` block with `globals: true`, `environment: 'jsdom'`, `setupFiles: ['./src/setupTests.ts']`, and `coverage` with providers `v8`, reporters `['text','text-summary','lcov','json-summary']`, and thresholds matching existing Jest config (branches: 55, functions: 63, lines: 63, statements: 63)
- [X] T006 [P] [US3] Update `tsconfig.json` — change `moduleResolution` from `"node"` to `"bundler"`, change `target` from `"es5"` to `"ES2020"`, update `lib` to `["ES2020", "DOM", "DOM.Iterable"]`; add `"vite/client"` to `types` array; retain all existing strict flags
- [X] T007 [US3] Move `public/index.html` to project root `index.html` — remove all `%PUBLIC_URL%` placeholder references; add `<script type="module" src="/src/index.tsx"></script>` before `</body>`; verify all other asset links remain correct
- [X] T008 [P] [US3] Replace `src/react-app-env.d.ts` with `src/vite-env.d.ts` — add `/// <reference types="vite/client" />` and re-declare any custom module types that were in the original file (e.g., SVG imports in `src/declarations.d.ts` — check and consolidate if needed)
- [X] T009 [US3] Update `src/setupTests.ts` — replace `@testing-library/jest-dom` import with `@testing-library/jest-dom/vitest`; remove any CRA-specific globals that vitest provides automatically via `globals: true`
- [X] T010 [US3] Remove the `jest` configuration block from `package.json` (coverage thresholds, reporters, collectCoverageFrom, coveragePathIgnorePatterns are now in `vite.config.ts`); retain `eslintConfig`, `browserslist`, and `overrides` sections
- [X] T011 [P] [US3] Verify `.github/workflows/ci.yml` — confirm `npm run test:cov` still works (script name unchanged); confirm coverage artifact upload path `coverage/` is still correct for Vitest output; no changes expected but confirm explicitly
- [X] T012 [P] [US3] Verify `.github/workflows/deploy.yml` — confirm `npm run test:cov` and `npm run deploy` still work; no changes expected but note output dir is now `dist/` not `build/`
- [X] T013 [US3] Run `npm install` to install the updated dependency tree and confirm no install errors or unresolvable peer dependency conflicts
- [X] T014 [US3] Run `npm run dev` and confirm the development server starts without errors on port 3000 with hot module replacement active
- [X] T015 [US3] Run `npm run test:ci` and confirm all existing tests pass with Vitest; fix any Vitest-specific import or configuration issues surfaced (e.g., global type conflicts between `@testing-library/jest-dom` and Vitest)
- [X] T016 [US3] Run `npm run build` and confirm the production build completes without errors and outputs artefacts to `dist/`

### US1 Acceptance Verification (end of PR 1)

- [X] T017 [US1] Run `npm audit` and confirm zero high or critical severity vulnerabilities are reported — document the result as the US1 acceptance record

**Checkpoint**: PR 1 complete — US3 (build tooling) delivered, US1 (security CVEs) resolved. The application builds and tests on Vite with React 18. Ready for PR 2.

---

## Phase 4: PR 2 — React 18 → React 19 Upgrade (Priority: P2)

**Goal**: Upgrade React and all related packages from 18.3.1 to 19.2.4. Address all breaking changes. Replace `react-joyride` with a React 19-compatible fork. Fix TypeScript errors surfaced by stricter React 19 types.

**Independent Test**: `npm run build` completes without TypeScript errors, `npm run test:ci` passes all tests, manual navigation through Goals, Investments, and Dashboard screens shows no functional or visual regressions.

> **Dependency**: This phase REQUIRES Phase 3 (Vite migration, PR 1) to be merged first. React 19 is not compatible with CRA/react-scripts.

### Implementation for PR 2

- [X] T018 [US2] Update `package.json` — upgrade `react` to `^19.2.4`; upgrade `react-dom` to `^19.2.4`; upgrade `@types/react` to `^19.0.0`; upgrade `@types/react-dom` to `^19.0.0`; remove `react-joyride`; add `@adi-prasetyo/react-joyride` (API-identical React 19 fork)
- [X] T019 [US2] Remove the `overrides` block from `package.json` (the `react-progressbar-semicircle` override pinned React 18 — verify this package supports React 19 natively; if not, document the issue and either replace or add a new React 19-compatible override)
- [X] T020 [US2] Run `npm install` to install the React 19 dependency tree; resolve any peer dependency warnings
- [X] T021 [US2] Run the React 19 codemod `npx codemod@latest react/19/migration-recipe` in the project root to automatically fix routine React 18 → 19 breaking changes in `src/` (no patterns found — source already compatible)
- [X] T022 [P] [US2] Audit all `useRef()` calls in `src/` that lack an initial argument — add `null` (for DOM refs) or `undefined` (for mutable refs) as the required argument per React 19's stricter `useRef` signature (none found)
- [X] T023 [P] [US2] Update all imports of `react-joyride` across `src/` to import from `@adi-prasetyo/react-joyride` — API is identical, no prop or usage changes needed
- [X] T024 [US2] Verify `src/index.tsx` uses `ReactDOM.createRoot()` (expected from React 18 setup); if `ReactDOM.render()` is found, replace with `createRoot` pattern (already using createRoot)
- [X] T025 [US2] Run `npx tsc --noEmit` to surface all TypeScript errors introduced by React 19's stricter types (e.g., `ReactElement` props defaulting to `unknown`); fix all errors without introducing `any` — use explicit typing or type assertions with comments per constitution Principle IV (zero errors)
- [X] T026 [US2] Run `npm run test:ci` with React 19 and fix any test failures caused by React 19 API changes (e.g., event handling changes, act() wrapper changes in testing-library); preserve existing test intent and coverage level (37/37 files, 399/399 tests)
- [X] T027 [US2] Run `npm run build` with React 19 and confirm production build completes without TypeScript or bundler errors
- [ ] T028 [US2] Manual smoke test — open the app in a browser via `npm run dev`, navigate through: (1) Goals/Planner tab, (2) Investment tracking tab, (3) Dashboard, (4) Onboarding tour (react-joyride replacement), (5) Any confetti animations (react-confetti) — confirm no visual or functional regressions
- [X] T029 [US2] Run `npm audit` to confirm still zero high/critical vulnerabilities after React 19 dependency additions

**Checkpoint**: PR 2 complete — US2 (React 19 upgrade) delivered. All three user stories are now satisfied. Ready for final polish.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, deployment verification, and documentation completeness

- [ ] T030 [P] Verify `npm run deploy` works end-to-end locally (produces `dist/`, pushes to gh-pages); update `deploy` script output dir reference in any documentation that mentions `build/`
- [ ] T031 [P] Confirm `.eslintrc` / ESLint config still resolves correctly under Vite — run `npm run lint` and fix any path resolution issues caused by the `moduleResolution: bundler` change
- [X] T032 Run full `npm run test:cov` and confirm all coverage thresholds are met (branches ≥ 55%, functions/lines/statements ≥ 63%); address any coverage regressions (statements 68.74%, branches 92.68%, functions 83.46%, lines 68.74% — all pass)
- [ ] T033 [P] Update `specs/006-upgrade-dependencies/checklists/requirements.md` — mark all success criteria (SC-001 through SC-006) as verified with evidence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion
- **PR 1 / US3+US1 (Phase 3)**: Depends on Phase 1 baseline — BLOCKS Phase 4
- **PR 2 / US2 (Phase 4)**: Depends on Phase 3 completion and merge — CRA must be removed before React 19 upgrade
- **Polish (Phase 5)**: Depends on Phase 4 completion

### User Story Dependencies

> **Important**: Implementation order differs from spec priority order due to technical constraints.

| Story | Spec Priority | Implementation Order | Reason |
|-------|--------------|---------------------|--------|
| US3 (Vite migration) | P3 | 1st | Must happen first; CVE resolution is a side effect |
| US1 (CVEs resolved) | P1 | Verified after US3 | CVEs live in CRA's deps; removing CRA IS the fix |
| US2 (React 19) | P2 | 2nd | Requires Vite to be the build tool first |

### Within Each PR

- T004–T012 in Phase 3 can largely run in parallel (different files) — see [P] markers
- T018–T024 in Phase 4 can largely run in parallel — see [P] markers
- T025 (TypeScript audit) depends on T020–T024 being complete
- T026 (test:ci) depends on T025 (TypeScript errors fixed)

### Parallel Opportunities

```bash
# Phase 3 — can run in parallel (different files):
Task T005: Create vite.config.ts
Task T006: Update tsconfig.json
Task T008: Create src/vite-env.d.ts
Task T011: Verify .github/workflows/ci.yml
Task T012: Verify .github/workflows/deploy.yml

# Phase 4 — can run in parallel:
Task T022: Fix useRef() calls across src/
Task T023: Update react-joyride imports across src/
Task T024: Verify src/index.tsx createRoot usage
```

---

## Implementation Strategy

### MVP First (US3 + US1 via PR 1 Only)

1. Complete Phase 1: Baseline capture
2. Complete Phase 3: CRA → Vite migration (PR 1)
3. **STOP and VALIDATE at T017**: Run `npm audit` — US1 (zero CVEs) is delivered
4. Merge PR 1 — security posture immediately improved

### Incremental Delivery

1. Phase 1 → Phase 3 → Merge PR 1: US3 delivered, US1 resolved (highest risk items cleared)
2. Phase 4 → Merge PR 2: US2 delivered (React 19 upgrade)
3. Phase 5: Final polish and deployment verification

### Single Developer Sequence

1. Phase 1 (T001–T003) — 15 min
2. Phase 3 (T004–T017) — PR 1: ~2–3 hours
3. Phase 4 (T018–T029) — PR 2: ~2–3 hours
4. Phase 5 (T030–T033) — 30 min

---

## Notes

- [P] tasks = different files, no task-level dependencies — safe to parallelize
- All tests must pass before committing each task group — the existing test suite is the regression guard
- If a test fails after an upgrade step, fix it before proceeding to the next task
- `react-use` compatibility with React 19 is unconfirmed — monitor for runtime warnings during T028 smoke test and replace individual hooks inline if needed
- `react-progressbar-semicircle` compatibility with React 19 must be verified at T019 — if incompatible, the override must be updated or the package replaced
- After merging PR 1, Dependabot should auto-close all previously flagged CVE alerts — verify this in the GitHub security tab
