# Research: Dependency and Build Tooling Upgrade

**Feature**: 006-upgrade-dependencies
**Date**: 2026-03-15

---

## Decision 1: Build Tooling — Vite over Create React App

**Decision**: Migrate from `react-scripts` (Create React App) to **Vite 8.0.0** with `@vitejs/plugin-react`.

**Rationale**:
- CRA (`react-scripts 5.0.1`) is the last release of the project; it is no longer maintained and will not receive security patches.
- CRA carries **structural, unresolvable CVEs** in its transitive dependency tree (see Decision 5). These cannot be patched by upgrading packages within the CRA ecosystem due to locked dependency constraints.
- Vite 8.0.0 uses a fundamentally different architecture (esbuild + Rolldown) that does not depend on webpack, webpack-dev-server, loader-utils, or the problematic PostCSS/resolve-url-loader chain — eliminating those CVEs by removing the dependency chain entirely.
- One documented migration result: 17 vulnerabilities (13 high) reduced to 4 low after CRA → Vite migration.
- Vite 8.0.0 is the current latest stable version (released March 12, 2026), now using Rolldown as a unified Rust-based bundler delivering 10-30x faster production builds.

**Alternatives considered**:
- Staying on CRA 5.0.1: Rejected — project is abandoned, CVEs are unresolvable without breaking changes, blocks React 19 upgrade.
- Next.js: Rejected — adds server-side complexity this application does not require (pure SPA/GitHub Pages deployment).
- Parcel: Rejected — smaller ecosystem, less community adoption, fewer plugins.

---

## Decision 2: React Version — Upgrade to React 19.2.4

**Decision**: Upgrade from React 18.3.1 to **React 19.2.4** (latest stable).

**Rationale**:
- React 19.0.0 was released December 2024; 19.2.4 is the latest stable patch (as of March 2026).
- React 18.3.1 was released specifically to surface deprecation warnings before the React 19 migration — the codebase is already in the right state to proceed.
- MUI v6, @mui/x-charts v7, and @mui/x-date-pickers v7 all explicitly support React 19.
- `@types/react@^19.0.0` and `@types/react-dom@^19.0.0` are still installed separately (types are not bundled in React 19).

**Breaking changes that apply to this codebase**:
- `ReactDOM.render()` must be replaced by `ReactDOM.createRoot()` — check `src/index.tsx`.
- `useRef()` now requires an argument: `useRef(null)` or `useRef(undefined)`.
- JSX namespace: implicit `JSX` global type moves to `React.JSX`. TypeScript compiler handles this automatically with `@types/react@19`.
- `ReactElement` props default to `unknown` instead of `any` — may surface new TypeScript errors.
- Codemod available: `npx codemod@latest react/19/migration-recipe` automates most changes.

**Alternatives considered**:
- Staying on React 18: Rejected — defeats the purpose of this upgrade; React 19 is stable with broad ecosystem support.
- React 19 RC: Rejected — full stable is available.

---

## Decision 3: Test Runner — Vitest over Jest

**Decision**: Replace `react-scripts test` (Jest 27 via CRA) with **Vitest** running in a `jsdom` environment.

**Rationale**:
- Vitest shares the same Vite config, plugins, and module resolution as the build — one pipeline to maintain.
- Vitest is Jest-compatible: `describe`, `it`, `expect`, and `beforeEach` all work without import changes.
- `@testing-library/react v16` (already installed) is compatible with React 19 (v16.3.2+).
- `@testing-library/dom` must be added as a peer dependency (new requirement for v16).
- ~9x faster watch-mode feedback than Jest (380 ms vs 3.4 s per change).
- Existing `coverageThreshold` settings in `package.json` (55% branches, 63% functions/lines/statements) can be replicated via Vitest's `coverage` config.
- Coverage reporter can use `@vitest/coverage-v8` to maintain `lcov`, `json-summary`, and `text` reporters.

**Alternatives considered**:
- Keeping Jest standalone (jest + ts-jest + jest-environment-jsdom): Technically possible but requires maintaining two separate configs (vite.config.ts + jest.config.js); Jest ES module support is still experimental and error-prone with Vite.
- Playwright for E2E: Out of scope for this upgrade; no E2E tests exist today.

---

## Decision 4: Migration Sequence — Vite First, React 19 Second

**Decision**: Perform the upgrade in **two focused PRs** per Constitution Principle V.

- **PR 1**: Migrate build tooling CRA → Vite 8 (keeping React 18). Resolves all CVEs. Tests and deployment verified on existing React version.
- **PR 2**: Upgrade React 18 → React 19. Fix breaking changes (react-joyride, useRef, types). Merge after PR 1.

**Rationale**:
- Constitution Principle V mandates "focused PRs (one dependency family at a time when possible)."
- Separating the build tool migration from the React major version upgrade isolates failure domains: if React 19 causes a regression, the build change is already clean and verified.
- CRA does not support React 19 cleanly; the Vite migration must land first to enable the React 19 upgrade.

**Alternatives considered**:
- Single PR combining both: Rejected — harder to bisect regressions; violates constitution guidance.
- React 19 first (keeping CRA): Rejected — CRA is incompatible with React 19; would require workarounds that are immediately discarded.

---

## Decision 5: Dependabot CVEs — Resolution Strategy

**Decision**: All high/critical CVEs are resolved via the Vite migration (they live exclusively in CRA's transitive dependency tree). No manual overrides or `npm audit --force` fixes are required.

**CVEs resolved by removing react-scripts**:

| CVE | Package | Severity | Resolution |
|-----|---------|----------|------------|
| CVE-2021-3803 | nth-check@1.0.2 (via @svgr/webpack) | High | Removed with CRA |
| CVE-2022-37601 | loader-utils@2.0.2 (archived) | High | Removed with CRA |
| CVE-2022-37599 | loader-utils@2.0.2 (archived) | High | Removed with CRA |
| CVE-2021-23368 | postcss@7.x (via resolve-url-loader) | Medium | Removed with CRA |
| CVE-2023-44270 | postcss@7.x (via resolve-url-loader) | Medium | Removed with CRA |
| CVE-2025-30360 | webpack-dev-server@4.6.0 | Critical | Removed with CRA |

**Rationale**: loader-utils was archived in December 2025. webpack-dev-server CVE-2025-30360 (source code theft via WebSocket hijacking) cannot be fixed within CRA constraints. Vite's architecture does not use any of these dependencies.

---

## Decision 6: react-joyride Replacement

**Decision**: Replace `react-joyride@2.x` with **`@adi-prasetyo/react-joyride`** (maintained fork with identical API) as part of the React 19 upgrade PR.

**Rationale**:
- `react-joyride@2.x` uses `ReactDOM.unmountComponentAtNode` and `unstable_renderSubtreeIntoContainer` — both removed in React 19.
- The fork `@adi-prasetyo/react-joyride` is API-compatible (drop-in replacement, same props and usage).
- Community version `react-joyride@2.9.5-react19-compat` also exists as an alternative.
- No feature changes to the tour/onboarding experience are required.

**Alternatives considered**:
- Removing the tour entirely: Rejected — onboarding tour is existing user-facing functionality.
- Waiting for upstream fix: Rejected — the original repo shows no signs of a React 19 release.

---

## Decision 7: react-use Compatibility

**Decision**: Keep `react-use@17.6.0` and **verify at integration time**. Pin or replace if runtime errors occur.

**Rationale**:
- `react-use` was last updated a year ago; explicit React 19 support is unconfirmed.
- The library is a utility collection; hooks that don't use deprecated APIs will work as-is.
- A targeted audit of which `react-use` hooks this codebase actually uses should be performed during implementation. If conflicts exist, individual hooks can be replaced with equivalents or inlined.

---

## Decision 8: Environment Variables

**Decision**: The current codebase does not use `REACT_APP_*` environment variables (no `.env` files present; the app is a pure client-side app with no external API calls). No environment variable migration is required.

**Rationale**: Scanning the codebase confirms no `process.env.REACT_APP_*` references. The Vite `VITE_` prefix convention is adopted for any future env var usage.

---

## Decision 9: index.html Migration

**Decision**: Move `public/index.html` to the project root and update the entry point reference to `<script type="module" src="/src/index.tsx">`.

**Rationale**: Vite requires `index.html` at the project root as the entry point for its module graph. The `%PUBLIC_URL%` CRA placeholder must be removed; Vite handles base URL via the `base` config option.

The existing `base` URL for GitHub Pages (`/goal-based-financial-planner/`) must be set in `vite.config.ts` to maintain the correct asset paths on deployment.

---

## Decision 10: gh-pages Deployment

**Decision**: Retain `gh-pages` for deployment. Update the deploy target from `build/` to `dist/` (Vite's default output directory).

**Rationale**: Vite builds to `dist/` by default (CRA used `build/`). The `gh-pages -d build` script becomes `gh-pages -d dist`. All other deployment semantics remain identical.
