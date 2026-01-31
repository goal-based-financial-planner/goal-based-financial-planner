# Research: Codebase Architecture Refactor

**Feature**: Codebase Architecture Refactor for Constitution Compliance  
**Branch**: `002-codebase-architecture-refactor`  
**Date**: 2026-01-31  
**Purpose**: Document findings from codebase audits to inform refactoring decisions

---

## 1. Business Logic Separation Audit

### Finding: Hook utilities contain pure business logic

**Location**: `src/pages/Planner/hooks/investmentCalculator.utils.ts`

**Decision**: Move to `src/domain/investmentCalculations.ts`

**Rationale**:
- All four functions (`calculateSIPFactor`, `calculateTotalMonthlySIP`, `calculateFutureValue`, `verifySIPCalculation`) are pure mathematical formulas
- No React dependencies, no UI concerns, no side effects
- Implement Annuity Due calculation for SIP (Systematic Investment Plan) future value
- These are core financial domain logic that should be testable independently of UI

**Code Examples**:

```typescript
// Pure business logic - should be in domain/
export const calculateSIPFactor = (
  monthlyRate: number,
  months: number,
  allocationPercentage: number,
): number => {
  if (monthlyRate === 0) {
    return months * (allocationPercentage / 100);
  }
  const powerComponent = Math.pow(1 + monthlyRate, months);
  const sipFactor = ((powerComponent - 1) * (1 + monthlyRate)) / monthlyRate;
  return (sipFactor * allocationPercentage) / 100;
};
```

**Alternatives Considered**:
- Keep in hooks as "UI-specific calculations" - Rejected because functions have no UI dependencies
- Create separate `src/calculations/` directory - Rejected because domain layer is the correct home per constitution

---

### Finding: Investment calculator hook has mixed concerns

**Location**: `src/pages/Planner/hooks/useInvestmentCalculator.ts`

**Decision**: Extract business logic to domain, keep UI orchestration in hook

**Rationale**:
- Hook contains both pure business logic (current portfolio value calculation, date filtering) and UI concerns (mapping to presentation types)
- Business logic should be in domain for testability and reuse
- Hook should remain as thin orchestrator calling domain functions

**Extraction Plan**:

1. **Create domain function: `calculateCurrentPortfolioValue`**
   ```typescript
   // src/domain/investmentCalculations.ts
   export const calculateCurrentPortfolioValue(
     goal: FinancialGoal,
     investmentAllocations: InvestmentChoiceType[],
     elapsedMonths: number
   ): number {
     return investmentAllocations
       .map((allocation) => 
         calculateFutureValue(
           allocation.amount,
           Math.min(elapsedMonths, goal.getMonthTerm()),
           allocation.expectedReturnPercentage
         )
       )
       .reduce((acc, cv) => acc + cv, 0);
   }
   ```

2. **Create domain function: `isGoalActive`**
   ```typescript
   // src/domain/FinancialGoals.ts (add to existing file)
   export const isGoalActive(
     goal: FinancialGoal,
     currentDate: Dayjs
   ): boolean {
     return !currentDate.isBefore(goal.getInvestmentStartDate()) &&
            !currentDate.isAfter(goal.getTargetDate());
   }
   ```

3. **Refactor hook to call domain functions**
   - Hook focuses on orchestration and UI type mapping
   - All business logic delegated to domain layer

**Alternatives Considered**:
- Leave all logic in hook - Rejected because violates clear layering principle
- Move entire hook to domain - Rejected because hook has legitimate UI concerns (type mapping, using UI state)

---

### Finding: Domain constants are properly placed

**Location**: `src/domain/constants.ts`

**Decision**: No changes needed

**Rationale**:
- `INFLATION_PERCENTAGE = 5` and `DEFAULT_INVESTMENT_ALLOCATIONS` are appropriately in domain layer
- Hard-coded values are acceptable when documented as business assumptions
- Constitution allows domain constants in `src/domain/constants.ts`

---

## 2. Third-Party Component Wrapping Audit

### Finding: Chart components already wrapped

**Components**: `PieChart`, `BarChart` from `@mui/x-charts`

**Decision**: Keep existing wrappers, improve if needed

**Rationale**:
- `InvestmentPieChart` and `InvestmentSuggestionsDoughnutChart` wrap `PieChart`
- `TermWiseProgressBarChart` wraps `BarChart`
- Already follows constitution principle III (upgrade-friendly boundaries)
- May need performance improvements (see Performance section)

**Wrapped Components**:
| Component | Wrapper Location | Status |
|-----------|-----------------|--------|
| `PieChart` | `src/pages/Planner/components/InvestmentPieChart/` | ✅ Wrapped |
| `PieChart` | `src/pages/Planner/components/InvestmentSuggestionsDoughnutChart/` | ✅ Wrapped |
| `BarChart` | `src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx` | ✅ Wrapped |

---

### Finding: Date picker components used directly in multiple files

**Components**: `MobileDatePicker`, `CalendarIcon` from `@mui/x-date-pickers`

**Decision**: Create wrapper component in `src/components/DatePicker/`

**Rationale**:
- Used in 2 files: `src/pages/Planner/index.tsx` and `src/pages/Home/components/FinancialGoalForm/index.tsx`
- Direct usage violates constitution principle III
- Future upgrades to `@mui/x-date-pickers` would require changes in multiple files
- Wrapper isolates upgrade impact

**Implementation**:
```typescript
// src/components/DatePicker/index.tsx
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { CalendarIcon } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';

export interface DatePickerProps {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  label?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
}

export const DatePicker = ({ value, onChange, label, minDate, maxDate, disabled }: DatePickerProps) => {
  return (
    <MobileDatePicker
      value={value}
      onChange={onChange}
      label={label}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      slots={{ openPickerIcon: CalendarIcon }}
    />
  );
};
```

**Files Requiring Updates**:
1. `src/pages/Planner/index.tsx` - Replace `MobileDatePicker` with `DatePicker`
2. `src/pages/Home/components/FinancialGoalForm/index.tsx` - Replace `MobileDatePicker` with `DatePicker`

**Alternatives Considered**:
- Leave as-is - Rejected because violates constitution and makes upgrades harder
- Create separate wrappers for each use case - Rejected because both uses are similar enough to share one wrapper

---

### Finding: Deep import for date picker adapter

**Component**: `AdapterDayjs` from `@mui/x-date-pickers/AdapterDayjs`

**Decision**: Document as acceptable exception OR wrap in adapter

**Rationale**:
- Used once in `src/App.tsx` for `LocalizationProvider` setup
- This is configuration-level code, not feature code
- Deep import is necessary for adapter pattern in MUI date pickers
- Wrapping adds minimal value since it's used once at app root

**Implementation Option 1 (Document Exception)**:
```typescript
// src/App.tsx
// Deep import required for MUI date picker adapter pattern
// Wrapper not needed - single configuration usage at app root
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
```

**Implementation Option 2 (Wrap Adapter)**:
```typescript
// src/components/DatePicker/adapter.ts
export { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// src/App.tsx
import { AdapterDayjs } from './components/DatePicker/adapter';
```

**Decision**: Use Option 1 (document exception) - minimal value from wrapping

**Alternatives Considered**:
- Wrap in adapter file - Rejected as over-engineering for single usage
- Import from public entry point - Not possible, adapter requires deep import per MUI design

---

### Finding: Material-UI core components used directly

**Components**: `Box`, `Typography`, `Button`, `Dialog`, etc. (15+ components)

**Decision**: Leave as-is, no wrapping needed

**Rationale**:
- Core layout/typography components are stable across MUI versions
- Wrapping would add maintenance burden without upgrade benefit
- Constitution targets "widely-used third-party UI components" (charts, date pickers), not basic primitives
- MUI's public API for these components is stable

**Exceptions (if needed in future)**:
- If custom theming/styling is needed consistently, create styled variants
- If specific components prove problematic in upgrades, wrap reactively

**Alternatives Considered**:
- Wrap all MUI components - Rejected as over-engineering and against pragmatic design
- Create design system layer - Rejected as premature for current app size

---

### Finding: Styling utilities have mixed import patterns

**Components**: `styled`, `createTheme`, `useTheme` from `@mui/material/styles`

**Decision**: Centralize theme utilities, allow `styled` imports

**Rationale**:
- `createTheme` already centralized in `src/theme.ts` ✅
- `useTheme` is a hook - direct import is acceptable
- `styled` used in 2 files (`StyledBox`, `FinancialGoalForm`) - wrapping adds little value
- Constitution allows centralized configuration, doesn't require wrapping every styling utility

**Current State**:
- ✅ Theme centralized: `src/theme.ts` exports theme
- ✅ `StyledBox` component provides styled Box variant
- ⚠️ `FinancialGoalForm` imports `styled` directly - acceptable but could use `StyledBox` pattern

**Alternatives Considered**:
- Create `src/util/styled.ts` wrapper - Rejected as minimal value
- Enforce all styling through `StyledBox` - Rejected as too restrictive

---

## 3. Type Safety and Contracts Audit

### Finding: Duplicate type definitions with inconsistent shapes

**Type**: `TermTypeWiseProgressData`

**Location**: Defined twice with different shapes:
1. `src/pages/Planner/components/TermwiseProgressBox/index.tsx:23`
   ```typescript
   export type TermTypeWiseProgressData = {
     termType: TermType;  // Uses TermType enum
     termTypeWiseData: TermTypeWiseData;
   };
   ```

2. `src/pages/Planner/components/TermwiseProgressBox/termWiseProgressBarChart.tsx:5`
   ```typescript
   export type TermTypeWiseProgressData = {
     termType: string;  // Uses string instead
     termTypeWiseData: TermTypeWiseData;
   };
   ```

**Decision**: Consolidate to single definition in `src/types/planner.ts`

**Rationale**:
- Duplicate definitions violate "single source of truth" principle
- Inconsistent types (`TermType` vs `string`) can cause runtime errors
- Shared types belong in `src/types/` per constitution

**Implementation**:
```typescript
// src/types/planner.ts (new file)
import { TermType } from './enums';

export type TermTypeWiseData = {
  goalNames: string[];
  termTypeSum: number;
  progressPercent: number;
};

export type TermTypeWiseProgressData = {
  termType: TermType;  // Use enum for type safety
  termTypeWiseData: TermTypeWiseData;
};
```

**Alternatives Considered**:
- Keep in component files - Rejected because types are shared
- Use `string` type - Rejected because enum provides better type safety

---

### Finding: Unjustified `any` types in production code

**Locations**:
1. `src/store/plannerDataReducer.ts:9` - `payload: any`
2. `src/store/plannerDataActions.ts:43` - `financialGoal: any`
3. `src/pages/Planner/components/GoalCard/index.tsx:32` - `dispatch: any`
4. `src/pages/Planner/components/TargetBox/index.tsx:12` - `dispatch: any`

**Decision**: Replace with proper types

**Rationale**:
- `any` types bypass TypeScript safety
- Proper types exist (can use `Dispatch<PlannerDataAction>`, `FinancialGoal`)
- Constitution requires: "`any` MUST NOT be introduced unless unavoidable"

**Implementation**:

1. **Reducer action payload**:
   ```typescript
   // src/store/plannerDataReducer.ts
   export type PlannerDataAction = {
     type: PlannerDataActionType;
     payload: PlannerData | FinancialGoal | string;  // Union of possible payloads
   };
   ```

2. **Action function parameter**:
   ```typescript
   // src/store/plannerDataActions.ts
   export const addFinancialGoal = (
     dispatch: Dispatch<PlannerDataAction>,
     financialGoal: FinancialGoal,  // Not any
   ) => {
     dispatch({
       type: PlannerDataActionType.ADD_FINANCIAL_GOAL,
       payload: financialGoal,
     });
   };
   ```

3. **Component dispatch props**:
   ```typescript
   // src/pages/Planner/components/GoalCard/index.tsx
   import { Dispatch } from 'react';
   import { PlannerDataAction } from '../../../../store/plannerDataReducer';

   interface GoalCardProps {
     goal: FinancialGoal;
     dispatch: Dispatch<PlannerDataAction>;  // Not any
     currentValue: number;
     investmentSuggestions?: InvestmentSuggestion[];
   }
   ```

**Alternatives Considered**:
- Leave as `any` with comments - Rejected because proper types exist
- Use generic dispatch type - Rejected because specific action type is better

---

### Finding: Inline types that should be extracted

**Examples**:

1. **Goal summary in CongratulationsPage**:
   ```typescript
   // Current: inline type
   goals: { name: string; amount: number }[]
   
   // Better: extract to shared type
   // src/types/goals.ts
   export type GoalSummary = {
     name: string;
     amount: number;
   };
   ```

2. **Chart data points**:
   ```typescript
   // Current: inline type
   .reduce((acc: { label: string; value: number }[], curr) => {
   
   // Better: extract to shared type
   // src/types/charts.ts
   export type ChartDataPoint = {
     label: string;
     value: number;
   };
   ```

3. **Investment name to amount mapping**:
   ```typescript
   // Current: inline type
   {} as { [key: string]: number }
   
   // Better: extract to shared type
   // src/types/investments.ts
   export type InvestmentAmountMap = Record<string, number>;
   ```

**Decision**: Extract frequently-used inline types to `src/types/`

**Rationale**:
- Promotes reusability
- Provides single source of truth
- Makes code more maintainable
- Improves autocomplete and type checking

**Alternatives Considered**:
- Leave inline - Rejected because types are reused
- Extract to domain layer - Rejected because these are UI/presentation types

---

## 4. React Performance Optimization Patterns

### Finding: Expensive computations run on every render

**Locations**: Multiple components lack memoization

**Decision**: Apply `useMemo`, `useCallback`, and `React.memo` per React 18.3.1 best practices

**Rationale**:
- Prevent unnecessary recalculations and re-renders
- Improve app responsiveness, especially with many goals
- Constitution success criterion SC-005: 30% reduction in re-renders

**Patterns to Apply**:

1. **`useMemo` for expensive computations** (>1ms or 100+ items):
   - Array filtering/sorting (goal lists)
   - Reductions/aggregations (investment totals)
   - Derived data transformations (chart data processing)

2. **`useCallback` for stable function references**:
   - Event handlers passed to memoized children
   - Functions used in useEffect dependencies
   - Callbacks passed to many list items

3. **`React.memo` for components**:
   - List item components (GoalCard, list items)
   - Components with stable props that re-render unnecessarily
   - Expensive render components (charts, complex layouts)

---

### High-Priority Performance Improvements

#### 1. `Planner` page (`src/pages/Planner/index.tsx`)

**Issues**:
- Multiple expensive computations on every render (lines 42-102)
- No memoization of derived data
- Investment breakdown recalculated even when data unchanged

**Implementation**:
```typescript
const Planner = ({ plannerData, dispatch }: PlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());

  // ✅ Memoize target amount calculation
  const targetAmount = useMemo(() => {
    return plannerData.financialGoals.reduce(
      (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
      0,
    );
  }, [plannerData.financialGoals]);

  // ✅ Memoize investment calculator
  const { calculateInvestmentNeededForGoals } = useInvestmentCalculator(plannerData);
  
  const investmentBreakdownForAllGoals = useMemo(() => {
    return calculateInvestmentNeededForGoals(plannerData, selectedDate);
  }, [calculateInvestmentNeededForGoals, plannerData, selectedDate]);

  // ✅ Memoize term-type breakdowns
  const investmentBreakdownBasedOnTermType = useMemo(() => {
    // ... term-based aggregation logic
  }, [plannerData.financialGoals, investmentBreakdownForAllGoals]);

  // ✅ Memoize callbacks
  const handleDateChange = useCallback((value: Dayjs | null) => {
    setSelectedDate(value!.toString());
  }, []);
  
  // Rest of component...
};
```

**Expected Impact**: 40-50% reduction in render time when date changes or goals update

---

#### 2. `GoalBox` component (`src/pages/Planner/components/GoalBox/index.tsx`)

**Issues**:
- Sorting goals on every render (line 25)
- Multiple filter operations without memoization (lines 31-47)

**Implementation**:
```typescript
const GoalBox = ({ financialGoals, selectedDate, ... }) => {
  // ✅ Memoize sorted goals
  const sortedGoals = useMemo(() => {
    return [...financialGoals].sort((goal1, goal2) => {
      const diffA = dayjs(goal1.getTargetDate()).diff(dayjs(), 'days');
      const diffB = dayjs(goal2.getTargetDate()).diff(dayjs(), 'days');
      return diffA - diffB;
    });
  }, [financialGoals]);

  // ✅ Memoize filtered arrays
  const pendingGoals = useMemo(() => 
    sortedGoals.filter(goal => 
      goal.goalType === GoalType.ONE_TIME &&
      dayjs(selectedDate).isBefore(goal.getTargetDate())
    ),
    [sortedGoals, selectedDate]
  );

  const completedGoals = useMemo(() =>
    sortedGoals.filter(goal =>
      goal.goalType === GoalType.ONE_TIME &&
      dayjs(selectedDate).isAfter(goal.getTargetDate())
    ),
    [sortedGoals, selectedDate]
  );

  const recurringGoals = useMemo(() =>
    sortedGoals.filter(goal => goal.goalType === GoalType.RECURRING),
    [sortedGoals]
  );
  
  // Rest of component...
};
```

**Expected Impact**: 30-40% reduction in re-renders when goals change

---

#### 3. `GoalCard` component (`src/pages/Planner/components/GoalCard/index.tsx`)

**Issues**:
- Re-renders when parent re-renders even if props unchanged
- `handleDelete` recreated on every render

**Implementation**:
```typescript
// ✅ Wrap with React.memo
const GoalCard = React.memo(({
  goal,
  dispatch,
  currentValue,
  investmentSuggestions = [],
}: GoalCardProps) => {
  // ✅ Memoize delete handler
  const handleDelete = useCallback(() => {
    deleteFinancialGoal(dispatch, goal.id);
  }, [dispatch, goal.id]);

  // ✅ Memoize expensive calculations
  const totalMonthlyInvestment = useMemo(() => {
    return investmentSuggestions.reduce((sum, s) => sum + s.amount, 0);
  }, [investmentSuggestions]);

  // Rest of component...
}, (prevProps, nextProps) => {
  // Custom comparison for optimal performance
  return (
    prevProps.goal.id === nextProps.goal.id &&
    prevProps.currentValue === nextProps.currentValue &&
    prevProps.investmentSuggestions.length === nextProps.investmentSuggestions.length
  );
});
```

**Expected Impact**: Prevents unnecessary re-renders of individual cards when other cards change

---

#### 4. Chart components (multiple)

**Components**: `InvestmentPieChart`, `InvestmentSuggestionsDoughnutChart`, `CustomLegend`

**Issues**:
- Data transformation/reduction on every render
- Charts re-render when parent updates but data unchanged

**Implementation Pattern**:
```typescript
// ✅ Wrap with React.memo
const InvestmentPieChart = React.memo(({ allocations }: InvestmentPieChartProps) => {
  // ✅ Memoize chart data processing
  const chartData = useMemo(() => {
    return allocations
      .map(allocation => ({
        label: allocation.investmentName,
        value: Number(allocation.investmentPercentage),
      }))
      .reduce((acc: ChartDataPoint[], curr) => {
        const existing = acc.find(item => item.label === curr.label);
        if (existing) {
          existing.value += curr.value;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
  }, [allocations]);

  // ✅ Memoize static config
  const pieParams = useMemo(() => ({
    height: 250,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  }), []);

  return <PieChart colors={palette} series={[{ data: chartData }]} {...pieParams} />;
});
```

**Expected Impact**: Charts only re-render when data actually changes, not on every parent render

---

### Performance Testing Strategy

**Tools**:
1. React DevTools Profiler (identify hotspots before/after)
2. Chrome DevTools Performance tab (measure frame rates)

**Metrics to Track**:
- Render count reduction for each component
- Time to interaction when date changes
- Frame rate during scrolling (target: 60fps)
- Memory usage with 50+ goals

**Baseline Before Refactor**:
- Profile current app with 20 goals, note render counts and times
- Identify top 5 slowest components
- Measure interaction response times

**Validation After Refactor**:
- Re-profile with same 20 goals, compare metrics
- Verify SC-005: ≥30% reduction in re-renders for identified hotspots
- Verify SC-006: Build time increase ≤10%

---

## 5. ESLint Configuration for Cross-Layer Enforcement

### Finding: No automated enforcement of import boundaries

**Decision**: Add `eslint-plugin-boundaries` or custom ESLint rules

**Rationale**:
- Manual code review can miss violations
- Automated checks prevent regressions
- Success criterion SC-009: Zero cross-layer violations

**Implementation Plan**:

```json
// package.json - add dev dependency
{
  "devDependencies": {
    "eslint-plugin-boundaries": "^4.2.0"
  }
}
```

```javascript
// .eslintrc.js or eslintConfig in package.json
{
  "plugins": ["boundaries"],
  "settings": {
    "boundaries/elements": [
      {
        "type": "domain",
        "pattern": "src/domain/*",
        "mode": "full"
      },
      {
        "type": "components",
        "pattern": "src/components/*",
        "mode": "full"
      },
      {
        "type": "pages",
        "pattern": "src/pages/*",
        "mode": "full"
      },
      {
        "type": "util",
        "pattern": "src/util/*",
        "mode": "full"
      },
      {
        "type": "store",
        "pattern": "src/store/*",
        "mode": "full"
      }
    ],
    "boundaries/ignore": ["**/*.test.ts", "**/*.test.tsx"]
  },
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          {
            "from": "domain",
            "allow": ["domain", "util"]
          },
          {
            "from": "components",
            "allow": ["components", "domain", "util", "store"]
          },
          {
            "from": "pages",
            "allow": ["pages", "components", "domain", "util", "store"]
          },
          {
            "from": "util",
            "allow": ["util"]
          },
          {
            "from": "store",
            "allow": ["store", "domain"]
          }
        ]
      }
    ]
  }
}
```

**Alternatives Considered**:
- Manual code review only - Rejected because humans miss things
- Custom script in CI - Rejected because ESLint integrates better with IDEs
- No enforcement - Rejected because violates constitution compliance

---

## Summary of Research Decisions

| Area | Current State | Decision | Priority |
|------|--------------|----------|----------|
| Business logic in hooks | Mixed concerns | Extract to domain | P1 (High) |
| Chart components | Already wrapped | Keep, optimize performance | P2 (Medium) |
| Date picker | Used directly in 2 files | Wrap in `src/components/DatePicker/` | P1 (High) |
| MUI core components | Used directly | Leave as-is | P3 (Low) |
| Type redeclarations | Duplicate definitions | Consolidate to `src/types/` | P1 (High) |
| `any` types | 4+ unjustified uses | Replace with proper types | P1 (High) |
| Performance | No memoization | Apply React optimization patterns | P2 (Medium) |
| Import boundaries | No enforcement | Add ESLint plugin | P2 (Medium) |

**Next Steps**: Proceed to Phase 1 (Design & Contracts) to create data model and refactoring contracts.
