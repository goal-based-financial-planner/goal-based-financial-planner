# goal-based-financial-planner Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-19

## Active Technologies
- TypeScript (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material` — Tabs, Tab already available), React 18 hooks (004-goals-tabbed-view)
- N/A — tab state is ephemeral (local `useState`); no persistence changes (004-goals-tabbed-view)
- TypeScript 4.x (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material`, `@mui/x-date-pickers` already present), `react-hook-form` (already present), `dayjs` (already present) (005-investment-tracking)
- Browser `localStorage` via `src/util/storage.ts` — no new key; field added to existing `plannerData` key (005-investment-tracking)
- TypeScript 4.x (unchanged); React 18.3.1 → 19.2.4 + Vite 8.0.0, @vitejs/plugin-react, Vitest (replaces react-scripts 5.0.1 / Jest 27) (006-upgrade-dependencies)
- Browser `localStorage` via `src/util/storage.ts` — no change (006-upgrade-dependencies)
- TypeScript 4.x, React 19.2.4, Vite 8.0.0 + @mui/material v6, react-hook-form, dayjs, `idb-keyval` (new — ~300B brotli), Google Identity Services (CDN script) (007-flexible-storage-provider)
- File System Access API + IndexedDB (local); Google Drive REST API + appDataFolder scope (cloud); sessionStorage (Drive file ID only) (007-flexible-storage-provider)

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
- 007-flexible-storage-provider: Added TypeScript 4.x, React 19.2.4, Vite 8.0.0 + @mui/material v6, react-hook-form, dayjs, `idb-keyval` (new — ~300B brotli), Google Identity Services (CDN script)
- 006-upgrade-dependencies: Added TypeScript 4.x (unchanged); React 18.3.1 → 19.2.4 + Vite 8.0.0, @vitejs/plugin-react, Vitest (replaces react-scripts 5.0.1 / Jest 27)
- 005-investment-tracking: Added TypeScript 4.x (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material`, `@mui/x-date-pickers` already present), `react-hook-form` (already present), `dayjs` (already present)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
