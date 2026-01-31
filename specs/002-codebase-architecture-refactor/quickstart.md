# Quickstart Guide: Codebase Architecture Refactor

**Feature**: Codebase Architecture Refactor for Constitution Compliance  
**Branch**: `002-codebase-architecture-refactor`  
**Date**: 2026-01-31  
**Purpose**: Get developers up to speed quickly on this refactoring initiative

---

## 🎯 What We're Doing

Refactoring the codebase to achieve full compliance with the [constitution](../../../.specify/memory/constitution.md) by:
1. Extracting business logic from UI components to domain layer
2. Wrapping third-party components to isolate upgrade impact
3. Consolidating duplicate types and removing `any` types
4. Optimizing React performance with memoization patterns
5. Enforcing architectural boundaries with automated linting

**Goal**: Make the codebase easier to navigate, safer to upgrade, and faster to maintain.

---

## 🚀 Getting Started

### Prerequisites

```bash
# Ensure you have Node.js and npm
node --version  # Should be ≥16
npm --version   # Should be ≥8

# Clone repo and install dependencies
git clone <repo-url>
cd goal-based-financial-planner
npm install
```

### Checkout Feature Branch

```bash
git fetch origin
git checkout 002-codebase-architecture-refactor
```

### Verify Setup

```bash
# Run tests (should all pass)
npm test -- --watchAll=false

# Build (should succeed)
npm run build

# Start dev server
npm start
```

---

## 📂 Where Things Should Live

### File Organization Matrix

| Type of Code | Location | Example |
|--------------|----------|---------|
| **Business logic** (pure functions, calculations) | `src/domain/` | `investmentCalculations.ts` |
| **Domain entities** (classes, validation) | `src/domain/` | `FinancialGoals.ts` |
| **Shared types** | `src/types/` | `planner.ts`, `charts.ts` |
| **Page-specific UI** | `src/pages/[Page]/components/` | `Home/components/AddGoalPopup/` |
| **Shared UI components** | `src/components/` | `DatePicker/`, `StyledBox/` |
| **Hooks** (UI orchestration only) | `src/pages/[Page]/hooks/` | `useInvestmentCalculator.ts` |
| **Side effect adapters** | `src/util/` | `storage.ts` |
| **State management** | `src/store/` | `plannerDataReducer.ts` |

### Import Rules

✅ **Allowed**:
```typescript
// Domain can import from domain, types, util
import { TermType } from '../types/enums';
import { calculateFutureValue } from './investmentCalculations';

// Components can import from components, domain, types, store, util
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { DatePicker } from '../../../../components/DatePicker';

// Pages can import from anywhere (they're at the top of the hierarchy)
import { GoalCard } from './components/GoalCard';
import { calculateTotalMonthlySIP } from '../../domain/investmentCalculations';
```

❌ **Forbidden**:
```typescript
// Domain CANNOT import from UI/components
import { GoalCard } from '../components/GoalCard';  // ❌

// Shared components CANNOT import from pages
import { PlannerProps } from '../pages/Planner';  // ❌

// Types CANNOT import from components
import { GoalCardProps } from '../components/GoalCard';  // ❌
```

---

## 🔨 Common Tasks

### Task 1: Extract Business Logic from Component/Hook

**Before** (logic in hook):
```typescript
// src/pages/Planner/hooks/investmentCalculator.utils.ts
export const calculateSIPFactor = (rate, months, allocation) => {
  // ... calculation logic
};
```

**After** (logic in domain):
```typescript
// src/domain/investmentCalculations.ts
export const calculateSIPFactor = (rate, months, allocation) => {
  // ... same logic, but now in domain layer
};

// src/pages/Planner/hooks/useInvestmentCalculator.ts
import { calculateSIPFactor } from '../../../domain/investmentCalculations';
```

**Steps**:
1. Create domain file if needed: `src/domain/investmentCalculations.ts`
2. Move pure functions to domain file
3. Update imports in hooks/components
4. Move unit tests (or update imports in existing tests)
5. Verify: `grep -r "from 'react'" src/domain/` should return nothing

---

### Task 2: Wrap a Third-Party Component

**Before** (direct usage):
```typescript
// src/pages/Planner/index.tsx
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

<MobileDatePicker value={date} onChange={setDate} />
```

**After** (wrapped):
```typescript
// src/components/DatePicker/index.tsx
export interface DatePickerProps {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  label?: string;
}

export const DatePicker = ({ value, onChange, label }: DatePickerProps) => {
  return <MobileDatePicker value={value} onChange={onChange} label={label} />;
};

// src/pages/Planner/index.tsx
import { DatePicker } from '../../components/DatePicker';

<DatePicker value={date} onChange={setDate} />
```

**Steps**:
1. Create wrapper component in `src/components/[ComponentName]/`
2. Define clean prop interface (hide MUI-specific props)
3. Export wrapper as default or named export
4. Update all usages to import wrapper instead of MUI directly
5. Add tests for wrapper component
6. Verify: `grep -r "from '@mui/x-date-pickers/MobileDatePicker'" src/pages/` should return nothing

---

### Task 3: Consolidate Duplicate Types

**Before** (duplicated types):
```typescript
// File 1: src/pages/Planner/components/TermwiseProgressBox/index.tsx
export type TermTypeWiseProgressData = {
  termType: TermType;
  termTypeWiseData: TermTypeWiseData;
};

// File 2: src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx
export type TermTypeWiseProgressData = {
  termType: string;  // ⚠️ Different type!
  termTypeWiseData: TermTypeWiseData;
};
```

**After** (consolidated):
```typescript
// src/types/planner.ts
export type TermTypeWiseData = {
  goalNames: string[];
  termTypeSum: number;
  progressPercent: number;
};

export type TermTypeWiseProgressData = {
  termType: TermType;  // ✅ Consistent type
  termTypeWiseData: TermTypeWiseData;
};

// Both component files
import { TermTypeWiseProgressData } from '../../../../types/planner';
```

**Steps**:
1. Create shared type file if needed: `src/types/planner.ts`
2. Define type once with correct shape
3. Export type from shared location
4. Update imports in all consuming files
5. Remove duplicate definitions
6. Verify: `npm run build` succeeds without type errors

---

### Task 4: Replace `any` Types

**Before**:
```typescript
// src/pages/Planner/components/GoalCard/index.tsx
interface GoalCardProps {
  goal: FinancialGoal;
  dispatch: any;  // ❌ Unsafe
  currentValue: number;
}
```

**After**:
```typescript
// src/pages/Planner/components/GoalCard/index.tsx
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

interface GoalCardProps {
  goal: FinancialGoal;
  dispatch: Dispatch<PlannerDataAction>;  // ✅ Type-safe
  currentValue: number;
}
```

**Steps**:
1. Identify the correct type (e.g., `Dispatch<ActionType>` for dispatch)
2. Import necessary types
3. Replace `any` with specific type
4. If type doesn't exist, create it (e.g., action payload union)
5. Verify: `npm run build` succeeds and provides better autocomplete

---

### Task 5: Add Performance Optimizations

**Before** (no memoization):
```typescript
const GoalCard = ({ goal, dispatch, currentValue }) => {
  const handleDelete = () => deleteFinancialGoal(dispatch, goal.id);
  
  const total = investmentSuggestions.reduce((sum, s) => sum + s.amount, 0);
  
  return <div>{/* ... */}</div>;
};
```

**After** (optimized):
```typescript
const GoalCard = React.memo(({ goal, dispatch, currentValue, investmentSuggestions }) => {
  // ✅ Memoize callback (stable reference)
  const handleDelete = useCallback(() => {
    deleteFinancialGoal(dispatch, goal.id);
  }, [dispatch, goal.id]);
  
  // ✅ Memoize expensive calculation
  const total = useMemo(() => {
    return investmentSuggestions.reduce((sum, s) => sum + s.amount, 0);
  }, [investmentSuggestions]);
  
  return <div>{/* ... */}</div>;
}, (prevProps, nextProps) => {
  // ✅ Custom comparison for better control
  return prevProps.goal.id === nextProps.goal.id &&
         prevProps.currentValue === nextProps.currentValue;
});
```

**When to use each**:
- `React.memo` - Prevent component re-renders when props unchanged
- `useMemo` - Cache expensive calculations (>1ms, or 100+ items)
- `useCallback` - Stable function references for memoized children

**Steps**:
1. Profile component with React DevTools before changes
2. Identify expensive operations (renders, calculations)
3. Apply appropriate memoization
4. Profile again to verify improvement (target: 30% reduction)
5. Ensure dependencies arrays are correct

---

## 🧪 Testing Your Changes

### Run Tests Locally

```bash
# Run all tests
npm test -- --watchAll=false

# Run specific test file
npm test -- GoalCard.test.tsx --watchAll=false

# Run with coverage
npm run test:cov

# Check coverage for specific file
npm test -- --coverage --collectCoverageFrom="src/domain/investmentCalculations.ts" --watchAll=false
```

### Check Coverage Thresholds

Current thresholds (must maintain):
- Lines: 63%
- Functions: 63%
- Statements: 63%
- Branches: 55%

Target for domain calculations: 90%

### Profile Performance

```bash
# Start dev server
npm start

# Open React DevTools in browser
# Go to Profiler tab
# Click "Record" button
# Interact with app (change date, add goal)
# Click "Stop" button
# Review flamegraph and render counts
```

---

## 🔍 Verification Checklist

Before submitting a PR, verify:

### Automated Checks
- [ ] `npm test -- --watchAll=false` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test:cov` meets thresholds (≥63%)
- [ ] No ESLint errors: `npm run lint` (if configured)

### Manual Checks
- [ ] No React imports in `src/domain/`
- [ ] No `any` types without justification comments
- [ ] Component names use PascalCase
- [ ] Hook names use `useThing` pattern
- [ ] No third-party components used directly in pages (wrapped in `src/components/`)
- [ ] No cross-layer violations (domain importing from UI, shared components importing from pages)

### Constitution Alignment
- [ ] Business logic in domain layer (Principle I)
- [ ] Page-specific code colocated (Principle II)
- [ ] Third-party components wrapped (Principle III)
- [ ] Types are explicit and safe (Principle IV)
- [ ] Tests added/updated for changes (Principle V)

---

## 📖 Reference Documents

- [**Specification**](./spec.md) - User stories and requirements
- [**Implementation Plan**](./plan.md) - Technical context and constitution check
- [**Research**](./research.md) - Audit findings and decisions
- [**Data Model**](./data-model.md) - Type definitions and relationships
- [**Contracts**](./contracts/README.md) - Refactoring agreements and verification
- [**Constitution**](../../../.specify/memory/constitution.md) - Architectural principles

---

## 🆘 Getting Help

### Common Issues

**Issue**: "Cannot find module '../domain/investmentCalculations'"
- **Fix**: Check file path is correct; domain files moved to `src/domain/`

**Issue**: "Type 'any' is not assignable to parameter of type 'Dispatch<PlannerDataAction>'"
- **Fix**: Update `any` types to proper types (see Task 4 above)

**Issue**: "Tests failing after moving functions to domain"
- **Fix**: Update test imports to point to new location

**Issue**: "ESLint error: Import from 'pages' not allowed in 'components'"
- **Fix**: Shared components can't import from pages; extract shared code

### Questions?

- Check [contracts document](./contracts/README.md) for specific agreements
- Review [research findings](./research.md) for context on decisions
- See [constitution](../../../.specify/memory/constitution.md) for architectural principles
- Ask in team chat/PR comments for clarification

---

## 🚢 PR Strategy

Submit PRs in this sequence:

1. **Type Consolidation** - Create shared type files
2. **Business Logic Extraction** - Move calculations to domain
3. **Type Safety** - Replace `any` types
4. **Component Wrapping** - Wrap DatePicker and other components
5. **Performance** - Add memoization patterns
6. **Cleanup** - Remove old/duplicate code
7. **Linting** - Add boundary enforcement

Keep each PR small (<500 lines changed) and focused on one concern.

---

## 🎓 Learning Resources

### React Performance
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [useMemo documentation](https://react.dev/reference/react/useMemo)
- [useCallback documentation](https://react.dev/reference/react/useCallback)
- [React.memo documentation](https://react.dev/reference/react/memo)

### TypeScript Best Practices
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

### Architecture Patterns
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)

---

**Ready to start?** Pick a contract from the [contracts document](./contracts/README.md) and start refactoring! 🎉
