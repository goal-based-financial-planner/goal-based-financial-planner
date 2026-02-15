# Refactoring Contracts

**Feature**: Codebase Architecture Refactor for Constitution Compliance  
**Branch**: `002-codebase-architecture-refactor`  
**Date**: 2026-01-31  
**Purpose**: Define the contracts and interfaces for refactoring work to ensure consistency and prevent regressions

---

## Overview

This document defines "contracts" (not API endpoints, but code organization agreements) for the refactoring initiative. Each contract specifies:
- **What** must be done
- **Where** code should live
- **How** to verify compliance
- **Why** this matters for constitution goals

---

## Contract 1: Business Logic Extraction

### Agreement

All pure business logic (financial calculations, validation rules, domain constants) MUST reside in `src/domain/` with zero React/UI dependencies.

### Scope

**Files to Refactor**:
1. `src/pages/Planner/hooks/investmentCalculator.utils.ts`
   - Move entire file content to `src/domain/investmentCalculations.ts`
   - Functions: `calculateSIPFactor`, `calculateTotalMonthlySIP`, `calculateFutureValue`, `verifySIPCalculation`

2. `src/pages/Planner/hooks/useInvestmentCalculator.ts`
   - Extract: Current value calculation → `calculateCurrentPortfolioValue()` in domain
   - Extract: Date filtering logic → `isGoalActive()` in `src/domain/FinancialGoals.ts`
   - Keep: Hook orchestration and UI type mapping

**New Domain File**:
```typescript
// src/domain/investmentCalculations.ts
export const calculateSIPFactor = (...) => { /* existing impl */ };
export const calculateTotalMonthlySIP = (...) => { /* existing impl */ };
export const calculateFutureValue = (...) => { /* existing impl */ };
export const verifySIPCalculation = (...) => { /* existing impl */ };
export const calculateCurrentPortfolioValue = (
  goal: FinancialGoal,
  investmentAllocations: InvestmentChoiceType[],
  elapsedMonths: number
): number => {
  return investmentAllocations
    .map(allocation => 
      calculateFutureValue(
        allocation.amount,
        Math.min(elapsedMonths, goal.getMonthTerm()),
        allocation.expectedReturnPercentage
      )
    )
    .reduce((acc, cv) => acc + cv, 0);
};
```

### Verification

**Automated**:
```bash
# Ensure no React imports in domain files
grep -r "from 'react'" src/domain/ && echo "FAIL: React imports in domain" || echo "PASS"

# Ensure new domain file exists
[ -f "src/domain/investmentCalculations.ts" ] && echo "PASS" || echo "FAIL: Missing file"
```

**Manual**:
- [ ] All calculation functions in `src/domain/investmentCalculations.ts`
- [ ] No React imports in domain layer
- [ ] All domain functions have unit tests
- [ ] Hook file `useInvestmentCalculator.ts` only orchestrates domain functions

### Success Criteria

Maps to **FR-001, FR-004** and **User Story 3** (business logic changes require zero component edits)

---

## Contract 2: Third-Party Component Wrapping

### Agreement

Widely-used third-party UI components MUST be wrapped in local components in `src/components/` to isolate upgrade impact.

### Scope

**Components to Wrap**:

1. **DatePicker Wrapper**
   - **Location**: `src/components/DatePicker/index.tsx` (new file)
   - **Wraps**: `MobileDatePicker`, `CalendarIcon` from `@mui/x-date-pickers`
   - **Interface**:
     ```typescript
     export interface DatePickerProps {
       value: Dayjs | null;
       onChange: (value: Dayjs | null) => void;
       label?: string;
       minDate?: Dayjs;
       maxDate?: Dayjs;
       disabled?: boolean;
     }
     export const DatePicker: React.FC<DatePickerProps>;
     ```
   - **Files to Update**:
     - `src/pages/Planner/index.tsx` - Replace `MobileDatePicker` import with `DatePicker`
     - `src/pages/Home/components/FinancialGoalForm/index.tsx` - Same

2. **Chart Wrappers** (already exist, verify and optimize)
   - **Existing**: `InvestmentPieChart`, `InvestmentSuggestionsDoughnutChart`, `TermWiseProgressBarChart`
   - **Action**: Add `React.memo` and performance optimizations (see Performance contract)

### Verification

**Automated**:
```bash
# Ensure no direct MobileDatePicker imports in pages
grep -r "from '@mui/x-date-pickers/MobileDatePicker'" src/pages/ && echo "FAIL" || echo "PASS"

# Ensure DatePicker wrapper exists
[ -f "src/components/DatePicker/index.tsx" ] && echo "PASS" || echo "FAIL"
```

**Manual**:
- [ ] DatePicker wrapper created in `src/components/`
- [ ] All MobileDatePicker usages replaced with DatePicker wrapper
- [ ] Wrapper exports clean interface (no MUI types leaked)
- [ ] Wrapper component has tests

### Success Criteria

Maps to **FR-007** and **User Story 6** (library upgrade isolated to <5 wrapper files)

---

## Contract 3: Type Consolidation and Safety

### Agreement

1. Shared types MUST be defined once in `src/types/` or `src/domain/` and imported (no redeclaration)
2. `any` types MUST NOT exist in production code without inline justification comment
3. Component prop types MUST import shared shapes (dispatch, domain entities) rather than using `any`

### Scope

**New Type Files to Create**:

1. **`src/types/planner.ts`**
   - Types: `TermTypeWiseData`, `TermTypeWiseProgressData`, `GoalWiseInvestmentBreakdown`, `InvestmentSuggestion`, `InvestmentBreakdownBasedOnTermType`
   - Consolidates duplicates from `TermwiseProgressBox` components

2. **`src/types/charts.ts`**
   - Types: `ChartDataPoint`, `InvestmentAmountMap`
   - Consolidates inline types from chart components

3. **`src/types/goals.ts`**
   - Types: `GoalSummary`
   - Consolidates inline type from CongratulationsPage

**Files to Update (Remove `any` types)**:

1. **Store Files**:
   - `src/store/plannerDataReducer.ts` - `payload: any` → `payload: PlannerDataActionPayload`
   - `src/store/plannerDataActions.ts` - `financialGoal: any` → `financialGoal: FinancialGoal`

2. **Component Files**:
   - `src/pages/Planner/components/GoalCard/index.tsx` - `dispatch: any` → `dispatch: Dispatch<PlannerDataAction>`
   - `src/pages/Planner/components/TargetBox/index.tsx` - `dispatch: any` → `dispatch: Dispatch<PlannerDataAction>`

**Duplicate Types to Remove**:
- Remove `TermTypeWiseProgressData` from `termWiseProgressBarChart.tsx` (keep in planner.ts)
- Remove `TermTypeWiseData` inline definitions (use from planner.ts)

### Verification

**Automated**:
```bash
# Check for unjustified `any` types (exclude test files)
grep -r ": any" src/ --exclude="*.test.ts" --exclude="*.test.tsx" && echo "REVIEW REQUIRED" || echo "PASS"

# Ensure new type files exist
[ -f "src/types/planner.ts" ] && [ -f "src/types/charts.ts" ] && [ -f "src/types/goals.ts" ] && echo "PASS" || echo "FAIL"

# TypeScript compilation must succeed
npm run build && echo "PASS: Types valid" || echo "FAIL: Type errors"
```

**Manual**:
- [ ] All new type files created
- [ ] Duplicate types removed from component files
- [ ] All `any` types replaced with proper types
- [ ] No type-related compilation errors

### Success Criteria

Maps to **FR-009, FR-010** and constitution Principle IV (type safety and explicit contracts)

---

## Contract 4: Performance Optimization

### Agreement

Components with expensive computations or frequent re-renders MUST use React optimization patterns (`useMemo`, `useCallback`, `React.memo`) to achieve ≥30% reduction in re-renders.

### Scope

**High-Priority Components** (MUST optimize):

1. **Planner Page** (`src/pages/Planner/index.tsx`)
   - Add `useMemo` for: `targetAmount`, `investmentBreakdownForAllGoals`, `investmentBreakdownBasedOnTermType`, `termTypeWiseProgressData`, `completedGoals`
   - Add `useCallback` for: `handleDateChange`, `setShowDrawerCallback`

2. **GoalBox** (`src/pages/Planner/components/GoalBox/index.tsx`)
   - Add `useMemo` for: `sortedGoals`, `pendingGoals`, `completedGoals`, `recurringGoals`

3. **GoalCard** (`src/pages/Planner/components/GoalCard/index.tsx`)
   - Wrap with `React.memo`
   - Add `useCallback` for: `handleDelete`
   - Add `useMemo` for: `totalMonthlyInvestment`

4. **Chart Components**:
   - `InvestmentPieChart` - Wrap with `React.memo`, add `useMemo` for chart data processing
   - `InvestmentSuggestionsDoughnutChart` - Wrap with `React.memo`, add `useMemo` for reduction
   - `CustomLegend` - Wrap with `React.memo`, add `useMemo` for reduction

**Medium-Priority Components** (SHOULD optimize if time permits):
- `GoalList` - `useMemo` for filters, `useCallback` for handlers
- `RecurringGoalsTable` - Wrap with `React.memo`
- `TermWiseProgressBox` - Wrap with `React.memo`

### Verification

**Automated**:
```bash
# Check that high-priority components use React.memo
grep -l "React.memo" src/pages/Planner/components/GoalCard/index.tsx && echo "PASS" || echo "FAIL"

# Ensure tests still pass
npm test && echo "PASS: No regressions" || echo "FAIL: Test failures"
```

**Manual** (React DevTools Profiler):
1. Profile app before optimization (20 goals, date change interaction)
2. Note render counts for GoalCard, GoalBox, chart components
3. Apply optimizations
4. Re-profile with same interaction
5. Verify ≥30% reduction in renders for optimized components

**Profiling Checklist**:
- [ ] Baseline profiling complete (screenshots saved)
- [ ] Optimizations applied to high-priority components
- [ ] Post-optimization profiling complete
- [ ] Render count reduction ≥30% for GoalCard, GoalBox, charts
- [ ] No performance regressions (frame drops, lag)

### Success Criteria

Maps to **FR-016, FR-017** and **SC-005** (30% reduction in re-renders), **User Story 4** (identify and fix performance issues)

---

## Contract 5: File Organization and Naming

### Agreement

1. Files MUST use descriptive names (avoid `helpers.ts`, `utils.ts`)
2. Components MUST use `PascalCase`
3. Hooks MUST use `useThing` pattern
4. Pure utilities MUST use `camelCase`
5. Page-specific code MUST stay under `src/pages/[Page]/`
6. Shared code MUST stay under `src/components/`, `src/domain/`, `src/util/`, `src/types/`

### Scope

**Files to Rename** (if any exist with generic names):
- Audit for `helpers.ts`, `utils.ts` - rename to specific purpose (e.g., `dateFormatting.ts`, `currencyFormatting.ts`)

**Files to Verify** (correct locations):
- ✅ Page-specific: All components under `src/pages/[Page]/components/` don't get imported by other pages
- ✅ Shared primitives: `LiveNumberCounter`, `StyledBox` in `src/components/` are truly shared
- ✅ Domain logic: All `.ts` files in `src/domain/` have no UI dependencies

**Naming Convention Audit**:
```bash
# Components should be PascalCase
find src/components src/pages -name "*.tsx" -type f ! -name "[A-Z]*" && echo "FAIL: Non-PascalCase components" || echo "PASS"

# Hooks should start with "use"
find src -name "use*.ts" -o -name "use*.tsx" && echo "Found hooks" || echo "No hooks found"
```

### Verification

**Automated**:
```bash
# No generic file names
find src -name "helpers.ts" -o -name "utils.ts" && echo "FAIL: Generic names found" || echo "PASS"

# Components are PascalCase
find src/components src/pages -type f -name "*.tsx" ! -name "index.tsx" | grep -v "^[A-Z]" && echo "FAIL" || echo "PASS"
```

**Manual**:
- [ ] All files have descriptive names
- [ ] No `helpers.ts` or `utils.ts` without specific context
- [ ] Component files use PascalCase
- [ ] Hook files use `useThing` pattern
- [ ] Utility files use camelCase

### Success Criteria

Maps to **FR-011, FR-012** and constitution Principle II (feature co-location + stable shared surface)

---

## Contract 6: Cross-Layer Import Enforcement

### Agreement

1. Domain layer MUST NOT import from UI, store, or components
2. Shared components MUST NOT import from pages
3. Types MUST NOT import from components or pages
4. Violations MUST be caught by automated linting

### Scope

**ESLint Configuration** (add to existing config):

```json
{
  "devDependencies": {
    "eslint-plugin-boundaries": "^4.2.0"
  }
}
```

**ESLint Rules** (add to `.eslintrc` or `package.json`):
```json
{
  "plugins": ["boundaries"],
  "settings": {
    "boundaries/elements": [
      { "type": "domain", "pattern": "src/domain/*" },
      { "type": "components", "pattern": "src/components/*" },
      { "type": "pages", "pattern": "src/pages/*" },
      { "type": "util", "pattern": "src/util/*" },
      { "type": "store", "pattern": "src/store/*" },
      { "type": "types", "pattern": "src/types/*" }
    ]
  },
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          { "from": "domain", "allow": ["domain", "types", "util"] },
          { "from": "components", "allow": ["components", "domain", "types", "util", "store"] },
          { "from": "pages", "allow": ["pages", "components", "domain", "types", "util", "store"] },
          { "from": "util", "allow": ["util", "types"] },
          { "from": "store", "allow": ["store", "domain", "types"] },
          { "from": "types", "allow": ["types"] }
        ]
      }
    ]
  }
}
```

### Verification

**Automated**:
```bash
# ESLint must pass
npm run lint && echo "PASS: No cross-layer violations" || echo "FAIL: Violations detected"

# Specific checks
npx eslint src/domain/ --rule "boundaries/element-types: error" && echo "PASS: Domain clean" || echo "FAIL"
npx eslint src/components/ --rule "boundaries/element-types: error" && echo "PASS: Components clean" || echo "FAIL"
```

**Manual**:
- [ ] ESLint plugin installed
- [ ] Boundary rules configured
- [ ] No violations in domain layer
- [ ] No violations in shared components
- [ ] CI pipeline runs linting

### Success Criteria

Maps to **FR-002, FR-003** and **SC-009** (zero cross-layer violations detected)

---

## Contract 7: Test Coverage Maintenance

### Agreement

1. Refactored code MUST maintain or improve test coverage (no reduction from current 63%)
2. New domain functions MUST have unit tests (target: 90% for financial calculations)
3. All existing tests MUST pass after refactoring
4. Build process MUST succeed

### Scope

**Test Files to Create**:
1. `src/domain/investmentCalculations.test.ts` - Tests for moved calculation functions
2. `src/components/DatePicker/index.test.tsx` - Tests for new wrapper component
3. `src/types/planner.test.ts` - Type validation tests (if needed)

**Test Files to Update**:
1. `src/pages/Planner/hooks/useInvestmentCalculator.test.ts` - Update imports after extraction
2. Any component tests that use `MobileDatePicker` - Update to use `DatePicker` wrapper

**Coverage Thresholds** (maintain current):
```json
{
  "coverageThreshold": {
    "global": {
      "branches": 55,
      "functions": 63,
      "lines": 63,
      "statements": 63
    }
  }
}
```

**Target for Domain Calculations** (aspirational):
```json
{
  "coverageThreshold": {
    "src/domain/investmentCalculations.ts": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### Verification

**Automated**:
```bash
# All tests pass
npm test -- --watchAll=false && echo "PASS: All tests pass" || echo "FAIL: Test failures"

# Coverage meets thresholds
npm run test:cov && echo "PASS: Coverage maintained" || echo "FAIL: Coverage below threshold"

# Build succeeds
npm run build && echo "PASS: Build succeeds" || echo "FAIL: Build errors"
```

**Manual**:
- [ ] New domain tests created
- [ ] New wrapper tests created
- [ ] Updated hook tests pass
- [ ] Coverage report shows ≥63% global coverage
- [ ] Coverage report shows ≥90% for investment calculations (aspirational)

### Success Criteria

Maps to **FR-013, FR-015, FR-018, FR-019** and **SC-004** (90% coverage for financial calculations)

---

## Contract 8: Staged PR Strategy

### Agreement

Refactoring changes MUST be staged in small, reviewable PRs following safe patterns:
1. Move/rename (no behavior changes)
2. Behavior changes (with tests)
3. Cleanup (remove old code)

### PR Sequence

**PR 1: Type Consolidation** (Move/Rename)
- Create new type files: `planner.ts`, `charts.ts`, `goals.ts`
- Add type definitions (no deletions yet)
- No behavior changes
- Size: ~200 lines added

**PR 2: Business Logic Extraction** (Move/Rename)
- Create `src/domain/investmentCalculations.ts`
- Copy functions from hooks (no deletions yet)
- Update tests to import from new location
- No behavior changes
- Size: ~150 lines moved, ~200 lines tests

**PR 3: Type Safety Improvements** (Behavior + Cleanup)
- Replace `any` types with proper types
- Update component props
- Remove duplicate type definitions
- Update imports throughout
- Size: ~50 files changed (mostly import updates)

**PR 4: DatePicker Wrapper** (New Component)
- Create `src/components/DatePicker/`
- Add wrapper component and tests
- Update Planner and FinancialGoalForm to use wrapper
- Size: ~100 lines added, ~20 lines changed

**PR 5: Performance Optimizations** (Behavior)
- Add React.memo to chart components
- Add useMemo/useCallback to Planner page
- Add useMemo to GoalBox
- Add React.memo to GoalCard
- Size: ~100 lines changed (optimization hooks)

**PR 6: Cleanup** (Deletion)
- Remove old hook utilities file (if fully replaced)
- Remove unused imports
- Remove duplicate types
- Size: ~100 lines deleted

**PR 7: Linting Enforcement** (Infrastructure)
- Add eslint-plugin-boundaries
- Configure boundary rules
- Fix any violations
- Update CI to enforce
- Size: ~50 lines config, ~20 lines CI

### Verification

**Per-PR Checklist**:
- [ ] PR description explains what changed and why
- [ ] PR size reasonable (<500 lines changed)
- [ ] All tests pass in CI
- [ ] Build succeeds
- [ ] No linting errors
- [ ] Constitution Check section in PR description

**Overall**:
- [ ] All 7 PRs merged
- [ ] No breaking changes to existing functionality
- [ ] All contracts satisfied

### Success Criteria

Maps to **FR-020** and constitution Principle V (small, reversible PRs)

---

## Summary of Contracts

| Contract | Priority | Blocking? | Verification Method |
|----------|----------|-----------|---------------------|
| 1. Business Logic Extraction | P1 | Yes | Automated grep + manual review |
| 2. Third-Party Wrapping | P1 | Yes | Automated grep + manual testing |
| 3. Type Consolidation | P1 | Yes | TypeScript compilation + grep |
| 4. Performance Optimization | P2 | No | React DevTools profiling |
| 5. File Organization | P2 | No | Automated naming checks |
| 6. Cross-Layer Enforcement | P1 | Yes | ESLint with boundaries plugin |
| 7. Test Coverage | P1 | Yes | Jest coverage reports |
| 8. Staged PR Strategy | P1 | Yes | Manual PR review process |

**Blocking contracts** must be satisfied before feature is considered complete.

**Non-blocking contracts** are nice-to-have improvements that can be deferred if needed.
