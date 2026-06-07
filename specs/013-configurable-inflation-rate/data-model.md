# Data Model: User-Configurable Inflation Rate

**Feature**: 013-configurable-inflation-rate  
**Date**: 2026-05-13

## Changed Entity: PlannerData

**File**: `src/domain/PlannerData.ts`

### New field

| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `inflationRate` | `number` | `DEFAULT_INFLATION_RATE` (5) | 0–20 | Annual inflation rate as a percentage applied to all goal target amounts |

### Updated constructor signature

```
constructor(
  financialGoals: FinancialGoal[] = [],
  investmentAllocations: InvestmentAllocationsType = { ... },
  investmentLogs: SIPEntry[] = [],
  inflationRate: number = DEFAULT_INFLATION_RATE,
)
```

The existing `_investmentOptions` unused parameter (4th positional arg) is already present in the constructor; `inflationRate` is added as the new 5th parameter with a default, ensuring all existing `new PlannerData(...)` call sites remain valid without changes.

### Validation rules

- `inflationRate` MUST be a finite number in the range [0, 20] inclusive.
- Values outside [0, 20] MUST be rejected at the UI layer (FR-010) before being dispatched.
- The stored value is rounded to 2 decimal places.

### Persistence

`PlannerData` is serialized as JSON by both `localFileProvider` and `googleDriveProvider`. The new `inflationRate` field is included automatically. Legacy plan files without the field deserialize with `undefined`, which the constructor default resolves to 5 — preserving backward compatibility (SC-003).

---

## Changed Method: FinancialGoal.getInflationAdjustedTargetAmount()

**File**: `src/domain/FinancialGoals.ts`

### Before

```typescript
getInflationAdjustedTargetAmount(): number {
  if (this.goalType === GoalType.RECURRING) {
    return this.targetAmount;           // ← no inflation applied
  }
  const term = this.getTerm();
  const inflatedAmount = this.targetAmount * Math.pow(1 + INFLATION_PERCENTAGE / 100, term);
  return Math.round((inflatedAmount + Number.EPSILON) * 100) / 100;
}
```

### After

```typescript
getInflationAdjustedTargetAmount(inflationRate: number = DEFAULT_INFLATION_RATE): number {
  const term = this.goalType === GoalType.RECURRING
    ? (this.recurringDurationYears ?? 1)
    : this.getTerm();
  const inflatedAmount = this.targetAmount * Math.pow(1 + inflationRate / 100, term);
  return Math.round((inflatedAmount + Number.EPSILON) * 100) / 100;
}
```

**Key changes**:
- Accepts `inflationRate` as an explicit parameter (default: `DEFAULT_INFLATION_RATE`)
- Recurring goals now use `recurringDurationYears ?? 1` as the exponent instead of returning early
- Removes dependency on the global `INFLATION_PERCENTAGE` constant at call time

---

## New Constant: DEFAULT_INFLATION_RATE

**File**: `src/domain/constants.ts`

```typescript
// Before
export const INFLATION_PERCENTAGE = 5;

// After
export const DEFAULT_INFLATION_RATE = 5;
```

All existing references to `INFLATION_PERCENTAGE` in the codebase are updated to `DEFAULT_INFLATION_RATE`. (There is only one: the import in `FinancialGoals.ts`.)

---

## New Action: UPDATE_INFLATION_RATE

**File**: `src/store/plannerDataActions.ts`

```typescript
// Enum addition
UPDATE_INFLATION_RATE = 'UPDATE_INFLATION_RATE',

// Action creator
export function updateInflationRate(
  dispatch: Dispatch<PlannerDataAction>,
  inflationRate: number,
) {
  dispatch({ payload: inflationRate, type: PlannerDataActionType.UPDATE_INFLATION_RATE });
}
```

**File**: `src/store/plannerDataReducer.ts`

```typescript
// Payload union addition
| number  // UPDATE_INFLATION_RATE

// Reducer case
case PlannerDataActionType.UPDATE_INFLATION_RATE:
  return new PlannerData(
    state.financialGoals,
    state.investmentAllocations,
    state.investmentLogs,
    action.payload as number,
  );
```

Additionally, all existing `new PlannerData(...)` calls in the reducer that spread `state` must forward `state.inflationRate` as the 5th argument so the field is not lost during other mutations.

---

## State transitions

```
User edits inflation rate input
        │
        ▼ (on blur / enter)
Validate: 0 ≤ value ≤ 20
        │
  ┌─────┴──────┐
  │ invalid    │ valid
  ▼            ▼
Show error   dispatch(UPDATE_INFLATION_RATE, value)
             │
             ▼
         plannerDataReducer → new PlannerData with inflationRate
             │
             ▼
         All useMemo blocks re-run (inflation-adjusted targets, SIP amounts)
             │
             ▼
         Autosave triggers (existing StorageProviderContext listener)
```
