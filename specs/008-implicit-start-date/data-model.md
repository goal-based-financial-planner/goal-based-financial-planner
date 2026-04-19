# Data Model: Implicit Goal Start Date and Auto Investment Tracking

## Modified Entity: `FinancialGoal`

**File**: `src/domain/FinancialGoals.ts`

### Field changes

| Field | Before | After | Notes |
|-------|--------|-------|-------|
| `startDate: string` | User-supplied date string | **Removed** | Replaced by `createdAt` |
| `createdAt: string` | *(absent)* | `string` (YYYY-MM-DD, auto-set at construction) | Immutable after creation. Set to `dayjs().format('YYYY-MM-DD')` in constructor. Migration: loaded from file if present; defaults to `FEATURE_008_DEPLOY_DATE` constant if absent. |
| `currentSavings?: number` | *(absent)* | `number \| undefined` | Optional. User-editable at any time. Represents actual accumulated savings today. |

### Constructor change

```
Before: FinancialGoal(goalName, goalType, startDate, targetDate, targetAmount)
After:  FinancialGoal(goalName, goalType, targetDate, targetAmount, createdAt?, currentSavings?)
```

- `createdAt` optional param: if omitted, defaults to today's date (normal creation path).
- Provided only during deserialisation (storage providers pass the stored value).
- `currentSavings` optional param: if omitted, defaults to `undefined`.

### Method changes

| Method | Before | After |
|--------|--------|-------|
| `getInvestmentStartDate()` | Returns `startDate` (or today for RECURRING) | Returns `createdAt` (or today for RECURRING) |
| `getTerm()` | `targetDate − startDate` in years | `targetDate − today` in years |
| `getMonthTerm()` | `targetDate − startDate` in months | `targetDate − today` in months (clamped to ≥ 0) |
| `getElapsedMonths()` | `today − startDate` in months | `today − createdAt` in months |

### New method

```
getEffectiveTarget(blendedAnnualReturnPct: number): number
```

Returns the SIP calculation target after accounting for `currentSavings` growth:
- If `currentSavings` is undefined or 0: returns `getInflationAdjustedTargetAmount()`
- Otherwise: `max(0, inflationAdjustedTarget − FV(currentSavings, remainingMonths, blendedReturn))`
- Where `FV` uses the same Annuity Due compounding already in `calculateFutureValue`

### Goal status (derived, not stored)

| Status | Condition |
|--------|-----------|
| Active | `dayjs().isSameOrBefore(targetDate)` AND `getEffectiveTarget(...) > 0` |
| Expired | `dayjs().isAfter(targetDate)` |
| Fully Funded | `getEffectiveTarget(...) <= 0` |

---

## Modified Entity: Storage (serialised `FinancialGoal`)

**Files**: `src/util/storage/localFileProvider.ts`, `src/util/storage/googleDriveProvider.ts`

### Deserialisation migration

When reconstructing a `FinancialGoal` from stored JSON:

```
createdAt  = g.createdAt ?? FEATURE_008_DEPLOY_DATE
currentSavings = typeof g.currentSavings === 'number' && g.currentSavings >= 0
                 ? g.currentSavings
                 : undefined
```

`FEATURE_008_DEPLOY_DATE` is a constant in `src/domain/constants.ts`. Its value must be updated to the actual deploy date before the PR is merged.

`startDate` in legacy files: read but ignored (not passed to constructor).

---

## Modified: Domain Constants

**File**: `src/domain/constants.ts`

New constant:
```
FEATURE_008_DEPLOY_DATE = 'YYYY-MM-DD'  // set to actual deploy date before merge
```

---

## Removed: `isGoalActive` function

**File**: `src/domain/FinancialGoals.ts`

`isGoalActive(goal, selectedDate)` is deleted. Callers replace it with inline status checks:
- Expired check: `dayjs().isAfter(goal.getTargetDate())`
- Active check: `!dayjs().isAfter(goal.getTargetDate())`

---

## Modified: Reducer action

**File**: `src/store/plannerDataReducer.ts` and `src/store/plannerDataActions.ts`

New action type:

```
UPDATE_GOAL_CURRENT_SAVINGS
Payload: { goalId: string; currentSavings: number | undefined }
```

Reducer case: find goal by `goalId`, set `goal.currentSavings = payload.currentSavings`.

`UPDATE_FINANCIAL_GOAL` case: remove `startDate` / `startYear` assignment. Keep `goalName`, `targetDate`, `targetAmount`.

---

## Modified: Calculation pipeline

**File**: `src/pages/Planner/hooks/useInvestmentCalculator.ts`

`calculateInvestmentNeededForGoals(plannerData, selectedDate)` → `calculateInvestmentNeededForGoals(plannerData)`

`calculateInvestmentPerGoal` receives the blended return and passes `goal.getEffectiveTarget(blendedReturn)` to `calculateTotalMonthlySIP` instead of `goal.getInflationAdjustedTargetAmount()`.

Blended annual return for a set of allocations:
```
blendedReturn = sum(a.expectedReturnPercentage × a.investmentPercentage / 100)
```

The `isGoalActive` filtering in `calculateInvestmentNeededForGoals` is replaced:
- Goals where `dayjs().isAfter(targetDate)` → return empty `investmentSuggestions` (expired)
- Goals where `effectiveTarget <= 0` → return empty `investmentSuggestions` (fully funded)

---

## Unchanged

- `InvestmentSuggestion` type
- `GoalWiseInvestmentSuggestions` type
- `calculateTotalMonthlySIP`, `calculateFutureValue`, `calculateSIPFactor`, `verifySIPCalculation` — signatures and logic unchanged
- `PlannerData` class — no field changes
- `InvestmentAllocationsType`, `InvestmentOptions` — no changes
- `investmentLogs` / `SIPEntry` — no changes
