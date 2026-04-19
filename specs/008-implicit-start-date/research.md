# Research: Implicit Goal Start Date and Auto Investment Tracking

## 1. How `startDate` is currently used across the codebase

### Decision
`startDate` must be removed from the `FinancialGoal` class and replaced with `createdAt`. All downstream call sites that reference `startDate` must be updated.

### Findings

`startDate` appears in 7 distinct locations:

| File | Usage |
|------|-------|
| `src/domain/FinancialGoals.ts` | Constructor param; stored as field; used in `getInvestmentStartDate()`, `getTerm()`, `getMonthTerm()`, `getElapsedMonths()` |
| `src/pages/Planner/components/GoalCard/index.tsx:64` | `goal.startDate` used directly for the `goalDuration` display string |
| `src/store/plannerDataReducer.ts:165` | `UPDATE_FINANCIAL_GOAL` case mutates `goalToBeUpdated.startDate` |
| `src/pages/Home/components/FinancialGoalForm/index.tsx` | `startDate` state, `handleStartYearChange`, `DatePicker` field, passed to `new FinancialGoal(...)` |
| `src/util/storage/localFileProvider.ts:215` | `g.startDate` passed to `new FinancialGoal(...)` during deserialisation |
| `src/util/storage/googleDriveProvider.ts` | Likely same pattern as localFileProvider — needs same migration treatment |
| `src/pages/Planner/index.tsx` | `selectedDate` state drives `isGoalActive` filtering and `completedGoals` computation |

### Rationale
A clean field rename (`startDate` → `createdAt`) with auto-assignment at construction time eliminates the entire date-picker UX. The remaining usages are mechanical updates with no business logic changes.

---

## 2. How `getMonthTerm()` and `getTerm()` should change

### Decision
Both methods should compute from **today** (not from `createdAt`) so the SIP auto-updates daily.

### Findings

**Current**: `getMonthTerm()` = `targetDate − startDate` in months. This is a fixed number — it never changes after goal creation. The date picker was the workaround that allowed users to manually slide the baseline forward.

**New**: `getMonthTerm()` = `targetDate − today` in months. This makes the remaining term shrink naturally every day, and the SIP grows accordingly — no user action required.

**Inflation term (`getTerm()`)**: Also moves to `targetDate − today` in years. This means inflation adjustment reflects the actual remaining horizon, which is the correct financial behaviour.

**Impact on `getElapsedMonths()`**: `createdAt − today` gives elapsed months since investment started. Used by `calculateCurrentPortfolioValue` to project how much should have accumulated. This remains correct with `createdAt` as the reference.

### Rationale
Using today's date as the baseline for remaining-term calculations is the standard approach in financial planning tools (e.g., SIP calculators). The old `startDate` approach was a workaround for the absence of an auto-date.

---

## 3. Where to apply the legacy migration

### Decision
Migration belongs in **each storage provider's deserialisation path** (`_parsePlannerData` in `localFileProvider.ts` and the equivalent in `googleDriveProvider.ts`).

### Findings

`FinancialGoal` objects are reconstructed from JSON at load time inside `_parsePlannerData`. This is the natural place to inspect whether `createdAt` is missing and fill it with the deploy date.

**Deploy date constant**: A `FEATURE_008_DEPLOY_DATE` constant (value: `'2026-03-29'`, the date this spec was written — to be updated to actual deploy date before merge) should live in `src/domain/constants.ts` alongside `INFLATION_PERCENTAGE`.

**Why not in the reducer?** The reducer handles in-memory actions. By the time data reaches the reducer, it should already be a valid `PlannerData` with all fields present. Mixing migration logic into the reducer would violate the clear-layering principle.

### Rationale
Keeping migration in the storage layer means the domain model (`FinancialGoal`) never sees invalid/missing data. Consistent with how `investmentLogs` fallback is already handled in the same file (line 223–225).

---

## 4. How `currentSavings` affects the SIP calculation

### Decision
`currentSavings` reduces the effective target by its **future value** at goal maturity, using the blended expected return from the goal's investment allocations.

### Findings

The existing calculation pipeline:
1. `getInflationAdjustedTargetAmount()` → inflation-adjusted target (FV of the goal)
2. `calculateTotalMonthlySIP(allocations, target, months)` → required monthly SIP

With `currentSavings`, a new intermediate step is needed:
1. `getInflationAdjustedTargetAmount()` (unchanged)
2. **NEW**: compute `currentSavingsGrowth = FV(currentSavings, remainingMonths, blendedReturn)` — what today's savings will be worth at goal maturity
3. `effectiveTarget = inflationAdjustedTarget − currentSavingsGrowth`
4. `calculateTotalMonthlySIP(allocations, effectiveTarget, months)`

The blended return is already derivable: `sum(allocation.expectedReturnPercentage × allocation.investmentPercentage / 100)` over all allocations for the goal's term type.

**Edge case**: If `currentSavingsGrowth >= inflationAdjustedTarget`, the effective target is ≤ 0. This is the "fully funded" state → SIP = 0, show "fully funded" badge.

### Rationale
Simply subtracting `currentSavings` from the target (without compounding) would underestimate the head start and overstate the required SIP. Compounding is the correct financial treatment and is consistent with how `calculateFutureValue` already works in the codebase.

---

## 5. `isGoalActive` — what replaces it

### Decision
`isGoalActive(goal, selectedDate)` is deleted. Goal status is now derived from **fixed date comparisons against today**.

### Findings

`isGoalActive` had two purposes:
1. Filter out goals whose `startDate` was in the future (not started yet)
2. Filter out goals whose `targetDate` was in the past (expired)

With `createdAt` as the auto start date, purpose (1) is gone — goals start the moment they're created. Purpose (2) becomes: `dayjs().isAfter(goal.targetDate)` → expired.

**`Planner/index.tsx`**: The `selectedDate`-based `completedGoals` memo can be replaced with a simple today-based expired check. The `selectedDate` state, `handleChange`, `DatePicker` component, `datePickerRef`, and `CalendarIcon` import are all removed.

**`GoalBox/index.tsx`**: `selectedDate` prop removed. `pendingGoals` and `completedGoals` filters change to use `dayjs()` directly. The "completed" tab label changes to "Expired" to match the updated spec terminology.

### Rationale
Removing the external `selectedDate` parameter simplifies the component tree (no prop drilling) and makes goal status a deterministic function of the goal's own data plus the current timestamp.

---

## 6. New action needed: update `currentSavings` per goal

### Decision
Add `UPDATE_GOAL_CURRENT_SAVINGS` to `PlannerDataActionType`. Wire it in the reducer and expose it via a new `updateGoalCurrentSavings` action creator.

### Findings

`currentSavings` is editable by the user at any time (per FR-004). The existing pattern for per-goal mutations is `UPDATE_FINANCIAL_GOAL`. However, that action is tightly coupled to `startYear`/`targetYear`/`targetAmount` and is used by the goal edit form. A dedicated action keeps concerns separate and avoids widening the `UPDATE_FINANCIAL_GOAL` payload further.

The `GoalCard` component becomes the edit surface for `currentSavings` — a small inline text field with a confirm action, following the same pattern as other inline edits in the codebase.

### Rationale
Dedicated action types keep the reducer readable and payloads narrow (Principle IV: explicit contracts). The `UPDATE_FINANCIAL_GOAL` payload is already straining its union type — no need to expand it further.
