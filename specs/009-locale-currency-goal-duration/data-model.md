# Data Model: Locale Currency Formatting and Recurring Goal Duration

**Feature**: 009-locale-currency-goal-duration  
**Date**: 2026-04-11

---

## Changed Entity: FinancialGoal

**File**: `src/domain/FinancialGoals.ts`

### Field Changes

| Field | Before | After | Notes |
|-------|--------|-------|-------|
| `recurringDurationYears` | _(absent)_ | `number \| undefined` | Optional. Only meaningful when `goalType === RECURRING`. Valid range: 1–3. Defaults to `1` when absent (backward compat). |

### Constructor Signature Change

```ts
// Before
constructor(
  goalName: string,
  goalType: GoalType,
  startDate: string,
  targetDate: string,
  targetAmount: number,
)

// After
constructor(
  goalName: string,
  goalType: GoalType,
  startDate: string,
  targetDate: string,
  targetAmount: number,
  recurringDurationYears?: number,   // NEW — optional, valid 1–3
)
```

### Method Behavior Changes

| Method | Before | After |
|--------|--------|-------|
| `getTerm()` | Returns `1` for RECURRING | Returns `this.recurringDurationYears ?? 1` for RECURRING |
| `getMonthTerm()` | Returns `12` for RECURRING | Returns `(this.recurringDurationYears ?? 1) * 12` for RECURRING |
| `getTermType()` | RECURRING always SHORT_TERM (via hardcoded 12-month term) | Still SHORT_TERM — all valid durations (12–36 months) fall within the ≤36 month SHORT_TERM threshold |
| `getInflationAdjustedTargetAmount()` | Returns `targetAmount` unchanged for RECURRING | Unchanged — no inflation adjustment for recurring goals |

### Derived Display Value (Not Stored)

The **yearly target** shown in `RecurringGoalsTable` is a display-only derivation:

```
yearlyTargetDisplay = goal.getTargetAmount() / (goal.recurringDurationYears ?? 1)
```

This is computed in the component, not persisted as a field.

### Validation Rules (enforced in FinancialGoalForm)

| Field | Rule |
|-------|------|
| `recurringDurationYears` | Required for RECURRING goals. Must be a whole integer. Must satisfy `1 ≤ value ≤ 3`. |

---

## Changed Utility: formatCompactCurrency

**File**: `src/types/util.ts`

### New Function

```ts
/**
 * Formats a number as a compact currency string for chart axis labels.
 * Uses locale-appropriate magnitude suffixes:
 * - INR: ₹10.5Cr (crore), ₹3.5L (lakh)
 * - Others: $10.5M (million), $3.5K (thousand)
 *
 * Falls back to formatCurrency for values below threshold.
 */
export const formatCompactCurrency = (num: number): string
```

### Behavior by Locale

| Locale/Currency | >= 10,000,000 | >= 100,000 | >= 1,000 | < 1,000 |
|-----------------|---------------|------------|----------|---------|
| INR (en-IN, hi-IN) | `₹10.5Cr` | `₹3.5L` | — | `formatCurrency(num, 'INR')` |
| USD (en-US) | — | — | `$3.5K` | `formatCurrency(num, 'USD')` |
| USD (en-US) | `$10.5M` | — | `$3.5K` | `formatCurrency(num, 'USD')` |
| EUR (de-DE, fr-FR) | `€10.5M` | — | `€3.5K` | `formatCurrency(num, 'EUR')` |
| GBP (en-GB) | `£10.5M` | — | `£3.5K` | `formatCurrency(num, 'GBP')` |

---

## Storage Serialization

### Stored JSON Shape (after this feature)

```json
{
  "financialGoals": [
    {
      "id": "...",
      "goalName": "Vacation",
      "goalType": "Recurring",
      "startDate": "",
      "targetDate": "",
      "targetAmount": 120000,
      "recurringDurationYears": 2
    }
  ]
}
```

### Backward Compatibility

Old files without `recurringDurationYears` are loaded safely:
- `g.recurringDurationYears` will be `undefined`
- Constructor receives `undefined`, sets `this.recurringDurationYears = undefined`
- `getTerm()` / `getMonthTerm()` use `?? 1` fallback → behavior identical to pre-feature

---

## Files Requiring No Data Model Changes

The following files change only their **display layer** (replacing `₹{formatNumber()}` with `formatCurrency()` or `formatCompactCurrency()`), with no data model impact:

- `GoalCard/index.tsx`
- `GoalCard/InvestmentTracker/index.tsx`
- `GoalCard/InvestmentLogHistory/index.tsx`
- `GoalCard/LogEntryForm/index.tsx`
- `TermwiseProgressBox/index.tsx`
- `CustomLegend/index.tsx`
- `CongratulationsPage/index.tsx`
