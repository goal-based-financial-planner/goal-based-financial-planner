# Implementation Plan: Tabbed Financial Goals View

**Branch**: `004-goals-tabbed-view` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-goals-tabbed-view/spec.md`

## Summary

Replace the current stacked three-section layout (Financial Goals / Completed Goals / Recurring Goals) in `GoalBox` with a two-tab interface ("One Time (N)" and "Recurring (N)") using MUI Tabs. The "One Time" tab preserves the active/completed sub-section structure within it. The "Recurring" tab renames the existing "Monthly Target" column header to "Yearly Target". No new dependencies, no data-model changes, no backend involvement.

## Technical Context

**Language/Version**: TypeScript (React 18, CRA / react-scripts 5)
**Primary Dependencies**: MUI v6 (`@mui/material` — Tabs, Tab already available), React 18 hooks
**Storage**: N/A — tab state is ephemeral (local `useState`); no persistence changes
**Testing**: Jest + React Testing Library via `react-scripts test`
**Target Platform**: Browser (SPA, deployed via GitHub Pages)
**Project Type**: Single frontend project
**Performance Goals**: Tab switch must be perceptually instant (pure in-memory filter; no async work)
**Constraints**: No new npm dependencies; changes scoped to `src/pages/Planner/components/`
**Scale/Scope**: UI-only change affecting 2 existing components (`GoalBox/index.tsx`, `RecurringGoalsTable/index.tsx`) and 1 supporting file (`GoalBox/goalList.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post-design.*

| Principle | Assessment | Notes |
|-----------|-----------|-------|
| I. Clear Layering | ✅ Pass | Tab selection state lives in `GoalBox` (UI layer). No business logic moves into components. `FinancialGoal` domain class untouched. |
| II. Feature Co-location | ✅ Pass | All changes are within `src/pages/Planner/components/`. No shared `src/components/` files modified. |
| III. Upgrade-Friendly Boundaries | ✅ Pass | MUI `Tabs`/`Tab` imported from `@mui/material` public entry point only. No deep imports. |
| IV. Type Safety | ✅ Pass | New tab state typed as `0 \| 1` (tab index). No `any` introduced. |
| V. Predictable Change | ✅ Pass | No financial calculation logic changed. Label rename in `RecurringGoalsTable` is a string constant — no new unit test required. Existing tests unaffected. |

No violations. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/004-goals-tabbed-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files touched)

```text
src/
└── pages/
    └── Planner/
        └── components/
            ├── GoalBox/
            │   ├── index.tsx          # PRIMARY CHANGE: add Tabs, tab state, empty states
            │   └── goalList.tsx       # MINOR CLEANUP: remove redundant RECURRING filter
            └── RecurringGoalsTable/
                └── index.tsx          # LABEL CHANGE: "Monthly Target" → "Yearly Target"
```

**Structure Decision**: Single frontend project. All changes are page-local to `src/pages/Planner/components/` per Constitution Principle II. No new files created.

## Phase 0: Research

*All NEEDS CLARIFICATION items resolved from spec. Minimal external research needed — all dependencies already in use.*

See [research.md](./research.md).

## Phase 1: Design & Contracts

*No backend API. No new entities. Component prop interfaces are the "contracts".*

See [data-model.md](./data-model.md) and [quickstart.md](./quickstart.md).

## Implementation Design

### Change 1 — `GoalBox/index.tsx` (primary change)

**What changes**: Replace the three `Grid` blocks (pendingGoals / completedGoals / recurringGoals) with a `Tabs` + `Tab` control. Tab index `0` = "One Time", Tab index `1` = "Recurring".

**Tab label formula**:
- "One Time (N)" where N = `pendingGoals.length + completedGoals.length`
- "Recurring (N)" where N = `recurringGoals.length`

**Tab 0 — One Time content**:
- If both pending and completed are empty → empty state message: "No one-time goals added yet."
- If pending > 0 → render "Financial Goals" sub-heading + `<GoalList goals={pendingGoals} />`
- If completed > 0 → render "Completed Goals" sub-heading + `<GoalList goals={completedGoals} />`

**Tab 1 — Recurring content**:
- If recurringGoals is empty → empty state message: "No recurring goals added yet."
- Otherwise → render `<GoalList goals={recurringGoals} />`

**New state**:
```typescript
const [activeTab, setActiveTab] = useState<0 | 1>(0);
```

**MUI components used** (all already in `@mui/material`):
- `Tabs`, `Tab` — tab control
- `Box` — tab panel wrapper
- `Typography` — empty state and sub-section headings

**`useStyledBox` prop**: The existing `StyledBox` wrapper is applied at the `GoalBox` level (one box wrapping the whole tabbed area), not per-section as before. This simplifies the rendering logic.

---

### Change 2 — `RecurringGoalsTable/index.tsx` (label only)

**What changes**: One string constant in the `TableHead`:

```diff
- Monthly Target
+ Yearly Target
```

No logic, no calculation, no type changes.

---

### Change 3 — `GoalBox/goalList.tsx` (minor cleanup)

**What changes**: `GoalList` currently receives a mixed array and internally splits RECURRING from ONE_TIME. With the tabbed approach, `GoalBox` now passes pre-filtered arrays — pending one-time goals, completed one-time goals, or recurring goals — so the internal split in `GoalList` is redundant.

**Decision**: Remove the internal `recurringGoals`/`oneTimeGoals` filter split. `GoalList` renders whatever goals it receives using the appropriate renderer (GoalCard for ONE_TIME, RecurringGoalsTable for RECURRING). This keeps `GoalList` a thin renderer without hidden routing logic.

*Alternative considered*: Leave `goalList.tsx` unchanged. Rejected because it would leave dead branching logic (`recurringGoals` filter) that never fires after the tab refactor — a Constitution Principle I violation (hidden logic in UI).*

---

### Empty State Component

No new shared component needed. Empty states are simple inline `Typography` blocks within `GoalBox`. If the same pattern is needed elsewhere later, extraction is straightforward.

---

### Tab Accessibility

MUI `Tabs` handles ARIA roles (`role="tablist"`, `role="tab"`, `aria-selected`) automatically. Each tab panel wrapped in a `Box` with `role="tabpanel"` and `hidden` attribute when inactive, following MUI's recommended accessible tab panel pattern.
