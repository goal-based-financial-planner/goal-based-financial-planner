# Data Model: Investment Tracking

**Branch**: `005-investment-tracking`
**Date**: 2026-02-28

---

## New Type: `InvestmentLogEntry`

**File**: `src/types/investmentLog.ts` *(new)*

Represents one recorded actual investment — a single user action of logging money invested in a given instrument for a given month.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | UUID, unique, immutable | Generated via `crypto.randomUUID()` at creation. Used to identify the entry for edit and delete. |
| `goalId` | `string` | Non-empty, must match an existing `FinancialGoal.id` | Links the entry to its parent goal. |
| `investmentName` | `string` | Non-empty, matched by string equality to suggestion names | Investment instrument name (e.g., "Large Cap Equity Mutual Funds"). Historical entries preserve the name even if it is removed from current suggestions. |
| `amount` | `number` | > 0, finite | Actual amount invested in Indian Rupees. |
| `month` | `number` | 1–12 | Month of the investment. |
| `year` | `number` | ≥ goal start year, ≤ current year | Year of the investment. |

**Validation rules**:
- `amount` must be strictly positive (> 0). Zero and negative values are rejected at form level.
- `month` + `year` must not precede the parent goal's `startDate` (FR-009).
- `month` + `year` must not exceed the current calendar month and year (FR-009, future-date restriction).

---

## Modified Type: `PlannerData`

**File**: `src/domain/PlannerData.ts` *(extend)*

| New Field | Type | Default | Description |
|-----------|------|---------|-------------|
| `investmentLogs` | `Record<string, InvestmentLogEntry[]>` | `{}` | Map from `goalId` to the list of all log entries for that goal. Ordering within the array is insertion order; views sort as needed. |

**Backward-compatible migration**: When parsing existing localStorage data that lacks `investmentLogs`, the field defaults to `{}`.

---

## Derived View: `MonthlyInvestmentSummary`

**File**: `src/types/investmentLog.ts` *(new, derived only — never persisted)*

Used in the comparison view to align suggested amounts with actual amounts for a given month.

| Field | Type | Description |
|-------|------|-------------|
| `investmentName` | `string` | Investment instrument name. |
| `suggestedAmount` | `number` | The current suggestion amount for this instrument (from `InvestmentSuggestion.amount`). |
| `actualAmount` | `number` | Sum of all log entries for this `investmentName` in the selected month/year. Zero if no entries exist. |
| `difference` | `number` | `actualAmount - suggestedAmount`. Negative = shortfall; positive = surplus. |

---

## Domain Functions

**File**: `src/domain/investmentLog.ts` *(new)*

Pure functions; no side effects; fully unit-testable.

| Function | Signature | Description |
|----------|-----------|-------------|
| `getGoalLogs` | `(logs: Record<string, InvestmentLogEntry[]>, goalId: string) => InvestmentLogEntry[]` | Returns all entries for a goal, or `[]` if none. |
| `calculateCumulativeActual` | `(entries: InvestmentLogEntry[]) => number` | Sum of all `entry.amount` values in the array. |
| `calculateCumulativeSuggested` | `(suggestions: InvestmentSuggestion[], elapsedMonths: number) => number` | Sum of all `suggestion.amount` × `elapsedMonths`. Uses current allocations retroactively. |
| `buildMonthlyComparison` | `(entries: InvestmentLogEntry[], suggestions: InvestmentSuggestion[], month: number, year: number) => MonthlyInvestmentSummary[]` | Joins suggestion list with actual entries for the given month. Returns one row per suggestion (with `actualAmount` defaulting to 0). |
| `groupLogsByMonth` | `(entries: InvestmentLogEntry[]) => { label: string; entries: InvestmentLogEntry[] }[]` | Groups entries by `year-month` and returns them sorted newest-first. |

---

## State Management Extension

**File**: `src/store/plannerDataActions.ts` *(extend)*

Three new action types added to `PlannerDataActionType`:

| Action | Payload | Description |
|--------|---------|-------------|
| `ADD_INVESTMENT_LOG_ENTRY` | `{ goalId: string; entry: InvestmentLogEntry }` | Appends a new entry to `investmentLogs[goalId]`. |
| `EDIT_INVESTMENT_LOG_ENTRY` | `{ goalId: string; entryId: string; amount: number }` | Updates `amount` on the entry matching `entryId`. |
| `DELETE_INVESTMENT_LOG_ENTRY` | `{ goalId: string; entryId: string }` | Removes the entry matching `entryId` from the goal's log. |

`DELETE_FINANCIAL_GOAL` *(modified)*: Also deletes `investmentLogs[goalId]` when a goal is removed.

---

## Lifecycle / State Transitions

```
InvestmentLogEntry lifecycle:

  [Not exists]
      |
      | ADD_INVESTMENT_LOG_ENTRY
      v
  [Persisted in investmentLogs[goalId]]
      |           |
      |           | DELETE_INVESTMENT_LOG_ENTRY
      |           v
      |       [Removed]
      |
      | EDIT_INVESTMENT_LOG_ENTRY (amount only)
      v
  [Persisted, amount updated]

  When parent goal is deleted:
      DELETE_FINANCIAL_GOAL → all entries for goalId are also removed
```

---

## Storage Footprint

All investment logs are serialised as part of the existing `plannerData` localStorage key. Each `InvestmentLogEntry` is ~100 bytes of JSON. A user with 3 goals tracking monthly for 5 years ≈ 180 entries ≈ ~18KB — negligible for localStorage (typical limit: 5MB).
