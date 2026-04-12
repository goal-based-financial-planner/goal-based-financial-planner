# Research: Locale Currency Formatting and Recurring Goal Duration

**Feature**: 009-locale-currency-goal-duration  
**Date**: 2026-04-11

---

## Topic 1: Locale-Aware Currency Formatting

### Decision
Use `Intl.NumberFormat` (via the existing `formatCurrency` and `formatNumber` utilities in `src/types/util.ts`) for all monetary display. Introduce a new `formatCompactCurrency` helper for chart axis/tooltip abbreviated notation that uses locale to determine both currency symbol and magnitude suffix.

### Rationale
- `formatCurrency` already exists and is locale-aware (detects browser locale via `getUserLocale()`).
- The only gap is: (a) many components still use the hardcoded `₹` prefix with `formatNumber`, and (b) there is no compact formatter for chart Y-axes.
- `Intl.NumberFormat` with `notation: 'compact'` produces locale-appropriate compact output but does not use INR-specific abbreviations like Cr/L. For INR, custom thresholds (10M = 1Cr, 100K = 1L) are needed. For other locales, M/K are standard.
- No new library dependency needed — this is pure browser built-in behavior.

### Compact Formatter Design
```
formatCompactCurrency(v, locale, currency):
  if currency === 'INR':
    v >= 10_000_000 → `₹${(v/10_000_000).toFixed(1)}Cr`
    v >= 100_000    → `₹${(v/100_000).toFixed(1)}L`
    else            → formatCurrency(v, 'INR')
  else (USD, GBP, EUR, JPY, etc.):
    v >= 1_000_000  → `${symbol}${(v/1_000_000).toFixed(1)}M`
    v >= 1_000      → `${symbol}${(v/1_000).toFixed(1)}K`
    else            → formatCurrency(v, currency)
```
Currency symbol for non-INR locales is extracted from a small one-char format call: `(0).toLocaleString(locale, {style:'currency', currency, maximumFractionDigits:0}).replace(/[\d,.\s]/g,'').trim()`.

### Alternatives Considered
- `Intl.NumberFormat notation: 'compact'`: Produces "10M" without currency symbol; requires extra concatenation and doesn't produce Cr/L for INR.
- Chart-level number-only display: Would drop currency context from axes — confusing for multi-goal planners.

---

## Topic 2: Locale-to-Currency Mapping Completeness

### Decision
Extend the existing `localeCurrencyMap` in `formatCurrency` to cover the locales already in `AVAILABLE_LOCALES` (en-IN, hi-IN, en-US, en-GB, de-DE, fr-FR, ja-JP). All unmapped locales fall through to USD default — consistent with clarification Q1.

### Rationale
The existing map already covers the primary locales. No extension needed for the initial feature; the map is centralized and easy to extend later.

---

## Topic 3: Recurring Goal Duration — Domain Model

### Decision
Add an optional `recurringDurationYears?: number` property to `FinancialGoal`. Default to `1` everywhere it is absent (for backward compatibility). Thread through constructor as the 6th optional parameter.

**Updated calculations:**
- `getTerm()` for RECURRING: `this.recurringDurationYears ?? 1`
- `getMonthTerm()` for RECURRING: `(this.recurringDurationYears ?? 1) * 12`
- Term classification: RECURRING goals always remain SHORT_TERM (clarification Q3 answer: B).

**SIP math impact:**
- `calculateTotalMonthlySIP` receives `getMonthTerm()` as the horizon.
- With `recurringDurationYears = 2`, `getMonthTerm() = 24`. The SIP calculator spreads the total target over 24 months.
- The RecurringGoalsTable "Yearly Target" column shows `goal.getTargetAmount() / (goal.recurringDurationYears ?? 1)` — a derived display value, not a stored field.

### Rationale
- Minimal surface change: one new optional field, two updated methods.
- `??` null-coalescing preserves backward compat for goals saved without the field.
- No data migration required: the field is optional; old stored JSON simply won't have it.

### Alternatives Considered
- Storing `recurringDurationMonths`: Rejected — years is the user-visible unit; derived months internally is straightforward.
- Storing a derived `yearlyTarget` field: Rejected — derived state should not be persisted; always compute from `targetAmount ÷ duration`.

---

## Topic 4: Storage Backward Compatibility

### Decision
Update `_parsePlannerData` in both `localFileProvider.ts` and `googleDriveProvider.ts` to pass `g.recurringDurationYears` as the 6th argument to the `FinancialGoal` constructor.

```ts
new FinancialGoal(
  g.goalName, g.goalType, g.startDate, g.targetDate,
  g.targetAmount,
  g.recurringDurationYears,  // undefined for old data → defaults to 1
)
```

No schema version bump needed. `undefined` flows through to the `?? 1` default in the domain class.

### Rationale
The storage layer re-hydrates plain JSON objects into class instances. Adding `g.recurringDurationYears` (which will be `undefined` for pre-existing files) is safe because the domain class defaults to 1 when the value is absent.

---

## Topic 5: Form Validation for Duration

### Decision
Use a simple controlled `TextField` (type="number") with `inputProps={{ min: 1, max: 3 }}` plus explicit validation in the `handleAdd` function (matching the existing pattern for `targetAmount`). The field is only shown when `goalType === GoalType.RECURRING`.

### Rationale
- Consistent with the existing form validation pattern (no library change needed).
- Integer validation: check `Number.isInteger(parsed) && parsed >= 1 && parsed <= 3`.
- Pre-filling with `1` as default keeps the field usable without mandatory entry — the user only needs to change it if not 1 year.
