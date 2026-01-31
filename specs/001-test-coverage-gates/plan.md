# Implementation Plan: Test Coverage Gates

**Branch**: `001-test-coverage-gates` | **Date**: 2026-01-26 | **Spec**: `specs/001-test-coverage-gates/spec.md`
**Input**: Feature specification from `specs/001-test-coverage-gates/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.cursor/commands/speckit.plan.md` for the execution workflow.

## Summary

Add broad unit and snapshot tests across the existing React/TypeScript codebase, remove unused tests,
and enforce a minimum coverage gate so CI/build fails when coverage drops below an agreed threshold.

Approach: use the existing Jest + React Testing Library setup provided by Create React App
(`react-scripts`) and configure coverage thresholds via supported Jest overrides in `package.json`
so we do not need to eject or refactor production code.

CI integration: ensure GitHub Actions runs the coverage test command before deploying.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript  
**Primary Dependencies**: React 18, Create React App (`react-scripts`), MUI  
**Storage**: Browser storage via `src/util/storage.ts` (no backend)  
**Testing**: Jest (via `react-scripts test`), React Testing Library, `@testing-library/jest-dom`  
**Target Platform**: Modern browsers (GitHub Pages deployment)  
**Project Type**: Frontend-only web app (single project)  
**Performance Goals**: Preserve interactive UX (no new heavy test-time dependencies that slow dev loops unnecessarily)  
**Constraints**: Do not refactor production behavior; avoid ejecting from Create React App; tests must be deterministic in CI  
**Scale/Scope**: Add tests across `src/` focusing on calculation logic, key hooks, and selected stable UI surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clear Layering (Domain → State → UI)**: tests for calculations MUST target domain/hooks logic directly
  (avoid snapshotting as a proxy for business correctness).
- **Feature Co-location**: new tests MUST be colocated near the code they validate under `src/`
  (e.g., `*.test.ts(x)` next to components/hooks).
- **Upgrade-Friendly Boundaries**: coverage gating MUST use supported CRA/Jest configuration
  (no eject; no deep Jest configuration hacks).
- **Type Safety and Explicit Contracts**: new tests MUST be typed; no `any` introduced to “make tests work”.
- **Predictable Change**: add/adjust tests in small, reviewable chunks; remove stale/unused tests instead of ignoring them.
- **No production refactors**: production code changes are only allowed when needed for testability without behavior change
  (e.g., exporting a pure helper) and must preserve outputs.

## Project Structure

### Documentation (this feature)

```text
specs/001-test-coverage-gates/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── pages/
├── components/
├── domain/
├── store/
├── util/
└── theme.ts

# Tests are colocated under src/ using CRA conventions:
src/**/__tests__/**/*.{ts,tsx}
src/**/*.{spec,test}.{ts,tsx}
src/setupTests.ts
```

**Structure Decision**: Frontend-only React app. Add tests colocated under `src/` using CRA test matching.

## Complexity Tracking

No constitution violations expected for this feature.
