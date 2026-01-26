<!--
Sync Impact Report

- Version change: N/A (template) → 1.0.0
- Modified principles: N/A (template placeholders) → 5 concrete principles
- Added sections: Core Principles (filled), Frontend Architecture & Standards, Development Workflow & Quality Gates, Governance (filled)
- Removed sections: none (template structure preserved)
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ⚠ pending review: .specify/templates/spec-template.md (kept as-is; still compatible)
  - ⚠ pending review: .specify/templates/checklist-template.md (kept as-is; still compatible)
- Follow-up TODOs: none
-->

# Goal Based Financial Planner Constitution

## Core Principles

### I. Clear Layering (Domain → State → UI)
Business rules MUST live outside UI components.

- Domain logic MUST live in `src/domain/` (pure functions/types/constants) or
  “calculator”/derivation utilities in hooks or `src/util/`.
- UI components (`src/components/`, `src/pages/`) MUST stay presentational:
  no hidden business rules, no duplicated calculations, no hard-coded financial
  assumptions.
- Side effects (storage, time, randomness) MUST be isolated behind thin adapters
  (e.g., `src/util/storage.ts`) so they can be swapped/migrated later.

### II. Feature Co-location + Stable Shared Surface
Code organization MUST make change impact obvious and keep “shared” truly shared.

- Page-specific UI MUST live under `src/pages/<Page>/` (and may have its own
  `components/`, `hooks/`, `types.ts`, and tests).
- Shared, reusable UI primitives MUST live under `src/components/` and MUST NOT
  import from `src/pages/`.
- Shared domain concepts MUST live in `src/domain/` and MUST NOT depend on UI.

### III. Upgrade-Friendly Boundaries (No Vendor Lock-In by Default)
We optimize for dependency upgrades and refactors by preventing “deep coupling”.

- Imports from external libraries MUST go through public entry points only
  (no “deep imports” into internal paths).
- Any 3rd-party UI or charting component used widely MUST be wrapped behind a
  small local component (in `src/components/`) so replacements are localized.
- Cross-cutting configuration MUST be centralized (e.g., theme in `src/theme.ts`,
  app constants in `src/domain/constants.ts`) to avoid hunt-and-edit upgrades.

### IV. Type Safety and Explicit Contracts
TypeScript is a core maintainability tool; we treat “types as contracts”.

- New code MUST be typed; `any` MUST NOT be introduced unless unavoidable and
  MUST be justified inline with a short comment.
- Data shapes shared across pages/components MUST be defined in one place
  (`src/types/` or `src/domain/`) and imported, not re-declared.
- Public APIs between modules MUST be explicit (named exports, narrow surfaces),
  and accidental cross-module reach-through is disallowed.

### V. Predictable Change (Tests Where It Counts + Small, Reversible PRs)
We protect critical math and user journeys so upgrades don’t silently break behavior.

- Financial calculation logic MUST have unit tests (e.g., under
  `src/pages/Planner/hooks/*.test.ts` or colocated with the utility).
- UI tests are optional unless a feature spec requires them, but regressions in
  key flows MUST be prevented by at least one automated check (unit or smoke).
- Dependency upgrades MUST be done in focused PRs (one dependency family at a
  time when possible) with a short upgrade note in the PR description.

## Frontend Architecture & Standards

- **App type**: React + TypeScript, fully front-end (no backend services required).
- **State/data flow**: Prefer derived state over duplicated state; keep persistent
  state behind `src/util/storage.ts` (or a single dedicated module).
- **Styling**: Prefer centralized theming (`src/theme.ts`) and component-level
  styling patterns that don’t leak across pages.
- **Naming**:
  - Components: `PascalCase`
  - Hooks: `useThing`
  - Pure utilities: `camelCase`
  - Avoid ambiguous names like `helpers.ts` when a narrower name is possible.

## Development Workflow & Quality Gates

- **Before merge**, changes MUST:
  - build successfully (`npm run build`)
  - pass automated tests that exist for the touched area (`npm test` or
    `npm run test:cov` when appropriate)
  - be formatted consistently (Prettier is the source of truth)
- **PR scope**: Keep PRs small and reviewable; large refactors MUST be staged
  into a sequence of safe steps (move/rename → behavior changes → cleanup).

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

- This constitution is the top-level engineering agreement for this repository.
  If another document conflicts, this document wins.
- Amendments MUST include:
  - the problem being solved (why change governance)
  - what changes (principles/sections)
  - any migration steps required for existing code
- Versioning policy (for this document):
  - **MAJOR**: principle removals or redefinitions that change enforcement
  - **MINOR**: new principle/section or materially expanded enforcement
  - **PATCH**: clarifications, examples, or wording that doesn’t change intent
- Compliance expectations:
  - Feature plans MUST include a “Constitution Check” section that maps work to
    these principles and calls out any intentional violations (with rationale).
  - Reviews MUST reject changes that violate a principle unless the PR also
    includes an explicit constitution amendment.

**Version**: 1.0.0 | **Ratified**: 2026-01-26 | **Last Amended**: 2026-01-26
