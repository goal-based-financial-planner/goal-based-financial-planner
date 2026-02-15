# Architecture

## Project Overview

Goal Based Financial Planner is a **pure frontend application** built with React and TypeScript. It helps users set and track financial goals through visual planning and automatic allocation calculations. The application runs entirely in the browser with no backend services required, ensuring user privacy and data sovereignty.

**Key Characteristics:**

- **Technology**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) v6
- **State Management**: React hooks + local storage (no Redux)
- **Deployment**: GitHub Pages (static hosting)
- **Testing**: Jest + React Testing Library
- **Build Tool**: Create React App (react-scripts)

## Constitution Principles

This project follows the principles defined in [`.specify/memory/constitution.md`](../.specify/memory/constitution.md). These principles guide all architectural and development decisions:

### I. Clear Layering (Domain → State → UI)

Business rules MUST live outside UI components.

- **Domain logic** lives in `src/domain/` (pure functions, types, constants) or calculator/derivation utilities in hooks or `src/util/`
- **UI components** (`src/components/`, `src/pages/`) stay presentational: no hidden business rules, no duplicated calculations, no hard-coded financial assumptions
- **Side effects** (storage, time, randomness) are isolated behind thin adapters (e.g., `src/util/storage.ts`) for easy migration

**Example**: Financial calculation logic lives in `src/pages/Planner/hooks/useCalculator.ts`, not embedded in JSX.

### II. Feature Co-location + Stable Shared Surface

Code organization makes change impact obvious and keeps "shared" truly shared.

- **Page-specific UI** lives under `src/pages/<Page>/` with its own `components/`, `hooks/`, `types.ts`, and tests
- **Shared, reusable UI primitives** live under `src/components/` and MUST NOT import from `src/pages/`
- **Shared domain concepts** live in `src/domain/` and MUST NOT depend on UI

**Example**: `src/pages/Planner/components/GoalCard.tsx` is page-specific, while `src/components/Button/` is shared.

### III. Upgrade-Friendly Boundaries (No Vendor Lock-In by Default)

We optimize for dependency upgrades and refactors by preventing "deep coupling".

- **Imports from external libraries** go through public entry points only (no deep imports into internal paths)
- **Widely-used 3rd-party UI or charting components** are wrapped behind a small local component in `src/components/` for localized replacements
- **Cross-cutting configuration** is centralized (e.g., theme in `src/theme.ts`, app constants in `src/domain/constants.ts`)

**Example**: Material-UI components are used directly but charting libraries might be wrapped for easier swapping.

### IV. Type Safety and Explicit Contracts

TypeScript is a core maintainability tool; we treat "types as contracts".

- **New code MUST be typed**; `any` MUST NOT be introduced unless unavoidable and MUST be justified inline with a comment
- **Data shapes shared across pages/components** are defined in one place (`src/types/` or `src/domain/`) and imported, not re-declared
- **Public APIs between modules** are explicit (named exports, narrow surfaces), accidental cross-module reach-through is disallowed

**Example**: Goal data types live in `src/domain/types/Goal.ts` and are imported wherever needed.

### V. Predictable Change (Tests Where It Counts + Small, Reversible PRs)

We protect critical math and user journeys so upgrades don't silently break behavior.

- **Financial calculation logic MUST have unit tests** (e.g., under `src/pages/Planner/hooks/*.test.ts` or colocated with the utility)
- **UI tests are optional** unless a feature spec requires them, but regressions in key flows MUST be prevented by at least one automated check
- **Dependency upgrades** are done in focused PRs (one dependency family at a time) with a short upgrade note in the PR description

**Example**: `useCalculator.test.ts` tests all allocation calculation edge cases.

## Directory Structure

```text
goal-based-financial-planner/
├── public/                  # Static assets (index.html, favicon, etc.)
├── src/
│   ├── components/          # Shared, reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   └── ...
│   ├── pages/               # Page-specific components with colocated logic
│   │   ├── Planner/
│   │   │   ├── Planner.tsx          # Page component
│   │   │   ├── Planner.test.tsx
│   │   │   ├── components/          # Page-specific components
│   │   │   ├── hooks/               # Page-specific hooks (calculators, etc.)
│   │   │   └── types.ts             # Page-specific types
│   │   ├── Dashboard/
│   │   └── ...
│   ├── domain/              # Business logic, types, constants (pure, no UI)
│   │   ├── types/           # Shared type definitions
│   │   ├── constants.ts     # App-wide constants
│   │   └── ...
│   ├── util/                # Utility functions and adapters
│   │   ├── storage.ts       # LocalStorage adapter
│   │   ├── formatNumber.ts  # Number formatting utility
│   │   └── ...
│   ├── theme.ts             # Material-UI theme configuration
│   ├── App.tsx              # Root application component
│   └── index.tsx            # Entry point
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml           # Test, lint, coverage checks
│       └── deploy.yml       # GitHub Pages deployment
├── .specify/                # Project governance and planning
│   └── memory/
│       └── constitution.md  # This constitution (source of truth)
├── docs/                    # Development documentation (this directory)
└── package.json             # Dependencies and scripts
```

### Key Directory Purposes

- **`src/components/`**: Shared UI primitives that can be used across multiple pages. Must not import from `src/pages/`.
- **`src/pages/`**: Page-specific components with colocated hooks, types, and tests. Each page is self-contained.
- **`src/domain/`**: Pure business logic and types. No UI dependencies, easily testable.
- **`src/util/`**: Side-effect adapters and utility functions. Thin wrappers for easy migration.
- **`src/theme.ts`**: Centralized Material-UI theme for consistent styling.

## Key Dependencies

### UI & Styling

- **React 18**: Component library with hooks and concurrent features
- **Material-UI (MUI) v6**: Comprehensive UI component library
  - `@mui/material`: Core components (buttons, cards, inputs, etc.)
  - `@mui/icons-material`: Icon library
  - `@mui/x-charts`: Charting components for data visualization
  - `@mui/x-date-pickers`: Date and time picker components
- **Reason chosen**: MUI provides enterprise-grade, accessible, themeable components out of the box, reducing custom styling effort

### State Management

- **React Hooks**: `useState`, `useEffect`, `useReducer` for local component state
- **LocalStorage**: Persistence via `src/util/storage.ts` adapter
- **No Redux**: Chosen to keep state management simple and colocated with components
- **Reason**: For a pure frontend app with minimal shared state, hooks + localStorage are sufficient and easier to maintain

### Forms & Validation

- **react-hook-form**: Form state management and validation
- **Reason**: Uncontrolled components improve performance, built-in validation reduces boilerplate

### Utilities

- **dayjs**: Date manipulation library (MUI date pickers dependency)
- **react-use**: Collection of React hooks for common patterns
- **Reason**: Lightweight, focused libraries that don't add significant bundle size

### Testing

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Reason**: Industry-standard testing stack for React applications, encourages user-centric tests

### Build & Development

- **Create React App (react-scripts)**: Build tooling and dev server
- **TypeScript**: Type safety and better IDE support
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Reason**: Standardized tooling reduces configuration overhead and ensures consistency

## Design Decisions

### Pure Frontend Architecture

**Decision**: No backend server; all logic runs in the browser.

**Rationale**:

- **Privacy**: User financial data never leaves their device
- **Simplicity**: No server infrastructure to manage or deploy
- **Cost**: Free hosting via GitHub Pages
- **Offline capability**: Can work offline (future enhancement)

**Tradeoffs**:

- Limited to client-side operations (no server-side calculations or database queries)
- Data portability requires manual export/import
- No multi-device sync without external storage

### State Management: Hooks + LocalStorage

**Decision**: Use React hooks for state management, persist to localStorage.

**Rationale**:

- **Simplicity**: Avoids Redux/MobX complexity for simple state needs
- **Co-location**: State lives with components that use it
- **Performance**: No unnecessary re-renders from global state updates
- **Persistence**: LocalStorage provides automatic data persistence

**Tradeoffs**:

- Harder to share state across distant components (acceptable given page-centric architecture)
- LocalStorage size limits (~5MB), but sufficient for financial planning data
- No time-travel debugging (acceptable for this use case)

### Material-UI for Components

**Decision**: Use Material-UI as the primary component library.

**Rationale**:

- **Comprehensive**: Provides all needed components (forms, cards, charts, date pickers)
- **Accessible**: Built-in ARIA support and keyboard navigation
- **Themeable**: Centralized theming via `src/theme.ts`
- **Well-maintained**: Active development and strong community

**Tradeoffs**:

- Larger bundle size than custom components
- Upgrade complexity (mitigated by upgrade-friendly boundaries principle)
- Learning curve for new contributors (mitigated by comprehensive docs)

### Test Coverage Thresholds

**Decision**: Enforce 70% line coverage, 60% branch coverage, 70% function coverage.

**Rationale**:

- **Balance**: High enough to catch most bugs, low enough to avoid diminishing returns
- **Focus**: Critical financial calculations MUST be tested
- **Maintainability**: Encourages testable code design

**Tradeoffs**:

- Some boilerplate/trivial code may be excluded
- Coverage metrics don't guarantee bug-free code (hence focus on critical paths)

## Data Flow

1. **User Input**: User interacts with form components (Material-UI inputs)
2. **State Update**: `useState` or `useReducer` updates component state
3. **Business Logic**: Hooks (e.g., `useCalculator`) derive calculated values
4. **Rendering**: React re-renders affected components
5. **Persistence**: Storage adapter (`src/util/storage.ts`) saves to localStorage
6. **Visualization**: Charts (MUI X Charts) display calculated data

**Example Flow**: Creating a Financial Goal

```text
User fills form → react-hook-form validates →
Submit handler calls hook → Hook calculates allocations (domain logic) →
State updates → UI re-renders → Storage adapter persists to localStorage →
Chart component visualizes data
```

## Testing Strategy

### Unit Tests

- **Target**: Domain logic, hooks, utility functions
- **Location**: Colocated with source (e.g., `useCalculator.test.ts`)
- **Framework**: Jest
- **Coverage**: MUST meet 70/60/70 thresholds

**Example**: Test all edge cases for allocation calculations in `useCalculator.test.ts`.

### Component Tests

- **Target**: UI components, user interactions
- **Location**: Colocated with components (e.g., `Planner.test.tsx`)
- **Framework**: React Testing Library
- **Focus**: User-centric queries (getByRole, getByText) not implementation details

**Example**: Test that goal form submission creates a new goal.

### Integration Tests

- **Target**: Multi-component workflows
- **Framework**: React Testing Library
- **Scope**: Limited to critical user journeys (optional unless feature spec requires)

**Example**: Test complete goal creation flow from form to visualization.

## Deployment

- **Platform**: GitHub Pages
- **Trigger**: Automatic deployment on push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **URL**: [https://goal-based-financial-planner.github.io/goal-based-financial-planner/](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)

**Process**:

1. CI workflow (`.github/workflows/ci.yml`) runs tests and linting
2. If CI passes, `deploy.yml` workflow builds the app (`npm run build`)
3. GitHub Pages serves the static files from the `gh-pages` branch

## Future Considerations

### Potential Enhancements

- **Data Export/Import**: Allow users to backup/restore their data
- **PWA Support**: Offline capability with service workers
- **Multi-device Sync**: Optional cloud sync (e.g., Google Drive, Dropbox)
- **Internationalization**: Support multiple languages and currencies
- **Advanced Charting**: More visualization options (projections, scenarios)

### Upgrade Path

When upgrading dependencies:

1. Run `npm outdated` to identify updates
2. Update one dependency family at a time (e.g., all `@mui/*` packages together)
3. Run `npm run test:cov` to ensure no regressions
4. Test manually in browser (especially UI components)
5. Document changes in PR description
6. Follow constitution principle V (small, reversible PRs)

## Additional Resources

- [Development Guide](DEVELOPMENT.md): Setup and workflow
- [Testing Guide](TESTING.md): Testing approach and best practices
- [Deployment Guide](DEPLOYMENT.md): Deployment process and troubleshooting
- [Constitution](../.specify/memory/constitution.md): Governance principles (source of truth)
- [Material-UI Docs](https://mui.com/): Component API reference
- [React Docs](https://react.dev/): React fundamentals and hooks
