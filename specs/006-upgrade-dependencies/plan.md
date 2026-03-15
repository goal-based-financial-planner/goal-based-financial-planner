# Implementation Plan: Dependency and Build Tooling Upgrade

**Branch**: `006-upgrade-dependencies` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-upgrade-dependencies/spec.md`

## Summary

Upgrade the goal-based financial planner from its current dependency stack (React 18.3.1, react-scripts/CRA 5.0.1) to React 19.2.4 and Vite 8.0.0. This resolves all outstanding Dependabot security alerts (which are structurally embedded in CRA's transitive dependencies and cannot be fixed while staying on CRA), replaces the abandoned build tooling with an actively maintained modern alternative, and migrates the test runner from Jest (via react-scripts) to Vitest.

The upgrade is performed in **two focused PRs** per the constitution's "small, reversible PRs" principle:
- **PR 1**: CRA → Vite 8 migration (React 18 retained; all CVEs resolved)
- **PR 2**: React 18 → React 19 upgrade (breaking changes, react-joyride replacement)

See [research.md](./research.md) for all decisions and rationale.

## Technical Context

**Language/Version**: TypeScript 4.x (unchanged); React 18.3.1 → 19.2.4
**Primary Dependencies**: Vite 8.0.0, @vitejs/plugin-react, Vitest (replaces react-scripts 5.0.1 / Jest 27)
**Storage**: Browser `localStorage` via `src/util/storage.ts` — no change
**Testing**: Vitest + @testing-library/react v16 + jsdom (replaces jest via react-scripts)
**Target Platform**: Browser SPA deployed to GitHub Pages
**Project Type**: Single web application (frontend-only, no backend)
**Performance Goals**: Production build time ≤ current baseline; dev HMR < 200ms (Vite's baseline)
**Constraints**: Must preserve gh-pages deployment; no regression in existing test coverage thresholds (55% branches, 63% functions/lines/statements); existing user-facing features unchanged
**Scale/Scope**: Single-page application (~50 source files)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Clear Layering** | ✅ Pass | No changes to domain/component/page code organisation. Build tooling changes are infrastructure-only. |
| **II. Feature Co-location** | ✅ Pass | No source file structure changes. Existing `src/` layout preserved exactly. |
| **III. Upgrade-Friendly Boundaries** | ✅ Pass | This work directly fulfils Principle III — removing deep CRA coupling and replacing unmaintained transitive deps. react-joyride is replaced with an API-identical fork to maintain the "thin wrapper" pattern. |
| **IV. Type Safety** | ⚠️ Action Required | `@types/react` and `@types/react-dom` must be upgraded to `^19.0.0`. React 19 tightens `ReactElement` props to `unknown` and changes `useRef` signature — TypeScript errors will surface that must be fixed, not suppressed with `any`. |
| **V. Predictable Change** | ✅ Pass | Two focused PRs (build tooling; then React version) as mandated by "one dependency family at a time." All existing tests must pass before merging either PR. Financial calculation unit tests are the primary regression guard. |

**Post-design re-check**: Passes. The `react-joyride` replacement adds a new direct dependency (`@adi-prasetyo/react-joyride`) but is API-identical — no UI or behaviour changes. The `public/index.html` move is infrastructure-only.

## Project Structure

### Documentation (this feature)

```text
specs/006-upgrade-dependencies/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output — developer setup for new Vite toolchain
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
# Single project structure — unchanged layout, updated tooling files

/
├── index.html                  # MOVED from public/index.html; updated entry point ref
├── vite.config.ts              # NEW — replaces CRA/webpack implicit config
├── tsconfig.json               # UPDATED — moduleResolution: bundler, vite/client types
├── package.json                # UPDATED — scripts, dependencies, devDependencies
│
├── public/                     # Retained for static assets (favicon, manifest, robots.txt)
│   └── [static assets only — index.html removed]
│
└── src/                        # UNCHANGED — no source file moves or renames
    ├── index.tsx               # VERIFY: createRoot() usage (React 18 already uses this)
    ├── setupTests.ts           # UPDATED — import from vitest instead of jest globals
    ├── domain/
    ├── components/
    ├── pages/
    ├── util/
    ├── store/
    └── types/
```

**Structure Decision**: Single project (Option 1). No backend or mobile components. All changes are to root-level tooling configuration files. The `src/` directory structure is preserved without modification, which is the lowest-risk approach for a tooling-only upgrade.

## Complexity Tracking

No constitution violations. No complexity exceptions required.

This upgrade removes complexity (replaces multi-layered CRA abstraction with explicit, readable `vite.config.ts`) rather than adding it.

---

## Implementation Notes

### PR 1 Scope: CRA → Vite 8

Files created/modified:
- `package.json` — remove `react-scripts`; add `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/coverage-v8`, `@testing-library/dom`
- `vite.config.ts` — new file with react plugin, test config, base URL for gh-pages
- `tsconfig.json` / `tsconfig.app.json` — update `moduleResolution: "bundler"`, add `vite/client` types
- `index.html` — move from `public/index.html` to project root; replace `%PUBLIC_URL%` references; add `<script type="module" src="/src/index.tsx">`
- `src/setupTests.ts` — update imports for vitest compatibility
- `src/react-app-env.d.ts` — replace with `src/vite-env.d.ts` (or update existing)

Scripts updated (`package.json`):
- `"start"` → `"dev": "vite"` (keep `"start": "vite"` alias for familiarity)
- `"build"` → `"build": "tsc && vite build"`
- `"test"` → `"test": "vitest"`
- `"test:ci"` → `"test:ci": "vitest run --passWithNoTests"`
- `"test:cov"` → `"test:cov": "vitest run --coverage"`
- `"deploy"` → `"deploy": "gh-pages -d dist"` (output dir changes from `build/` to `dist/`)

### PR 2 Scope: React 18 → React 19

Packages upgraded:
- `react`: `^18.3.1` → `^19.2.4`
- `react-dom`: `^18.3.1` → `^19.2.4`
- `@types/react`: `^18.3.12` → `^19.0.0`
- `@types/react-dom`: `^18.3.1` → `^19.0.0`
- `react-joyride`: removed → `@adi-prasetyo/react-joyride` (API-identical React 19 fork)

Breaking changes to address:
- Run `npx codemod@latest react/19/migration-recipe` to automate routine changes
- Fix all `useRef()` calls missing the required initial argument
- Verify `src/index.tsx` uses `ReactDOM.createRoot()` (already the case in React 18 but confirm)
- Check all `react-hook-form` `watch()` usages — replace with `useWatch()` if React Compiler is enabled (not currently, so likely no action needed)
- Update `package.json` `overrides` section — remove the `react-progressbar-semicircle` override for `react`/`react-dom` (it supported React 18; verify React 19 compatibility or replace)
- Fix any TypeScript errors surfaced by `ReactElement` props defaulting to `unknown`
