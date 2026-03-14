# Research: Investment Tracking

**Phase**: 0 — Outline & Research
**Branch**: `005-investment-tracking`
**Date**: 2026-02-28

---

## 1. Unique Entry Identifier

**Decision**: Use `crypto.randomUUID()` for `InvestmentLogEntry.id`.

**Rationale**: Browser-native (no added dependency), collision-safe, synchronous, already available in all evergreen browsers. The app has no server and no sequence generator, so a UUID is the right primitive.

**Alternatives considered**:
- `Date.now() + Math.random()` — collision risk on rapid successive entries; rejected.
- `nanoid` library — adds a dependency for something the browser already provides natively; rejected.

---

## 2. Storage Layer Extension

**Decision**: Add `investmentLogs: Record<string, InvestmentLogEntry[]>` as a new field on `PlannerData`. Persist alongside existing `financialGoals` and `investmentAllocations` in the same `plannerData` localStorage key.

**Rationale**: The app already serialises `PlannerData` as a single JSON blob via `setPlannerData()`. Adding one new field keeps the storage surface minimal, avoids a second `localStorage` key, and makes the existing `persistPlannerData()` call in `Home/index.tsx` automatically persist log data with no changes to the persistence trigger.

**Migration**: `getInitialData()` uses `parsedState.investmentLogs ?? {}` to default gracefully when reading old data without the field. No explicit migration script is needed.

**Alternatives considered**:
- Separate `localStorage` key for investment logs — increases surface area and requires a separate read/write adapter; rejected.
- IndexedDB — unnecessary complexity for single-user, low-volume log data; rejected.

---

## 3. GoalCard Track Section Integration

**Decision**: Add a second collapsible toggle row in GoalCard (below the existing "Monthly SIP" row), labelled "Track Investments". It controls a separate `trackExpanded` boolean state. The two sections (SIP breakdown, Track) collapse independently.

**Rationale**: The existing `expanded` state only controls the SIP breakdown `<Collapse>`. Adding a parallel `trackExpanded` state (same local `useState` pattern) adds the feature with zero impact on the existing expand/collapse behaviour. Users see a familiar interaction pattern.

**Alternatives considered**:
- MUI `Tabs` within GoalCard (like GoalBox) — heavier component, adds navigation chrome inside an already-compact card; rejected.
- Separate modal triggered from GoalCard — breaks the spec requirement that tracking is accessible within two interactions from the goal summary (FR-012 + SC-003); rejected.

---

## 4. Month/Year Picker

**Decision**: Use `@mui/x-date-pickers` `DatePicker` with `views={['month', 'year']}` and `openTo="month"`. This dependency already exists in the project.

**Rationale**: No new dependency. The existing `DatePicker` wrapper in `src/components/DatePicker/` uses the same library. Month/year-only view satisfies the entry granularity (one entry per investment type per month).

**Max date constraint**: Set `maxDate` to the current month to enforce FR-009 (no future months). `minDate` set to goal start date.

---

## 5. Cumulative Suggested Calculation

**Decision**: `calculateCumulativeSuggested(suggestions, elapsedMonths)` = sum of all `suggestion.amount` values × `elapsedMonths`. Always uses current allocation amounts (not snapshotted past values), per clarification Q3.

**Rationale**: This matches the clarified requirement and avoids the need to store a history of allocation states. The same `investmentSuggestions` array that GoalCard already receives is passed into the calculation.

**Edge**: If `elapsedMonths` is 0 (goal just started this month), cumulative suggested = 0. First month counts once elapsed month has passed.

---

## 6. Comparison View — Monthly Actual

**Decision**: For the per-month comparison in the "Track" section, default the selected month to the **current month**. User can navigate to previous months via the month picker. Actual amounts are summed across all log entries for that investment type + month combination.

**Rationale**: Most users will be tracking the most recent month. Defaulting to current month surfaces the most relevant data immediately and satisfies SC-001 (< 30 seconds to log).

---

## 7. Edit vs Re-log

**Decision**: Edit operates on a specific entry identified by its UUID. The form pre-fills with the existing `amount`. Only the amount is editable (investment type and month are immutable after logging to prevent data confusion).

**Rationale**: Allowing users to change the investment type or month on an existing entry could silently corrupt the history log (the old month/type combination would disappear). Restricting edits to the amount is the safest interpretation. Users who need a different type/month should delete and re-log.

---

## 8. Cascade Delete on Goal Deletion

**Decision**: The `DELETE_FINANCIAL_GOAL` reducer case MUST also remove `investmentLogs[goalId]` from state.

**Rationale**: FR-010 explicitly requires this. Without it, orphaned log data accumulates in localStorage indefinitely.

---

## 9. React.memo Custom Comparison in GoalCard

**Decision**: The existing custom `memo` comparator in GoalCard will need to include `investmentLogs` in its comparison to ensure the Track section re-renders when log entries change.

**Rationale**: The current comparator only checks `goal.id`, `currentValue`, and `investmentSuggestions.length`. If log entries change (add/edit/delete), the card must re-render. The simplest fix is to pass `logEntryCount` as a prop and include it in the comparator, keeping the comparator shallow.
