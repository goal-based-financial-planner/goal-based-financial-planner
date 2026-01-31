# Data Model: Codebase Architecture Refactor

**Feature**: Codebase Architecture Refactor for Constitution Compliance  
**Branch**: `002-codebase-architecture-refactor`  
**Date**: 2026-01-31  
**Purpose**: Define the data structures and relationships for refactored codebase architecture

---

## Overview

This refactoring initiative doesn't introduce new domain entities but reorganizes existing code to align with constitution principles. This document defines:
1. **Current domain entities** (existing data model)
2. **New type definitions** to be created during refactoring
3. **File organization contracts** for where types should live

---

## Domain Entities (Existing)

These entities already exist in `src/domain/` and will remain with improved organization:

### 1. FinancialGoal

**Purpose**: Represents a financial goal (one-time or recurring) with target amount, timeline, and investment parameters

**Location**: `src/domain/FinancialGoals.ts`

**Key Attributes**:
- `id: string` - Unique identifier
- `goalName: string` - User-provided goal name
- `targetAmount: number` - Target amount in currency
- `targetDate: Date` - When goal should be achieved
- `investmentStartDate: Date` - When investment begins
- `goalType: GoalType` - ONE_TIME or RECURRING
- `inflationPercentage: number` - Expected inflation rate
- `monthlyAmount?: number` - For recurring goals

**Key Methods**:
- `getInflationAdjustedTargetAmount(): number` - Calculate future value with inflation
- `getMonthTerm(): number` - Calculate investment period in months
- `getTermType(): TermType` - SHORT_TERM, MEDIUM_TERM, or LONG_TERM
- `getElapsedMonths(): number` - Months since investment start

**Validation Rules**:
- Target amount must be positive
- Target date must be in the future
- Investment start date must be before target date
- Goal name must not be empty

**Relationships**:
- One goal → Many investment allocations (through calculator)
- One goal → One term type (derived)

---

### 2. InvestmentOption

**Purpose**: Represents an investment product type with expected returns

**Location**: `src/domain/InvestmentOptions.ts`

**Key Attributes**:
- `investmentName: string` - Name of investment product (e.g., "Equity", "Debt")
- `expectedReturnPercentage: number` - Annual expected return
- `termType: TermType` - Recommended term for this investment
- `color: string` - UI color for visualization

**Validation Rules**:
- Expected return must be non-negative
- Investment name must be unique

**Relationships**:
- One investment option → Many allocations across goals

---

### 3. InvestmentAllocation (InvestmentChoiceType)

**Purpose**: Represents allocation of investment across different products for a goal

**Location**: `src/domain/investmentAllocations.ts`

**Key Attributes**:
- `investmentName: string` - Reference to InvestmentOption
- `investmentPercentage: number` - Percentage allocated (0-100)
- `expectedReturnPercentage: number` - Expected return for this allocation
- `termType: TermType` - Term type for this allocation

**Validation Rules**:
- Percentages across allocations for a goal must sum to 100
- Investment percentage must be 0-100
- Term type must match goal's term type

**Relationships**:
- One allocation → One investment option
- One goal → Many allocations

---

### 4. PlannerData

**Purpose**: Root state object containing all financial planning data

**Location**: `src/domain/PlannerData.ts`

**Key Attributes**:
- `financialGoals: FinancialGoal[]` - Array of all goals
- `investmentOptions: InvestmentOption[]` - Available investment products

**Validation Rules**:
- Financial goals array cannot be null
- Investment options array cannot be empty

**Relationships**:
- Root aggregate containing all domain entities

---

## New Type Definitions (To Be Created)

These types will be created during refactoring to consolidate duplicates and extract inline types:

### 5. Planner-Specific Types

**Location**: `src/types/planner.ts` (new file)

```typescript
import { TermType } from './enums';

/**
 * Aggregated data for a specific term type (short/medium/long)
 */
export type TermTypeWiseData = {
  /** Names of goals in this term category */
  goalNames: string[];
  /** Sum of target amounts for all goals in this term */
  termTypeSum: number;
  /** Progress percentage toward term target (0-100) */
  progressPercent: number;
};

/**
 * Term-based progress tracking data
 */
export type TermTypeWiseProgressData = {
  /** Term category (SHORT_TERM, MEDIUM_TERM, LONG_TERM) */
  termType: TermType;
  /** Aggregated metrics for this term */
  termTypeWiseData: TermTypeWiseData;
};

/**
 * Investment breakdown for a single goal
 */
export type GoalWiseInvestmentBreakdown = {
  /** Goal name */
  goalName: string;
  /** Target amount (inflation-adjusted) */
  targetAmount: number;
  /** Current portfolio value for this goal */
  currentValue: number;
  /** Recommended monthly investments per allocation */
  investmentSuggestions: InvestmentSuggestion[];
};

/**
 * Recommended investment allocation with amount
 */
export type InvestmentSuggestion = {
  /** Investment product name */
  investmentName: string;
  /** Recommended monthly amount */
  amount: number;
  /** Expected annual return percentage */
  expectedReturnPercentage: number;
};

/**
 * Investment breakdown grouped by term type
 */
export type InvestmentBreakdownBasedOnTermType = {
  /** Term category */
  termType: TermType;
  /** Investment breakdowns for goals in this term */
  investmentBreakdown: GoalWiseInvestmentBreakdown[];
};
```

**Consolidates**:
- `TermTypeWiseProgressData` (duplicate in 2 files, inconsistent shapes)
- `TermTypeWiseData` (duplicate in 2 files)
- `GoalWiseInvestmentSuggestions` (used in hooks)
- `InvestmentSuggestion` (used in hooks and components)

---

### 6. Chart-Specific Types

**Location**: `src/types/charts.ts` (new file)

```typescript
/**
 * Generic data point for chart visualizations
 */
export type ChartDataPoint = {
  /** Label for this data point */
  label: string;
  /** Numeric value */
  value: number;
};

/**
 * Mapping of investment names to total amounts
 */
export type InvestmentAmountMap = Record<string, number>;
```

**Consolidates**:
- Inline `{ label: string; value: number }` types in chart components
- Inline `{ [key: string]: number }` types in legend/aggregation code

---

### 7. Goal Summary Types

**Location**: `src/types/goals.ts` (new file)

```typescript
/**
 * Lightweight goal summary for displays/celebrations
 */
export type GoalSummary = {
  /** Goal name */
  name: string;
  /** Target amount */
  amount: number;
};
```

**Consolidates**:
- Inline `{ name: string; amount: number }` in CongratulationsPage

---

### 8. Store Action Types

**Location**: `src/store/plannerDataReducer.ts` (update existing)

```typescript
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';

/**
 * Discriminated union of possible action payloads
 */
export type PlannerDataActionPayload = 
  | PlannerData                    // For SET_PLANNER_DATA
  | FinancialGoal                  // For ADD_FINANCIAL_GOAL
  | string;                        // For DELETE_FINANCIAL_GOAL (goal ID)

/**
 * Redux-style action for planner data mutations
 */
export type PlannerDataAction = {
  /** Action type discriminator */
  type: PlannerDataActionType;
  /** Typed payload (no more `any`) */
  payload: PlannerDataActionPayload;
};
```

**Replaces**:
- `payload: any` in `PlannerDataAction`
- `any` types in action functions

---

### 9. Component Prop Types

**Location**: Co-located with components, but import from shared types

**Pattern**:
```typescript
// src/pages/Planner/components/GoalCard/index.tsx
import { Dispatch } from 'react';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { InvestmentSuggestion } from '../../../../types/planner';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

/**
 * Props for GoalCard component
 */
export interface GoalCardProps {
  /** Financial goal to display */
  goal: FinancialGoal;
  /** Redux-style dispatch function */
  dispatch: Dispatch<PlannerDataAction>;  // Not `any`
  /** Current portfolio value for this goal */
  currentValue: number;
  /** Recommended monthly investments */
  investmentSuggestions?: InvestmentSuggestion[];
}
```

**Principle**:
- Component-specific prop interfaces stay co-located
- Import domain types and shared types (no redeclaration)
- No `any` types for well-known shapes (dispatch, goal, etc.)

---

## File Organization Matrix

| Type Category | Location | Import From |
|--------------|----------|-------------|
| Domain entities (FinancialGoal, InvestmentOption) | `src/domain/` | Domain files |
| Domain calculations (pure functions) | `src/domain/` | Domain files |
| Shared planner types | `src/types/planner.ts` | Types directory |
| Shared chart types | `src/types/charts.ts` | Types directory |
| Shared goal types | `src/types/goals.ts` | Types directory |
| Enums (GoalType, TermType) | `src/types/enums.ts` | Types directory (existing) |
| Constants (inflation, defaults) | `src/domain/constants.ts` | Domain constants |
| Store action types | `src/store/plannerDataReducer.ts` | Store module |
| Component prop types | Co-located with component | Component file (but import shared shapes) |
| Hook return types | Co-located with hook | Hook file (but import shared shapes) |

---

## Type Import Rules

### ✅ Allowed Import Patterns

```typescript
// Domain can import from domain and types
// src/domain/FinancialGoals.ts
import { GoalType, TermType } from '../types/enums';
import { INFLATION_PERCENTAGE } from './constants';

// Components can import from domain, types, store
// src/pages/Planner/components/GoalCard/index.tsx
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { InvestmentSuggestion } from '../../../../types/planner';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

// Types can import from other types
// src/types/planner.ts
import { TermType } from './enums';
```

### ❌ Forbidden Import Patterns

```typescript
// Domain CANNOT import from UI/store/components
// src/domain/FinancialGoals.ts
import { GoalCard } from '../pages/Planner/components/GoalCard'; // ❌ FORBIDDEN

// Shared components CANNOT import from pages
// src/components/DatePicker/index.tsx
import { PlannerProps } from '../pages/Planner'; // ❌ FORBIDDEN

// Types CANNOT import from components/pages
// src/types/planner.ts
import { GoalCardProps } from '../pages/Planner/components/GoalCard'; // ❌ FORBIDDEN
```

---

## State Transitions

### PlannerData State Machine

**States**: N/A (plain data structure, no state machine)

**Transitions** (via reducer actions):
1. `SET_PLANNER_DATA` - Replace entire planner data (initialization, import)
2. `ADD_FINANCIAL_GOAL` - Add new goal to array
3. `DELETE_FINANCIAL_GOAL` - Remove goal by ID

**Invariants**:
- `financialGoals` array always valid (can be empty)
- `investmentOptions` array never empty
- After any transition, data must be valid per domain validation rules

---

## Data Flow Architecture

```
User Input
    ↓
Pages (UI)
    ↓
Store Actions (dispatch)
    ↓
Reducer (state updates)
    ↓
Domain Functions (calculations)
    ↓
Derived State (hooks)
    ↓
Components (presentation)
```

**Key Principles**:
- Data flows down (props)
- Events flow up (callbacks/dispatch)
- Business logic in domain layer (pure functions)
- UI components stay presentational

---

## Validation Strategy

### Domain-Level Validation

**Location**: Domain entity methods (e.g., `FinancialGoal` constructor/setters)

**Responsibilities**:
- Validate individual entity constraints
- Throw errors for invalid data (fail fast)
- Ensure domain invariants

**Example**:
```typescript
// src/domain/FinancialGoals.ts
if (targetAmount <= 0) {
  throw new Error('Target amount must be positive');
}
```

### Type-Level Validation

**Location**: TypeScript types and interfaces

**Responsibilities**:
- Enforce shape correctness at compile time
- Prevent `any` types (constitution requirement)
- Narrow types with discriminated unions

**Example**:
```typescript
// src/types/planner.ts
export type TermTypeWiseData = {
  goalNames: string[];        // Array, not `any`
  termTypeSum: number;         // Number, not `any`
  progressPercent: number;     // Number, not `any`
};
```

### UI-Level Validation

**Location**: Form components (react-hook-form validation)

**Responsibilities**:
- User-friendly validation messages
- Prevent invalid form submissions
- Real-time feedback

**Example**:
```typescript
// src/pages/Home/components/FinancialGoalForm/index.tsx
// (existing pattern - no changes needed)
```

---

## Migration Notes

During refactoring:

1. **Create new type files first** (`src/types/planner.ts`, `src/types/charts.ts`, `src/types/goals.ts`)
2. **Update imports gradually** (file by file, not all at once)
3. **Remove old duplicate definitions** only after all imports updated
4. **Add ESLint rules** to prevent regressions

**Breaking Changes**: None (internal refactoring only, no API changes)

**Backward Compatibility**: Full (all existing functionality preserved)
