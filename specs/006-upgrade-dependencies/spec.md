# Feature Specification: Dependency and Build Tooling Upgrade

**Feature Branch**: `006-upgrade-dependencies`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "This application needs to be upgraded to use the latest version of react and build dependencies. The build approach itself can be updated to support this. Find whatever is the latest version of react and modify to support the latest version. There are even issues identified by dependabot that can be fixed."

## Overview

The goal-based financial planner application is currently running on outdated core dependencies. Known security vulnerabilities have been flagged by automated tooling, and the core UI library has a major stable release available. Additionally, the build tooling used to develop and deploy the application is no longer actively maintained by its creators, posing a long-term risk to developer productivity and stability. This feature brings the application up to date by resolving security vulnerabilities, upgrading to the latest stable release of the core UI framework, and modernising the build pipeline.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Security Vulnerabilities Resolved (Priority: P1)

A developer maintaining the application runs a dependency audit and finds zero high or critical severity vulnerabilities. All issues previously flagged by automated security scanning (Dependabot) are resolved, and the project is no longer blocking contributors due to known CVEs in transitive or direct dependencies.

**Why this priority**: Known security vulnerabilities are the highest risk to the project and its users. Unpatched dependencies can expose the application to attacks or disqualify it from use in security-conscious environments. This also unblocks dependabot alerts from generating noise.

**Independent Test**: Can be fully tested by running a dependency vulnerability audit against the updated project and confirming zero high/critical findings — delivering a secure, auditable dependency tree.

**Acceptance Scenarios**:

1. **Given** the updated dependency tree, **When** an automated security audit is run, **Then** no high or critical severity vulnerabilities are reported.
2. **Given** the Dependabot alerts page for the repository, **When** the upgraded branch is evaluated, **Then** all previously flagged alerts are resolved or dismissed with documented rationale.
3. **Given** a developer cloning the repo fresh, **When** they install dependencies, **Then** no security warnings are surfaced for direct dependencies.

---

### User Story 2 - Application Upgraded to Latest Stable Core UI Framework (Priority: P2)

A developer upgrades the application's core UI framework to its latest stable major version. The application continues to build successfully, all existing features work as before, and the application takes advantage of performance and compatibility improvements included in the new release.

**Why this priority**: The latest stable major version of the core UI framework includes performance improvements, better compatibility with modern tooling, and long-term support guarantees. Running on an older major version accumulates technical debt and eventually blocks future feature development.

**Independent Test**: Can be fully tested by building the application with the upgraded framework version, running all existing tests, and manually verifying that all existing user-facing features (goals, investments, dashboard) function correctly — delivering a modern, maintainable codebase.

**Acceptance Scenarios**:

1. **Given** the upgraded dependency versions, **When** the application is built, **Then** the build completes without errors.
2. **Given** the upgraded application, **When** all automated tests are run, **Then** all tests pass at or above the existing coverage thresholds.
3. **Given** the upgraded application, **When** a user navigates through all existing screens and interactions, **Then** no regressions in behaviour or visual presentation are observed.
4. **Given** the upgraded application, **When** it is deployed to the production hosting environment, **Then** the deployment succeeds and the live application is accessible.

---

### User Story 3 - Build Tooling Modernised (Priority: P3)

A developer working on the project uses a modern, actively maintained build tool to start the development server, run tests, and produce a production build. Build and test times are comparable to or faster than before, and the development experience is not degraded.

**Why this priority**: The current build tooling (Create React App) is no longer actively maintained. While it continues to function, it will increasingly diverge from the ecosystem and block future upgrades. Migrating to a supported alternative reduces long-term maintenance burden without changing any user-facing functionality.

**Independent Test**: Can be fully tested by starting the development server with the new build tooling, running the full test suite, and producing a production build — delivering a sustainable, maintainable development workflow.

**Acceptance Scenarios**:

1. **Given** the new build tooling, **When** a developer runs the local development server, **Then** the application starts without errors and hot-reloading works as expected.
2. **Given** the new build tooling, **When** the production build command is run, **Then** a deployable build artefact is produced without errors.
3. **Given** the new build tooling, **When** the test suite is run, **Then** all tests pass and coverage reporting works as before.
4. **Given** the new build tooling, **When** the application is deployed via the existing deployment workflow, **Then** the deployment succeeds and the application is accessible at its production URL.

---

### Edge Cases

- What happens if a third-party dependency is incompatible with the latest core UI framework version? The incompatible dependency must either be replaced with a compatible alternative or pinned with documented rationale.
- What happens if the new build tooling cannot replicate an existing build script (e.g., deployment, linting, coverage)? All existing scripts must be ported and verified to produce equivalent outcomes.
- What happens if automated tests fail after the upgrade due to breaking API changes? Tests must be updated to reflect the new APIs while preserving their intent and coverage level.
- What happens if the live deployment pipeline depends on the old build tooling? The CI/CD configuration must be updated in the same change to ensure deployments continue to work.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST build successfully for production without errors after all upgrades are applied.
- **FR-002**: The application MUST pass all existing automated tests at or above the currently defined coverage thresholds after upgrades.
- **FR-003**: All known high and critical severity dependency vulnerabilities flagged prior to this upgrade MUST be resolved.
- **FR-004**: The application MUST run correctly in development mode, including hot-reloading, using the updated build tooling.
- **FR-005**: All existing user-facing features MUST continue to function identically after the upgrade with no regressions.
- **FR-006**: The deployment process MUST continue to work after the upgrade, producing a live application accessible at the existing production URL.
- **FR-007**: All existing developer scripts (start, build, test, lint, deploy) MUST remain available and produce equivalent outcomes after the upgrade.
- **FR-008**: The core UI framework MUST be upgraded to the latest stable major version available at the time of implementation.
- **FR-009**: Any dependency that is incompatible with the upgraded core framework MUST either be replaced with a supported alternative or have its incompatibility documented and mitigated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero high or critical severity vulnerabilities reported by an automated dependency audit after the upgrade is complete.
- **SC-002**: 100% of automated tests pass after the upgrade, with no reduction in branch, function, line, or statement coverage below pre-upgrade thresholds.
- **SC-003**: The production build completes in a comparable time to before the upgrade (within 20% of the baseline build time).
- **SC-004**: All previously supported developer workflows (local dev, testing, linting, deployment) are verified to work after the upgrade with no manual workarounds required.
- **SC-005**: The application remains fully functional at its production URL within one deployment cycle after the upgrade is merged.
- **SC-006**: No Dependabot security alerts remain open for direct dependencies after the upgrade is merged.

## Assumptions

- The existing test suite provides sufficient coverage to detect functional regressions introduced by the upgrade.
- All existing user-facing features are expected to work identically after the upgrade; no breaking changes to user experience are in scope.
- The deployment target and hosting environment support the outputs produced by the updated build tooling.
- Third-party dependencies that are actively maintained will have versions compatible with the upgraded core framework; unmaintained dependencies may require replacement.
- The scope of this feature is limited to dependency and build tooling upgrades only — no new features or UI changes are in scope.
