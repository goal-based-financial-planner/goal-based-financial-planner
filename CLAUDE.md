# goal-based-financial-planner Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-15

## Active Technologies
- TypeScript (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material` — Tabs, Tab already available), React 18 hooks (004-goals-tabbed-view)
- N/A — tab state is ephemeral (local `useState`); no persistence changes (004-goals-tabbed-view)
- TypeScript 4.x (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material`, `@mui/x-date-pickers` already present), `react-hook-form` (already present), `dayjs` (already present) (005-investment-tracking)
- Browser `localStorage` via `src/util/storage.ts` — no new key; field added to existing `plannerData` key (005-investment-tracking)

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
- 005-investment-tracking: Added TypeScript 4.x (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material`, `@mui/x-date-pickers` already present), `react-hook-form` (already present), `dayjs` (already present)
- 004-goals-tabbed-view: Added TypeScript (React 18, CRA / react-scripts 5) + MUI v6 (`@mui/material` — Tabs, Tab already available), React 18 hooks

- 003-oss-documentation: Added Markdown / N/A (documentation only) + N/A (static documentation files)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
