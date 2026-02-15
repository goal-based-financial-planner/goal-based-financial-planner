# Development Guide

## Overview

Goal Based Financial Planner is a React + TypeScript application. This guide will help you set up a local development environment and understand the development workflow.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

**Verify installations:**

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
git --version   # Any recent version
```

## Initial Setup

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub first, then clone your fork
git clone https://github.com/YOUR-USERNAME/goal-based-financial-planner.git
cd goal-based-financial-planner
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`, including:

- React and React DOM
- Material-UI components
- TypeScript
- Testing libraries (Jest, React Testing Library)
- Build tools (react-scripts)

**Troubleshooting**: If installation fails, try:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 3. Verify Installation

```bash
npm run build
```

Should complete without errors, creating a `build/` directory.

## Running the Application

### Development Mode

Start the development server:

```bash
npm start
```

- Opens automatically at [http://localhost:3000](http://localhost:3000)
- Hot reload enabled (changes reflect immediately without refresh)
- Console errors and warnings displayed in browser and terminal
- Source maps enabled for debugging

**Development mode features**:

- Fast refresh (preserves component state on code changes)
- Detailed error messages and stack traces
- React DevTools integration
- Unminified code for easier debugging

### Production Build

Create an optimized production build:

```bash
npm run build
```

**Output**: `build/` directory with minified, optimized static files

Serve the production build locally:

```bash
npx serve -s build
```

Then visit [http://localhost:3000](http://localhost:3000).

**Why test production build?**

- Verifies production optimizations don't break functionality
- Tests routing with production base path
- Catches build-time issues before deploying

## Project Structure Overview

```text
goal-based-financial-planner/
├── src/
│   ├── components/      # Reusable UI components (shared across pages)
│   │   ├── Button/
│   │   ├── Card/
│   │   └── ...
│   ├── pages/           # Page-specific components with colocated logic
│   │   ├── Planner/
│   │   │   ├── Planner.tsx          # Page component
│   │   │   ├── Planner.test.tsx     # Page tests
│   │   │   ├── components/          # Page-specific components
│   │   │   ├── hooks/               # Page-specific hooks
│   │   │   └── types.ts             # Page-specific types
│   │   ├── Dashboard/
│   │   └── ...
│   ├── domain/          # Business logic, types, constants (pure, no UI)
│   │   ├── types/       # Shared type definitions
│   │   ├── constants.ts # App-wide constants
│   │   └── ...
│   ├── util/            # Utility functions and adapters
│   │   ├── storage.ts   # LocalStorage adapter
│   │   ├── formatNumber.ts
│   │   └── ...
│   ├── theme.ts         # Material-UI theme configuration
│   ├── App.tsx          # Root application component
│   └── index.tsx        # Entry point
├── public/              # Static assets (index.html, favicon, etc.)
├── .github/workflows/   # CI/CD pipelines
├── .specify/            # Project governance and planning
└── docs/                # Development documentation (this directory)
```

For detailed architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Development Workflow

### 1. Create a Feature Branch

```bash
# Start from the latest main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions**:

- `feature/` - New features (e.g., `feature/add-goal-priority`)
- `fix/` - Bug fixes (e.g., `fix/allocation-calculation`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-calculator-hook`)

### 2. Make Your Changes

Follow our [constitution principles](.specify/memory/constitution.md):

- **Clear Layering**: Business logic in `src/domain/`, UI in `src/components/` and `src/pages/`
- **Feature Co-location**: Page-specific code lives under `src/pages/<Page>/`
- **Type Safety**: All new code must be TypeScript with proper types
- **Upgrade-Friendly**: Use public APIs only, wrap third-party components
- **Predictable Change**: Test financial calculations, keep PRs small

### 3. Test Your Changes

```bash
# Run tests in watch mode (development)
npm test

# Run tests with coverage (before commit)
npm run test:cov

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

For detailed testing guidelines, see [TESTING.md](TESTING.md).

### 4. Commit and Push

```bash
# Stage changes
git add .

# Commit with clear, descriptive message
git commit -m "Add goal priority feature to planner page"

# Push to your fork
git push origin feature/your-feature-name
```

**Commit message guidelines** (from [../CONTRIBUTING.md](../CONTRIBUTING.md)):

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Start with a capital letter
- No period at the end of the first line
- Reference issues (e.g., "Fix calculation bug (#123)")

### 5. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Link related issues
5. Wait for review

For PR guidelines, see [../CONTRIBUTING.md](../CONTRIBUTING.md).

## Code Style

### Formatting

- **Prettier**: Automatic code formatting (configured in `.prettierrc`)
- **Auto-format on save**: Recommended VS Code setting

**VS Code setup** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**Manual formatting**:

```bash
# Format all files
npx prettier --write "src/**/*.{ts,tsx,css,md}"

# Check formatting (CI check)
npx prettier --check "src/**/*.{ts,tsx,css,md}"
```

### Linting

- **ESLint**: Code linting (configured in `package.json`)
- **Rules**: Enforce code quality and consistency

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### TypeScript

- **Strict mode**: Enabled in `tsconfig.json`
- **No `any`**: Avoid `any` type unless absolutely necessary (justify with comment)
- **Explicit types**: Prefer explicit type annotations for function parameters and return types

**Good**:

```typescript
function calculateAllocation(goal: Goal): number {
  return (goal.target - goal.current) / goal.months;
}
```

**Bad**:

```typescript
function calculateAllocation(goal: any): any {
  return (goal.target - goal.current) / goal.months;
}
```

## Common Tasks

### Creating a New Component

**Shared component** (usable across pages):

```bash
src/components/Button/
├── Button.tsx
├── Button.test.tsx
└── index.ts  # Re-export: export { Button } from './Button';
```

**Page-specific component**:

```bash
src/pages/Planner/components/GoalCard/
├── GoalCard.tsx
├── GoalCard.test.tsx
└── index.ts
```

**Component template**:

```typescript
// Button.tsx
import React from 'react';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  );
};
```

### Adding a New Page

```bash
src/pages/Settings/
├── Settings.tsx         # Page component
├── Settings.test.tsx    # Page tests
├── components/          # Page-specific components
├── hooks/               # Page-specific hooks
├── types.ts             # Page-specific types
└── index.ts             # Re-export
```

**Page template**:

```typescript
// Settings.tsx
import React from 'react';
import { Container } from '@mui/material';

export const Settings: React.FC = () => {
  return (
    <Container>
      <h1>Settings</h1>
      {/* Page content */}
    </Container>
  );
};
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- Button.test.tsx

# Run tests in a specific directory
npm test -- src/pages/Planner

# Run tests with coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/pages/Planner/**/*.ts"

# Run tests in watch mode with coverage
npm test -- --coverage --watchAll
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update a specific package
npm update <package-name>

# Update all packages (cautiously)
npm update

# Verify tests still pass
npm run test:cov
```

**Best practice**: Update one dependency family at a time (e.g., all `@mui/*` packages together), not all at once.

## Troubleshooting

### Port 3000 Already in Use

```bash
# Option 1: Use a different port
PORT=3001 npm start

# Option 2: Kill the process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### npm install Fails

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Common causes**:

- Corrupted node_modules
- Network issues during download
- Incompatible Node.js version

### Tests Fail Locally but Pass in CI

**Possible causes**:

- Different Node.js versions (check CI uses v18)
- Stale Jest cache

**Solutions**:

```bash
# Clear Jest cache
npm test -- --clearCache
npm test

# Check Node.js version matches CI
node --version  # Should be v18.x
```

### Prettier/ESLint Conflicts

**Solution**: Prettier takes precedence (format with Prettier first)

```bash
npm run format
npm run lint
```

### TypeScript Errors in Editor but Build Succeeds

**Possible cause**: Editor using different TypeScript version

**Solution**:

1. In VS Code, open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Select "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

### Hot Reload Stops Working

**Possible causes**:

- Too many files open
- Filesystem watcher limit reached (Linux)

**Solutions**:

```bash
# Restart dev server
# Ctrl+C to stop, then npm start again

# Linux: Increase watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Next Steps

- **Architecture**: Understand the codebase structure - [ARCHITECTURE.md](ARCHITECTURE.md)
- **Testing**: Learn how to write tests - [TESTING.md](TESTING.md)
- **Deployment**: Understand the deployment process - [DEPLOYMENT.md](DEPLOYMENT.md)
- **Contributing**: Review contribution guidelines - [../CONTRIBUTING.md](../CONTRIBUTING.md)

## Getting Help

- 📖 Check [ARCHITECTURE.md](ARCHITECTURE.md) for codebase structure questions
- 🐛 Found a bug in setup? [Create an issue](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)
- 💬 General questions? [Start a discussion](https://github.com/goal-based-financial-planner/goal-based-financial-planner/discussions)
- 📚 Review the [constitution](.specify/memory/constitution.md) for governance principles

---

**Happy coding!** If you have any questions or run into issues, don't hesitate to reach out through GitHub Discussions or Issues.
