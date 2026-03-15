# Developer Quickstart: Post-Migration Setup

**Feature**: 006-upgrade-dependencies
**Date**: 2026-03-15

This guide covers how to build, test, and deploy the application after the CRA → Vite migration and React 18 → React 19 upgrade are complete.

---

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm 9+

---

## Install Dependencies

```bash
npm install
```

No flags needed. The new Vite-based dependency tree has no unresolvable peer dependency conflicts (unlike CRA which required `--legacy-peer-deps` workarounds in some environments).

---

## Development Server

```bash
npm run dev
# or
npm start
```

Opens at `http://localhost:3000` with hot module replacement (HMR). Changes to source files reflect in the browser instantly without a full page reload.

---

## Run Tests

```bash
# Interactive watch mode (for development)
npm test

# Single run (for CI)
npm run test:ci

# With coverage report
npm run test:cov
```

Coverage reports are generated in the `coverage/` directory (lcov, json-summary, text formats — same as before).

Coverage thresholds are enforced:

| Metric | Minimum |
|--------|---------|
| Branches | 55% |
| Functions | 63% |
| Lines | 63% |
| Statements | 63% |

---

## Production Build

```bash
npm run build
```

Output is placed in `dist/` (previously `build/`). To preview the production build locally:

```bash
npm run preview
# Opens at http://localhost:4173
```

---

## Linting

```bash
npm run lint         # check
npm run lint:fix     # auto-fix
```

ESLint config and boundary rules are unchanged.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

This runs `npm run build` first (via `predeploy`), then pushes `dist/` to the `gh-pages` branch. The live application is accessible at:

`https://goal-based-financial-planner.github.io/goal-based-financial-planner`

---

## Key Differences from Before the Migration

| Area | Before (CRA) | After (Vite) |
|------|-------------|--------------|
| Start command | `npm start` | `npm start` or `npm run dev` |
| Build output dir | `build/` | `dist/` |
| Test runner | Jest (via react-scripts) | Vitest |
| Config file | None (hidden in react-scripts) | `vite.config.ts` (explicit, at root) |
| index.html location | `public/index.html` | `index.html` (project root) |
| Env var prefix | `REACT_APP_*` | `VITE_*` |
| TypeScript env types | `react-app-env.d.ts` | `vite-env.d.ts` |
| React version | 18.3.1 | 19.2.4 |

---

## Troubleshooting

**Build fails with "Cannot find module" errors**
- Ensure `tsconfig.json` uses `"moduleResolution": "bundler"`
- Run `npm install` to ensure all deps are installed

**Tests fail to find `jest` globals**
- Vitest globals (`describe`, `it`, `expect`) are enabled via `globals: true` in `vite.config.ts` — no import needed
- If a test file explicitly imports from `jest`, replace with `vitest`: `import { vi } from 'vitest'`

**CSS/image imports fail**
- Vite handles asset imports natively. If you see errors, check that the import path is correct relative to the source file.

**gh-pages deploy fails**
- Ensure the `base` in `vite.config.ts` matches the repository path: `/goal-based-financial-planner/`
- Verify the `dist/` directory exists after running `npm run build`
