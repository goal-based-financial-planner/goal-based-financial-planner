# Implementation Plan: Codebase Architecture Refactor for Constitution Compliance

**Branch**: `002-codebase-architecture-refactor` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-codebase-architecture-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.cursor/commands/speckit.plan.md` for the execution workflow.

## Summary

This refactoring initiative restructures the codebase to achieve full compliance with the constitution (v1.0.0). The primary goals are: (1) establish clear layering between domain logic, state management, and UI presentation; (2) enforce proper file co-location with stable shared boundaries; (3) create upgrade-friendly patterns that prevent vendor lock-in; (4) improve type safety and explicit contracts across modules; and (5) ensure predictable changes through comprehensive testing and small, reversible PRs.

The refactor follows a "strangler fig" pattern to minimize risk: new properly-structured code is introduced alongside existing code, functionality is migrated incrementally, and old code is removed only when fully replaced and validated. Success is measured by developer productivity metrics (navigation time, upgrade safety, code review speed) and technical quality gates (test coverage, build stability, zero cross-layer violations).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled), targeting ES5 with modern library support  
**Primary Dependencies**: React 18.3.1, Material-UI 6.1.7 (components, icons, charts, date pickers), React Hook Form 7.53.2, dayjs 1.11.13, react-joyride 2.9.3  
**Storage**: Browser localStorage (via `src/util/storage.ts` adapter)  
**Testing**: Jest + React Testing Library (@testing-library/react 16.0.1), coverage thresholds: 63% lines/functions/statements, 55% branches  
**Target Platform**: Modern browsers (>0.2% usage, not dead, not op_mini), deployed as GitHub Pages static site, no backend services  
**Project Type**: Single-page application (SPA) with client-side routing and state management  
**Performance Goals**: Sub-100ms interaction response, 60fps animations, <3s initial load, support 1000+ financial goals in calculations  
**Constraints**: Zero backend dependencies (fully client-side), localStorage for persistence, must maintain existing feature functionality during refactor  
**Scale/Scope**: ~50 components, 6 domain modules, 3 main pages (Landing, Home, Planner), ~3,500 lines of source code (excluding tests)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Clear Layering (Domain → State → UI)

**Current State Analysis**:
- ✅ **Domain layer exists**: `src/domain/` contains pure functions for financial calculations, goal validation, investment allocations
- ⚠️ **Partial compliance**: Some business logic may exist in hooks (`src/pages/Planner/hooks/`) - needs audit to determine if these are pure derivations or contain hidden business rules
- ✅ **Side effects isolated**: `src/util/storage.ts` exists as an adapter for localStorage
- ❌ **UI presentational purity**: Need to verify components in `src/pages/*/components/` don't contain hard-coded financial assumptions or duplicated calculations

**Refactor Alignment**:
- FR-001, FR-004: Audit and extract any business logic from UI components and hooks to `src/domain/`
- FR-005: Verify all side effects go through adapters; add time/random adapters if needed
- User Story 3 directly validates this principle with measurable test (zero component changes for domain updates)

**Gate Status**: ⚠️ **Conditional Pass** - Existing structure is mostly compliant; refactor will achieve full compliance

---

### Principle II: Feature Co-location + Stable Shared Surface

**Current State Analysis**:
- ✅ **Page-specific co-location**: Home page has `src/pages/Home/components/` (AddGoalPopup, DisclaimerDialog, FinancialGoalForm)
- ✅ **Page-specific co-location**: Planner page has extensive `src/pages/Planner/components/` and `src/pages/Planner/hooks/`
- ✅ **Shared primitives isolated**: `src/components/` contains only 2 components (LiveNumberCounter, StyledBox) - appears to be truly shared
- ❌ **Import direction enforcement**: Need to verify shared components don't import from pages (no automated check currently)
- ⚠️ **Domain isolation**: Need to verify `src/domain/` has zero UI dependencies

**Refactor Alignment**:
- FR-002: Enforce page-specific components stay under their page (already structured correctly)
- FR-003: Verify and enforce shared components don't import from pages
- FR-009, FR-010: Type definitions should be in `src/types/` or `src/domain/`, not redeclared per-component
- User Story 1 validates this with 2-minute navigation test

**Gate Status**: ✅ **Pass** - Current structure already follows this principle; refactor will add enforcement

---

### Principle III: Upgrade-Friendly Boundaries (No Vendor Lock-In)

**Current State Analysis**:
- ❌ **Deep imports**: Need to audit for imports like `@mui/material/internal/*` or similar
- ❌ **Third-party wrapping**: Material-UI components (charts, date pickers) are likely used directly throughout the app without local wrappers
- ✅ **Centralized config**: `src/theme.ts` exists for theming
- ✅ **Domain constants**: `src/domain/constants.ts` exists
- ⚠️ **Chart library isolation**: `@mui/x-charts` used in multiple page components - likely not wrapped

**Refactor Alignment**:
- FR-006: Audit and eliminate deep imports; wrap in local adapters if unavoidable
- FR-007: Wrap MUI chart components (PieChart, DoughnutChart, BarChart) in `src/components/`
- FR-008: Ensure all configuration is centralized (already mostly done)
- User Stories 2 & 6 validate upgrade safety with zero breaking changes on React/library upgrades

**Gate Status**: ❌ **Fail** - Third-party components not wrapped; must be addressed in refactor

---

### Principle IV: Type Safety and Explicit Contracts

**Current State Analysis**:
- ✅ **TypeScript strict mode**: `tsconfig.json` has `"strict": true`
- ✅ **Shared types**: `src/types/` directory exists (util.ts, constants.ts, enums.ts)
- ⚠️ **Type redeclaration**: Need to audit for duplicated interfaces across components
- ⚠️ **Any usage**: Need to grep for `any` types and verify they're justified
- ✅ **Domain types**: Domain modules export types alongside functions

**Refactor Alignment**:
- FR-009: Audit and eliminate unjustified `any` types
- FR-010: Consolidate any redeclared data shapes to single source in `src/types/` or `src/domain/`
- User Story 5 validates with clear guidelines on where types belong

**Gate Status**: ✅ **Pass** - Infrastructure is sound; refactor will improve consistency

---

### Principle V: Predictable Change (Tests Where It Counts + Small PRs)

**Current State Analysis**:
- ✅ **Domain tests**: All domain modules have colocated `.test.ts` files
- ✅ **UI tests**: Page components and many page-specific components have tests with snapshots
- ⚠️ **Coverage thresholds**: Current 63% line coverage is below 90% target for financial calculations
- ✅ **CI setup**: `.github/workflows/ci.yml` exists for automated testing
- ⚠️ **PR strategy**: Need to enforce small, staged refactoring PRs (currently no automated size check)

**Refactor Alignment**:
- FR-013: Increase test coverage for financial calculations to 90%
- FR-015: Maintain or improve coverage during refactor (no regression)
- FR-018, FR-019: All builds and tests must pass after each refactor stage
- FR-020: Stage refactor in sequence: move/rename → behavior changes → cleanup
- User Story 4 validates with performance regression prevention

**Gate Status**: ⚠️ **Conditional Pass** - Good foundation; refactor will improve coverage and enforce PR patterns

---

### Overall Constitution Compliance

**Summary**: 2 passes, 3 conditional passes, 1 fail

**Critical Blocker**: Principle III violation (third-party components not wrapped) must be addressed.

**Refactor Strategy**:
1. **Phase 1**: Audit and document violations (deep imports, unwrapped components, type redeclarations)
2. **Phase 2**: Create wrapper components for MUI charts and other third-party UI
3. **Phase 3**: Extract business logic from UI/hooks to domain layer
4. **Phase 4**: Increase test coverage to 90% for domain calculations
5. **Phase 5**: Add automated linting for cross-layer violations

**Re-check Post-Design**: After Phase 1 (design artifacts), re-evaluate compliance and update this section.

---

### Post-Design Re-evaluation (Phase 1 Complete)

**Status**: All design artifacts completed (research.md, data-model.md, contracts/README.md, quickstart.md)

#### Updated Compliance Assessment

**Principle I: Clear Layering** ✅ **PASS**
- Research identified business logic in hooks → Contract 1 defines extraction plan
- `investmentCalculator.utils.ts` → `src/domain/investmentCalculations.ts`
- Hook refactored to orchestrate domain functions only
- Path to compliance: Clear and executable

**Principle II: Feature Co-location** ✅ **PASS**
- Current structure already compliant
- Contract 6 adds automated enforcement via ESLint boundaries plugin
- Type consolidation (Contract 3) strengthens shared surface stability

**Principle III: Upgrade-Friendly Boundaries** ✅ **PASS** (with mitigation)
- DatePicker wrapper defined in Contract 2
- Chart components already wrapped (verified in research)
- Deep import for AdapterDayjs documented as acceptable exception
- Path to compliance: Wrapper implementation planned for PR 4

**Principle IV: Type Safety** ✅ **PASS**
- New type files defined in data-model.md: `planner.ts`, `charts.ts`, `goals.ts`
- Contract 3 specifies removal of all unjustified `any` types
- Type consolidation eliminates duplicates and inconsistencies
- Path to compliance: Type files and replacements in PRs 1-3

**Principle V: Predictable Change** ✅ **PASS**
- Contract 7 ensures test coverage maintained/improved
- Contract 8 defines 7-PR sequence following move → change → cleanup pattern
- Performance contract (Contract 4) includes profiling validation
- Path to compliance: Staged execution per contract sequence

**Summary**: 5 of 5 principles have clear paths to compliance. The critical blocker (Principle III violation for unwrapped components) is resolved with DatePicker wrapper contract. All contracts are executable and verifiable.

**Ready for Phase 2**: ✅ Tasks can now be created with confidence that design supports full constitution compliance.

## Project Structure

### Documentation (this feature)

```text
specs/002-codebase-architecture-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── README.md        # Refactoring contracts (not API endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── pages/                      # Page-level components and routing
│   ├── LandingPage/           # Landing page (standalone)
│   │   ├── index.tsx
│   │   └── index.test.tsx
│   ├── Home/                  # Home page with goal management
│   │   ├── components/        # Page-specific UI
│   │   │   ├── AddGoalPopup/
│   │   │   ├── DisclaimerDialog/
│   │   │   └── FinancialGoalForm/
│   │   ├── index.tsx
│   │   └── index.test.tsx
│   └── Planner/               # Main planner page with calculations
│       ├── components/        # Page-specific UI (11 components)
│       │   ├── CustomLegend/
│       │   ├── GoalBox/
│       │   ├── GoalCard/
│       │   ├── InvestmentAllocations/
│       │   ├── InvestmentPieChart/
│       │   ├── InvestmentSuggestions/
│       │   ├── InvestmentSuggestionsDoughnutChart/
│       │   ├── Pagetour/
│       │   ├── RecurringGoalsTable/
│       │   ├── TargetBox/
│       │   └── TermwiseProgressBox/
│       ├── hooks/             # Page-specific hooks
│       │   ├── useInvestmentCalculator.ts
│       │   └── investmentCalculator.utils.ts
│       └── index.tsx
├── components/                # Shared, reusable UI primitives
│   ├── LiveNumberCounter/     # Animated number counter
│   └── StyledBox/             # Styled container primitive
├── domain/                    # Pure business logic (no React/UI)
│   ├── FinancialGoals.ts      # Goal validation and rules
│   ├── investmentAllocations.ts  # Asset allocation calculations
│   ├── InvestmentOptions.ts   # Investment product definitions
│   ├── PlannerData.ts         # Planner state shape and validation
│   ├── constants.ts           # Domain constants (risk levels, terms)
│   └── *.test.ts              # Colocated unit tests
├── store/                     # State management (reducers, actions)
│   ├── plannerDataReducer.ts
│   └── plannerDataActions.ts
├── util/                      # Side effect adapters and utilities
│   └── storage.ts             # localStorage adapter
├── types/                     # Shared TypeScript definitions
│   ├── util.ts                # Utility types
│   ├── constants.ts           # Type-level constants
│   └── enums.ts               # Shared enums
├── theme.ts                   # Centralized Material-UI theme
├── App.tsx                    # Root application component
└── index.tsx                  # Application entry point
```

**Structure Decision**: Frontend-only React SPA with clear separation between pages (user journeys), components (reusable UI), domain (business logic), and infrastructure (store, util, types). This structure already aligns well with the constitution; refactoring will strengthen boundaries and add enforcement mechanisms without major reorganization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Third-party MUI components used directly | Historical: app built before constitution, wrapping wasn't prioritized | Direct usage was expedient for MVP; now causes upgrade fragility as seen with `react-progressbar-semicircle` override in package.json |
| Business logic potentially in `Planner/hooks/` | Hooks may contain derived calculations that belong in domain layer | Unclear at time of creation whether calculation utils belonged in hooks vs domain; needs audit to determine extraction scope |

**Mitigation Plan**:
1. Wrap all MUI chart components in `src/components/` (FR-007) - estimated 3 wrapper components
2. Audit `Planner/hooks/investmentCalculator.utils.ts` to determine if pure (belongs in `src/domain/`) or impure (needs adapter)
3. Extract any business logic from hooks to domain functions
4. Add ESLint plugin to prevent future violations (e.g., `eslint-plugin-boundaries` for import restrictions)

**Resolution Timeline**: All violations resolved by end of Phase 3 (before tasks are created for implementation).
