# Feature Specification: Codebase Architecture Refactor for Constitution Compliance

**Feature Branch**: `002-codebase-architecture-refactor`  
**Created**: 2026-01-31  
**Status**: Draft  
**Input**: User description: "I want to refactor the code to make the code follow the constitution. Refactor to set proper file grouping. Proper naming, performance improvements etc. Also refactor to make sure the business logic is well separated. Refactor to make react version upgrades easy or any other library version upgrades easy"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Navigates Codebase with Clear Intent (Priority: P1)

A developer needs to modify business logic for investment calculations and can immediately locate all relevant code in the domain layer without searching through UI components or guessing file locations.

**Why this priority**: Clear code organization is the foundation for all other refactoring benefits. Without proper file structure, developers waste time hunting for code, which compounds the cost of every future change.

**Independent Test**: Can be fully tested by asking a developer unfamiliar with the codebase to locate: (1) where investment allocation calculations happen, (2) where financial goal validation occurs, and (3) what data shapes define the core domain entities. Success means finding each within 2 minutes without grep/search.

**Acceptance Scenarios**:

1. **Given** a developer needs to modify investment allocation logic, **When** they navigate to `src/domain/investmentAllocations.ts`, **Then** they find all pure calculation functions with no UI dependencies
2. **Given** a developer needs to understand financial goal rules, **When** they open `src/domain/FinancialGoals.ts`, **Then** they see all validation and business rules in one place with comprehensive tests
3. **Given** a developer wants to add a new page-specific component, **When** they navigate to `src/pages/[PageName]/components/`, **Then** they find colocated page-specific UI without mixing with shared components

---

### User Story 2 - Developer Upgrades React Without Breaking Changes (Priority: P1)

A developer upgrades React from the current version to the latest version, and the upgrade completes smoothly because component patterns follow React best practices and avoid deprecated APIs or anti-patterns.

**Why this priority**: React version upgrades are inevitable and critical for security, performance, and ecosystem compatibility. Poor abstraction boundaries make upgrades risky and expensive.

**Independent Test**: Can be tested by performing a React version upgrade (major or minor) and verifying: (1) build succeeds, (2) all existing tests pass, (3) no deprecation warnings appear in console, (4) app runs without runtime errors.

**Acceptance Scenarios**:

1. **Given** React is upgraded to a new major version, **When** the build runs, **Then** no compilation errors occur due to deprecated APIs or incorrect import patterns
2. **Given** third-party UI libraries are wrapped in local components, **When** a library needs replacement or upgrade, **Then** changes are isolated to wrapper components without cascading UI changes
3. **Given** theme and styling configuration is centralized, **When** UI library styling changes in an upgrade, **Then** adjustments happen in one location (`src/theme.ts`)

---

### User Story 3 - Developer Changes Business Logic Without UI Side Effects (Priority: P1)

A developer modifies investment calculation rules (e.g., changing asset allocation percentages based on time horizon), and the change is made entirely in domain functions without touching any React components or hooks.

**Why this priority**: Business logic separation is critical for testability, maintainability, and preventing bugs. When business rules leak into UI, they become duplicated, inconsistent, and hard to change safely.

**Independent Test**: Can be tested by modifying a calculation rule (e.g., risk adjustment factor) in `src/domain/` and verifying: (1) no component files require changes, (2) only domain-level unit tests need updates, (3) UI automatically reflects the change through data flow.

**Acceptance Scenarios**:

1. **Given** an investment allocation rule needs adjustment, **When** the developer edits pure functions in `src/domain/investmentAllocations.ts`, **Then** the change propagates to all UI consumers without component modifications
2. **Given** business rules are tested in domain layer, **When** a calculation changes, **Then** failing tests pinpoint the issue before any UI testing is needed
3. **Given** side effects (storage, time) are isolated behind adapters, **When** business logic runs, **Then** it can be tested with mocked adapters without browser dependencies

---

### User Story 4 - Developer Finds and Fixes Performance Issues (Priority: P2)

A developer identifies performance bottlenecks (unnecessary re-renders, expensive recalculations) and optimizes them because components follow clear patterns for derived state and memoization.

**Why this priority**: Performance issues directly impact user experience but are lower priority than structural clarity because they can be addressed incrementally once the architecture is sound.

**Independent Test**: Can be tested by profiling the app with React DevTools, identifying components with excessive renders or slow calculations, and verifying that refactored code reduces render counts by at least 30% in identified hotspots.

**Acceptance Scenarios**:

1. **Given** a component displays derived financial data, **When** parent state updates, **Then** expensive calculations are memoized and don't recompute unnecessarily
2. **Given** a complex calculation runs in a hook, **When** dependencies haven't changed, **Then** the hook returns cached results without recalculating
3. **Given** a list of financial goals is rendered, **When** one goal is modified, **Then** only the affected list item re-renders (not the entire list)

---

### User Story 5 - Developer Adds New Feature Following Established Patterns (Priority: P2)

A developer adds a new financial goal type (e.g., "Education Savings") and follows the established architecture patterns: domain types in `src/domain/`, UI in appropriate page components, shared utilities in designated locations.

**Why this priority**: Consistency in how new features are added prevents architectural drift. This validates that the refactoring creates a sustainable pattern for future work.

**Independent Test**: Can be tested by adding a new goal type feature and verifying: (1) domain types added to `src/domain/`, (2) validation logic colocated with business rules, (3) UI components follow page/component separation, (4) no cross-layer violations introduced.

**Acceptance Scenarios**:

1. **Given** a new feature requires domain logic, **When** the developer adds code, **Then** they naturally place it in `src/domain/` following existing patterns
2. **Given** a new UI component is page-specific, **When** the developer creates it, **Then** it lives under `src/pages/[PageName]/components/` with colocated tests
3. **Given** a new utility is needed across multiple pages, **When** the developer evaluates placement, **Then** clear guidelines indicate whether it belongs in `src/domain/`, `src/util/`, or as a shared hook

---

### User Story 6 - Developer Upgrades Third-Party Charting Library (Priority: P3)

A developer upgrades the charting library (e.g., recharts) to a new major version or replaces it entirely, and the change is isolated to wrapper components without requiring changes across every chart usage.

**Why this priority**: While important for maintainability, this is lower priority because it's less frequent than React upgrades and can be deferred if architecture is sound.

**Independent Test**: Can be tested by replacing chart wrapper component implementation and verifying: (1) all chart consumers continue working, (2) no prop interface changes required, (3) changes isolated to 1-3 wrapper files.

**Acceptance Scenarios**:

1. **Given** chart components are wrapped in local abstractions, **When** the underlying library is upgraded, **Then** changes happen only in wrapper components (`src/components/[Chart]/*.tsx`)
2. **Given** chart props follow a consistent interface, **When** implementation changes, **Then** consumer components don't need updates to their chart usage
3. **Given** chart theming is centralized, **When** library color APIs change, **Then** adjustments happen in theme configuration only

---

### Edge Cases

- What happens when refactoring reveals tightly coupled code that can't be cleanly separated without breaking existing functionality?
  - Use the "strangler fig" pattern: create new properly-structured code alongside old code, migrate incrementally, remove old code only when fully replaced
  
- How does the system handle components that have mixed concerns (both business logic and presentation)?
  - Extract business logic to domain functions or custom hooks first, leaving pure presentational components
  - If immediate extraction is risky, add inline comments marking technical debt with "TODO: Extract to domain layer"

- What happens when shared components accidentally import from page-specific code?
  - Build-time linting rules catch cross-layer violations and fail the build
  - Manual code review checks the dependency graph before merge

- How does the refactor handle performance regressions introduced during restructuring?
  - Existing tests serve as regression guards
  - Performance benchmarks (if they exist) must not degrade by more than 10%
  - If performance issues are introduced, they are fixed before merge (not deferred)

- What happens when third-party library deep imports are necessary for functionality?
  - Document the specific reason in a comment at the import site
  - Wrap the deep import behind a local adapter/facade to isolate the violation
  - Add a monitoring note for future upgrade planning

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All business logic (financial calculations, goal validation, investment allocation rules) MUST reside in `src/domain/` as pure functions with no React or UI dependencies
- **FR-002**: Page-specific UI components MUST be colocated under `src/pages/[PageName]/components/` and MUST NOT be imported by other pages
- **FR-003**: Shared UI components in `src/components/` MUST be truly reusable primitives and MUST NOT import from `src/pages/`
- **FR-004**: Domain layer (`src/domain/`) MUST NOT depend on UI, state management, or side effects (storage, time, etc.)
- **FR-005**: Side effects (localStorage, date/time, random number generation) MUST be isolated behind thin adapter modules (e.g., `src/util/storage.ts`) that can be mocked in tests
- **FR-006**: Third-party library imports MUST use public entry points only (no deep imports like `library/dist/internal/module`), except where documented and wrapped
- **FR-007**: Widely-used third-party UI components (charts, date pickers) MUST be wrapped in local components (`src/components/`) to isolate upgrade impact
- **FR-008**: Cross-cutting configuration (theme, app constants) MUST be centralized in dedicated files (`src/theme.ts`, `src/domain/constants.ts`)
- **FR-009**: All new code MUST be fully typed with TypeScript; `any` types MUST NOT be introduced unless justified with an inline comment
- **FR-010**: Shared data shapes MUST be defined once in `src/types/` or `src/domain/` and imported, not redeclared
- **FR-011**: Component naming MUST follow `PascalCase`, hooks MUST follow `useThing` convention, and pure utilities MUST use `camelCase`
- **FR-012**: File names MUST be descriptive and specific (avoid generic names like `helpers.ts`, `utils.ts` when a narrower name is possible)
- **FR-013**: Financial calculation logic MUST have comprehensive unit tests colocated with the implementation
- **FR-014**: Code MUST be formatted with Prettier (existing configuration) before merge
- **FR-015**: Refactored code MUST maintain or improve current test coverage (no reduction in coverage percentage)
- **FR-016**: Expensive computations in components MUST use memoization (useMemo, useCallback) to prevent unnecessary recalculations
- **FR-017**: Component re-renders MUST be minimized through proper use of React optimization patterns (memo, useMemo, useCallback)
- **FR-018**: Build process MUST complete successfully (`npm run build`) after all refactoring changes
- **FR-019**: All existing automated tests MUST pass after refactoring (no regression in test suite)
- **FR-020**: Refactoring changes MUST be staged in small, reviewable PRs following safe patterns: move/rename → behavior changes → cleanup

### Key Entities

- **Domain Layer** (`src/domain/`): Pure business logic modules containing financial calculations, goal validation, investment allocation rules, and domain constants. No React dependencies, fully testable with unit tests.

- **UI Components** (presentational layer): Split into shared (`src/components/`) and page-specific (`src/pages/[Page]/components/`). Shared components are reusable primitives, page-specific components serve single page needs.

- **Adapters/Utilities** (`src/util/`): Thin isolation layers for side effects (storage, time, external APIs). Allow business logic to remain pure and testable.

- **Application State**: Currently managed through reducers (`src/store/`). State shape and updates, with business derivations happening in domain functions, not in reducers or components.

- **Type Definitions** (`src/types/`, `src/domain/`): Shared TypeScript interfaces and types defining contracts between layers. Single source of truth for data shapes.

- **Theme Configuration** (`src/theme.ts`): Centralized styling configuration for colors, spacing, typography. Used across all UI components to ensure consistent upgrades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer unfamiliar with the codebase can locate any business logic function within 2 minutes without using code search tools
- **SC-002**: React version upgrade (major version) completes with zero breaking changes in component code (only configuration adjustments allowed)
- **SC-003**: Business logic changes require zero component file modifications (verified by git diff showing changes only in `src/domain/`)
- **SC-004**: Test coverage for financial calculations reaches 90% or higher (measured by Jest coverage reports)
- **SC-005**: Component re-render counts decrease by at least 30% in identified performance hotspots (measured by React DevTools profiler)
- **SC-006**: Build time does not increase by more than 10% after refactoring (measured by CI pipeline timing)
- **SC-007**: Third-party library upgrade (e.g., chart library major version) requires changes in fewer than 5 wrapper component files
- **SC-008**: Code review time for new features decreases by 25% due to clearer architecture patterns (measured over 5 pull requests post-refactor)
- **SC-009**: Zero cross-layer dependency violations detected by automated linting (shared components importing from pages, domain importing from UI)
- **SC-010**: New developer onboarding includes architecture walkthrough completable in under 30 minutes with clear navigation of each layer
