# Quickstart: Locale Currency Formatting and Recurring Goal Duration

**Feature**: 009-locale-currency-goal-duration  
**Date**: 2026-04-11

---

## How to test Feature 1: Locale Currency

To test locale-aware currency display without changing your OS settings, open your browser's developer tools and override the locale:

**Chrome DevTools:**
1. Open DevTools → three-dot menu → More tools → Sensors
2. Set "Locale override" to `en-US`, `de-DE`, `hi-IN`, etc.
3. Refresh the app — all currency amounts should update to the locale's format.

Alternatively, use the `getUserLocale` / `setUserLocale` functions directly in the console:

```js
// Simulate US locale
localStorage.setItem('preferred_locale', 'en-US');
location.reload();

// Simulate Indian locale
localStorage.setItem('preferred_locale', 'en-IN');
location.reload();

// Clear override (revert to browser default)
localStorage.removeItem('preferred_locale');
```

---

## How to test Feature 2: Recurring Goal Duration

1. Start the dev server: `npm run dev` (or `npm start`)
2. Open the app and navigate to the goal planner.
3. Click "Add Goal" and select **Recurring** goal type.
4. A new **Duration** field (1–3 years) should appear below the goal type selector.
5. Enter a target amount (e.g., 120000) and duration of 2.
6. Save the goal and navigate to the Planner view.
7. The recurring goals table should show:
   - **Duration**: 2 years
   - **Yearly Target**: 60,000 (120,000 ÷ 2)
8. The monthly SIP suggestion should be: 5,000/mo (120,000 ÷ 24 months)

**Validation tests:**
- Enter duration `0` → form should show error, goal should not save
- Enter duration `4` → form should show error
- Enter duration `1.5` → form should show error (non-integer)
- Leave duration blank → form should show error

---

## Run Tests

```bash
# Run all tests
npm test

# Run specific test suites relevant to this feature
npx vitest run src/types/util.test.tsx
npx vitest run src/domain/FinancialGoals.test.ts
npx vitest run src/pages/Planner/components/RecurringGoalsTable
```

---

## Key Files at a Glance

| File | What changed |
|------|-------------|
| `src/types/util.ts` | + `formatCompactCurrency()` |
| `src/domain/FinancialGoals.ts` | + `recurringDurationYears` field; updated `getTerm`/`getMonthTerm` |
| `src/pages/Home/components/FinancialGoalForm/index.tsx` | + duration input for recurring goals |
| `src/pages/Planner/components/RecurringGoalsTable/index.tsx` | + Duration column; derived yearly target |
| `src/util/storage/localFileProvider.ts` | Pass `recurringDurationYears` on deserialization |
| `src/util/storage/googleDriveProvider.ts` | Pass `recurringDurationYears` on deserialization |
| `src/pages/Planner/components/GoalCard/index.tsx` | ₹ → `formatCurrency` |
| `src/pages/Planner/components/GoalCard/components/InvestmentTracker/index.tsx` | Y-axis + amounts → `formatCompactCurrency` / `formatCurrency` |
| `src/pages/Planner/components/GoalCard/components/InvestmentLogHistory/index.tsx` | ₹ → `formatCurrency` |
| `src/pages/Planner/components/GoalCard/components/LogEntryForm/index.tsx` | Label ₹ → locale currency symbol |
| `src/pages/Planner/components/TermwiseProgressBox/index.tsx` | ₹ → `formatCurrency` |
| `src/pages/Planner/components/CustomLegend/index.tsx` | `formatNumber` → `formatCurrency` |
| `src/pages/CongratulationsPage/index.tsx` | `formatNumber` → `formatCurrency` |
