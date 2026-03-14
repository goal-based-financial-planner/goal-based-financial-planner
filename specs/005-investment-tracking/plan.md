# Implementation Plan: Investment Tracking

**Branch**: `005-investment-tracking` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-investment-tracking/spec.md`

## Summary

Allow users to manually log actual investment amounts per instrument per month, compare them to the planner's suggestions, and review cumulative progress over time — all client-side, persisted in localStorage alongside existing PlannerData. The tracking UI is surfaced as a collapsible "Track Investments" section within the existing GoalCard component.

## Technical Context

**Language/Version**: TypeScript 4.x (React 18, CRA / react-scripts 5)
**Primary Dependencies**: MUI v6 (`@mui/material`, `@mui/x-date-pickers` already present), `react-hook-form` (already present), `dayjs` (already present)
**Storage**: Browser `localStorage` via `src/util/storage.ts` — no new key; field added to existing `plannerData` key
**Testing**: Jest + React Testing Library via `react-scripts test`; coverage thresholds enforced (branches 55%, functions/lines/statements 63%)
**Target Platform**: Web browser (evergreen; `crypto.randomUUID()` required — available in all modern browsers)
**Project Type**: Single-project frontend (CRA)
**Performance Goals**: All operations synchronous and local; no network; no perceptible delay
**Constraints**: localStorage only; no backend; single user; no broker/bank integration
**Scale/Scope**: Single user; estimated max ~500 log entries over app lifetime; localStorage footprint negligible

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering (Domain → State → UI) | ✅ Pass | New calculation logic in `src/domain/investmentLog.ts`. Types in `src/types/investmentLog.ts`. Storage extension via existing `src/util/storage.ts` adapter. No business logic in UI components. |
| II. Feature Co-location + Stable Shared Surface | ✅ Pass | All new UI lives under `src/pages/Planner/components/GoalCard/components/`. No new shared components required; existing GoalCard is extended in-place. |
| III. Upgrade-Friendly Boundaries | ✅ Pass | No new third-party UI libraries. Uses `@mui/x-date-pickers` DatePicker already wrapped/used in the codebase. No deep imports. |
| IV. Type Safety and Explicit Contracts | ✅ Pass | All new shapes defined in `src/types/investmentLog.ts`. Payload union in reducer extended with new explicit types. No `any`. |
| V. Predictable Change (Tests Where It Counts) | ✅ Pass | All five domain functions in `investmentLog.ts` get unit tests. GoalCard InvestmentTracker gets a smoke test. Coverage thresholds preserved. |

**Complexity Tracking**: No violations — no justification table needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-investment-tracking/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 developer guide
├── contracts/
│   └── types.ts         # Canonical TypeScript type contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code

```text
src/
├── types/
│   └── investmentLog.ts                          # NEW — InvestmentLogEntry, MonthlyInvestmentSummary, MonthGroup, payload types
│
├── domain/
│   ├── PlannerData.ts                            # MODIFY — add investmentLogs field
│   ├── investmentLog.ts                          # NEW — pure domain functions
│   └── investmentLog.test.ts                     # NEW — unit tests for domain functions
│
├── store/
│   ├── plannerDataActions.ts                     # MODIFY — 3 new action types + creators
│   └── plannerDataReducer.ts                     # MODIFY — 3 new cases + cascade delete + migration
│
└── pages/
    └── Planner/
        └── components/
            └── GoalCard/
                ├── index.tsx                     # MODIFY — trackExpanded state, Track toggle, pass props
                └── components/
                    ├── InvestmentTracker/
                    │   ├── index.tsx             # NEW — comparison table + add button + cumulative totals
                    │   └── index.test.tsx        # NEW — component smoke tests
                    ├── LogEntryForm/
                    │   └── index.tsx             # NEW — modal: month/year picker, type select, amount
                    └── InvestmentLogHistory/
                        └── index.tsx             # NEW — grouped history list with edit/delete
```

**Structure Decision**: Single-project frontend. All new code follows the existing `src/pages/Planner/components/<Component>/` co-location pattern. Domain logic is isolated in `src/domain/` per the constitution.

---

## Phase 0: Research Findings

See [research.md](./research.md) for full decision rationale. Summary:

| Unknown | Decision |
|---------|----------|
| Unique entry ID | `crypto.randomUUID()` — browser-native, no dependency |
| Storage extension | New `investmentLogs` field on `PlannerData`; same localStorage key |
| GoalCard integration | Second collapsible toggle (`trackExpanded`), independent of existing SIP expand |
| Month picker | `@mui/x-date-pickers` DatePicker with `views={['month','year']}` + `maxDate` = current month |
| Cumulative suggested | Current allocations × elapsed months — no allocation snapshot history |
| Comparison default | Default to current month; user navigates to past months via picker |
| Edit scope | Amount-only edits; type and month are immutable after logging |
| Cascade delete | `DELETE_FINANCIAL_GOAL` also removes `investmentLogs[goalId]` |
| GoalCard memo | Add `logEntryCount` prop; include in custom comparator |

---

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) and [contracts/types.ts](./contracts/types.ts) for full entity definitions.

### Data Model Summary

**New type** — `InvestmentLogEntry` (`src/types/investmentLog.ts`):
```
{ id, goalId, investmentName, amount, month, year }
```

**New derived types** — `MonthlyInvestmentSummary`, `MonthGroup` (`src/types/investmentLog.ts`):
```
MonthlyInvestmentSummary { investmentName, suggestedAmount, actualAmount, difference }
MonthGroup               { label, entries }
```

**PlannerData extended** — `investmentLogs: Record<string, InvestmentLogEntry[]>` (default `{}`).

### Domain Functions (`src/domain/investmentLog.ts`)

| Function | Pure? | Tested? |
|----------|-------|---------|
| `getGoalLogs(logs, goalId)` | ✅ | ✅ |
| `calculateCumulativeActual(entries)` | ✅ | ✅ |
| `calculateCumulativeSuggested(suggestions, elapsedMonths)` | ✅ | ✅ |
| `buildMonthlyComparison(entries, suggestions, month, year)` | ✅ | ✅ |
| `groupLogsByMonth(entries)` | ✅ | ✅ |

### Reducer Actions

| Action | Payload |
|--------|---------|
| `ADD_INVESTMENT_LOG_ENTRY` | `{ goalId, entry: InvestmentLogEntry }` |
| `EDIT_INVESTMENT_LOG_ENTRY` | `{ goalId, entryId, amount }` |
| `DELETE_INVESTMENT_LOG_ENTRY` | `{ goalId, entryId }` |
| `DELETE_FINANCIAL_GOAL` *(modified)* | Remove goal + cascade-delete its logs |

### UI Component Responsibilities

**`InvestmentTracker/index.tsx`** (container within GoalCard):
- Receives: `goal`, `investmentSuggestions`, `investmentLogs` (filtered to this goal), `dispatch`
- Renders: month navigator, `MonthlyInvestmentSummary` rows, cumulative totals row, "Log Investment" button
- Delegates: opens `LogEntryForm` modal on button click; opens edit mode in `LogEntryForm` on row edit click
- Renders: `InvestmentLogHistory` below the comparison table

**`LogEntryForm/index.tsx`** (modal):
- Inputs: investment type (select, locked to current suggestions + any historically logged types), month/year (DatePicker, bounded by goal start and current month), amount (number field > 0)
- Mode: "add" (blank form) or "edit" (pre-filled, investment type and month locked)
- On submit: dispatches `ADD_INVESTMENT_LOG_ENTRY` or `EDIT_INVESTMENT_LOG_ENTRY`

**`InvestmentLogHistory/index.tsx`** (history list):
- Groups entries by month (newest first) via `groupLogsByMonth`
- Each entry row: investment name, amount, edit icon, delete icon
- Edit click → opens `LogEntryForm` in edit mode
- Delete click → dispatches `DELETE_INVESTMENT_LOG_ENTRY`

**`GoalCard/index.tsx`** changes:
- New prop: `investmentLogs: Record<string, InvestmentLogEntry[]>`
- New prop: `logEntryCount: number` (for memo comparator)
- New state: `const [trackExpanded, setTrackExpanded] = useState(false)`
- New toggle row (below SIP row): "Track Investments" with entry count badge
- `memo` comparator: add `prevProps.logEntryCount === nextProps.logEntryCount`

### GoalBox / Planner Wiring

`GoalCard` usage sites (GoalBox and wherever `GoalWiseInvestmentBreakdown` data is mapped) need to pass:
- `investmentLogs={plannerData.investmentLogs}` (full map — GoalCard filters by `goal.id`)
- `logEntryCount={(plannerData.investmentLogs[goal.id] ?? []).length}`
- `dispatch={dispatch}`

`dispatch` is already threaded through to `GoalCard` (for the existing delete action), so no new prop drilling is needed beyond the logs.
