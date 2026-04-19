# goal-based-financial-planner Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-19

## Active Technologies
- TypeScript (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material` — Tabs, Tab already available), React 18 hooks (004-goals-tabbed-view)
- N/A — tab state is ephemeral (local `useState`); no persistence changes (004-goals-tabbed-view)
- TypeScript 4.x (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material`, `@mui/x-date-pickers` already present), `react-hook-form` (already present), `dayjs` (already present) (005-investment-tracking)
- Browser `localStorage` via `src/util/storage.ts` — no new key; field added to existing `plannerData` key (005-investment-tracking)
- TypeScript 4.x (unchanged); React 18.3.1 → 19.2.4 + Vite 8.0.0, @vitejs/plugin-react, Vitest (replaces react-scripts 5.0.1 / Jest 27) (006-upgrade-dependencies)
- Browser `localStorage` via `src/util/storage.ts` — no change (006-upgrade-dependencies)
- TypeScript 4.x, React 19.2.4, Vite 8.0.0 + @mui/material v6, react-hook-form, dayjs, `idb-keyval` (new — ~300B brotli), Google Identity Services (CDN script) (007-flexible-storage-provider)
- File System Access API + IndexedDB (local); Google Drive REST API + appDataFolder scope (cloud); sessionStorage (Drive file ID only) (007-flexible-storage-provider)
- TypeScript 4.x + React 19.2.4, Vite 8.0.0, MUI v6, react-hook-form, dayjs (009-locale-currency-goal-duration)
- File System Access API + IndexedDB (local); Google Drive REST API (cloud) (009-locale-currency-goal-duration)
- TypeScript 4.x + React 19.2.4 + MUI v6, react-hook-form, dayjs, Vite 8.0.0 + Vitest (existing); **new**: `jspdf` + `html2canvas` (010-export-plan-pdf)
- No new storage — export is read-only, client-side only (010-export-plan-pdf)
- TypeScript 4.x + React 19.2.4, MUI v6 (`@mui/material`), Vite 8.0.0, Vites (011-total-monthly-investment)
- N/A — derived display value only (011-total-monthly-investment)

- Markdown / N/A (documentation only) + N/A (static documentation files) (003-oss-documentation)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

# Add commands for Markdown / N/A (documentation only)

## Code Style

Markdown / N/A (documentation only): Follow standard conventions

## Recent Changes
- 011-total-monthly-investment: Added TypeScript 4.x + React 19.2.4, MUI v6 (`@mui/material`), Vite 8.0.0, Vites
- 010-export-plan-pdf: Added TypeScript 4.x + React 19.2.4 + MUI v6, react-hook-form, dayjs, Vite 8.0.0 + Vitest (existing); **new**: `jspdf` + `html2canvas`
- 009-locale-currency-goal-duration: Added TypeScript 4.x + React 19.2.4, Vite 8.0.0, MUI v6, react-hook-form, dayjs


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
