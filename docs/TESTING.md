# Testing Guide

## Overview

Goal Based Financial Planner uses **Jest** and **React Testing Library** for testing. Our testing philosophy emphasizes:

- **User-centric tests**: Test behavior, not implementation
- **Financial calculation accuracy**: All business logic MUST be tested
- **Coverage thresholds**: Enforce minimum coverage to catch regressions
- **Fast feedback**: Tests run quickly in watch mode during development

## Running Tests

### Development Mode (Watch Mode)

```bash
npm test
```

- Runs tests in interactive watch mode
- Automatically re-runs tests when files change
- Shows only tests related to changed files
- Ideal for TDD workflow

**Use this when**: Actively developing features or fixing bugs

### CI/Validation Mode (With Coverage)

```bash
npm run test:cov
```

- Runs all tests once (non-interactive)
- Generates coverage report
- **Fails if coverage falls below thresholds** (70% lines, 60% branches, 70% functions)
- Outputs coverage summary to terminal
- Generates detailed HTML report in `coverage/` directory

**Use this when**: Validating before commit, running in CI, checking overall test health

## Coverage Requirements

### Thresholds (Enforced by CI)

| Metric     | Threshold | Meaning                                              |
| ---------- | --------- | ---------------------------------------------------- |
| Lines      | 70%       | At least 70% of code lines must be executed by tests |
| Branches   | 60%       | At least 60% of conditional branches must be tested  |
| Functions  | 70%       | At least 70% of functions must be called in tests    |
| Statements | 70%       | At least 70% of statements must be executed          |

**Why these thresholds?**

- **High enough** to catch most bugs and regressions
- **Low enough** to avoid diminishing returns (trivial/boilerplate code may be excluded)
- **Focus on critical paths**: Financial calculations MUST be tested regardless of coverage metrics

### Interpreting Coverage Results

After running `npm run test:cov`, you'll see:

```text
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                       |   75.23 |    62.45 |   71.89 |   75.23 |
  src/pages/Planner             |   82.45 |    70.12 |   80.00 |   82.45 |
    Planner.tsx                 |   85.00 |    75.00 |   83.33 |   85.00 |
    hooks/useCalculator.ts      |   90.00 |    80.00 |  100.00 |   90.00 |
--------------------------------|---------|----------|---------|---------|
```

- **✅ Green/passing**: Coverage meets or exceeds all thresholds
- **❌ Red/failing**: Coverage below threshold in one or more categories
- **📊 Detailed report**: Open `coverage/lcov-report/index.html` in browser for interactive exploration

**When coverage is below threshold:**

1. Identify uncovered code in the HTML report
2. Ask: "Is this code critical to test?" (financial calculations = yes, trivial getters = maybe)
3. Add tests for critical uncovered code
4. Re-run `npm run test:cov` to verify

## Writing Tests

### Test Structure

Tests should follow the **Arrange-Act-Assert** (AAA) pattern:

```typescript
describe('useCalculator', () => {
  it('should calculate correct allocation for single goal', () => {
    // Arrange: Set up test data
    const goal = { target: 10000, currentSavings: 2000, monthsRemaining: 12 };

    // Act: Execute the function
    const result = calculateMonthlyAllocation(goal);

    // Assert: Verify the outcome
    expect(result).toBe(667); // (10000 - 2000) / 12 ≈ 667
  });
});
```

### Unit Tests (Business Logic)

**What to test**: Domain logic, hooks, utility functions

**Location**: Colocate with source file

```text
src/pages/Planner/hooks/
├── useCalculator.ts
└── useCalculator.test.ts
```

**Example**:

```typescript
// src/pages/Planner/hooks/useCalculator.test.ts
import { calculateAllocation } from './useCalculator';

describe('calculateAllocation', () => {
  it('should return 0 when target equals current savings', () => {
    const result = calculateAllocation({
      target: 5000,
      current: 5000,
      months: 12,
    });
    expect(result).toBe(0);
  });

  it('should handle division by zero gracefully', () => {
    const result = calculateAllocation({ target: 5000, current: 0, months: 0 });
    expect(result).toBe(Infinity); // Or throw error, depending on design
  });

  it('should calculate correct monthly allocation', () => {
    const result = calculateAllocation({
      target: 12000,
      current: 0,
      months: 12,
    });
    expect(result).toBe(1000);
  });
});
```

**Best practices**:

- Test edge cases (zero, negative, large numbers, division by zero)
- Test all conditional branches
- Use descriptive test names ("should ... when ...")
- One assertion per test when possible

### Component Tests (UI Behavior)

**What to test**: User interactions, rendering, accessibility

**Location**: Colocate with component

```text
src/pages/Planner/
├── Planner.tsx
└── Planner.test.tsx
```

**Example**:

```typescript
// src/pages/Planner/Planner.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Planner } from './Planner';

describe('Planner', () => {
  it('should render goal creation form', () => {
    render(<Planner />);
    expect(screen.getByRole('textbox', { name: /goal name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add goal/i })).toBeInTheDocument();
  });

  it('should add goal when form is submitted', () => {
    render(<Planner />);

    // Fill out form
    fireEvent.change(screen.getByRole('textbox', { name: /goal name/i }), {
      target: { value: 'Emergency Fund' }
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /target amount/i }), {
      target: { value: '10000' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /add goal/i }));

    // Verify goal appears
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
  });
});
```

**Best practices**:

- Use React Testing Library queries (not implementation details like state or props)
- Prefer `getByRole` over `getByTestId` for better accessibility
- Test user workflows, not implementation (don't test state directly)
- Use `userEvent` for more realistic interactions (optional, requires `@testing-library/user-event`)

### Testing Hooks

**Approach**: Use `renderHook` from React Testing Library

**Example**:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGoals } from './useGoals';

describe('useGoals', () => {
  it('should add goal and persist to storage', () => {
    const { result } = renderHook(() => useGoals());

    act(() => {
      result.current.addGoal({ name: 'Vacation', target: 5000 });
    });

    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].name).toBe('Vacation');
  });
});
```

## Common Testing Patterns

### Mocking LocalStorage

```typescript
// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### Testing Async Operations

```typescript
it('should load goals asynchronously', async () => {
  render(<Planner />);

  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('My Goal')).toBeInTheDocument();
  });
});
```

### Testing Material-UI Components

```typescript
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

it('should render with MUI theme', () => {
  renderWithTheme(<MyComponent />);
  // ...assertions
});
```

## Troubleshooting

### Tests Fail Locally but Pass in CI

**Possible causes**:

- Different Node.js versions (check `package.json` engines vs local version)
- Stale Jest cache

**Solution**:

```bash
npm test -- --clearCache
npm test
```

### Coverage Drops Unexpectedly

**Possible causes**:

- Added new files without tests
- Removed tests without removing code
- Coverage tool misconfiguration

**Solution**:

1. Check `coverage/lcov-report/index.html` to see uncovered files
2. Add tests for critical uncovered code
3. Verify `package.json` `jest.coveragePathIgnorePatterns` isn't excluding too much

### "Cannot find module" Errors in Tests

**Possible cause**: Import path issues

**Solution**:

```typescript
// Ensure imports match actual file structure
import { MyComponent } from './MyComponent'; // Relative path
import { MyUtil } from '../../../util/MyUtil'; // Relative path

// Check that file extensions match (.ts vs .tsx)
```

### Tests Run Slowly

**Possible causes**:

- Too many tests running in parallel
- Large test suites not properly isolated

**Solution**:

```bash
# Run tests serially (slower but more stable)
npm test -- --runInBand

# Run only changed tests
npm test -- --onlyChanged
```

### Material-UI Theme Errors

**Possible cause**: Component rendered without theme provider

**Solution**: Wrap in `ThemeProvider` (see "Testing Material-UI Components" above)

## Best Practices

### DO:

- ✅ Test user-visible behavior, not implementation details
- ✅ Use descriptive test names (`it('should calculate allocation when months is zero')`)
- ✅ Test edge cases and error conditions
- ✅ Keep tests fast and isolated (no external dependencies)
- ✅ Colocate tests with source files
- ✅ Use React Testing Library queries (`getByRole`, `getByText`)
- ✅ Test critical financial calculations thoroughly

### DON'T:

- ❌ Test framework internals (React state, props directly)
- ❌ Use `getByTestId` unless absolutely necessary (prefer semantic queries)
- ❌ Write tests that depend on other tests (order independence)
- ❌ Mock everything (only mock external dependencies, not your own code)
- ❌ Skip tests for complex financial logic
- ❌ Commit code that reduces coverage below thresholds

## Integration with CI/CD

### GitHub Actions Workflow

The `.github/workflows/ci.yml` workflow runs tests on every push and pull request:

```yaml
- name: Run tests with coverage
  run: npm run test:cov
```

**What happens**:

1. Tests run in non-interactive mode
2. Coverage report is generated
3. If coverage is below thresholds, build fails
4. Coverage report is uploaded as artifact (viewable in GitHub Actions)

### Pre-commit Hooks

Consider adding a pre-commit hook to run tests locally:

```bash
# .husky/pre-commit (if using Husky)
npm run test:cov
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started): Test framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): Component testing
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library): Kent C. Dodds' guide
- [Architecture Guide](ARCHITECTURE.md): Understand what to test based on code organization
- [Development Guide](DEVELOPMENT.md): Setup and workflow

---

**Remember**: Tests are documentation for your code's behavior. Write tests that future you (and other contributors) will appreciate!
