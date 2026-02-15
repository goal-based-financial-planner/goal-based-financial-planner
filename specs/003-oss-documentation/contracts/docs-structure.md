# /docs Directory Structure Contract

**Purpose**: Define structure and content for development guides in /docs directory
**Target Location**: `/docs/` (new directory)

## Directory Structure

```text
docs/
├── DEVELOPMENT.md      # Development environment setup
├── ARCHITECTURE.md     # Codebase structure and design decisions
├── TESTING.md          # Testing guide
└── DEPLOYMENT.md       # Deployment process
```

---

## 1. DEVELOPMENT.md

**Purpose**: Guide new contributors through environment setup
**Target Audience**: First-time contributors with no prior project knowledge

### Template Structure

```markdown
# Development Guide

## Overview

Goal Based Financial Planner is a React + TypeScript application. This guide will help you set up a local development environment.

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
git --version
```

## Initial Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/goal-based-financial-planner.git
   cd goal-based-financial-planner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages from `package.json`.

3. **Verify installation:**
   ```bash
   npm run build
   ```
   Should complete without errors.

## Running the Application

### Development Mode

Start the development server:
```bash
npm start
```

- Opens automatically at [http://localhost:3000](http://localhost:3000)
- Hot reload enabled (changes reflect immediately)
- Console errors and warnings displayed in browser and terminal

### Production Build

Create an optimized production build:
```bash
npm run build
```

Serve the production build locally:
```bash
npx serve -s build
```

Then visit [http://localhost:3000](http://localhost:3000).

## Project Structure Overview

```text
goal-based-financial-planner/
├── src/
│   ├── components/      # Reusable UI components (shared across pages)
│   ├── pages/           # Page-specific components with colocated logic
│   ├── domain/          # Business logic, types, constants
│   ├── util/            # Utility functions and adapters
│   └── theme.ts         # Material-UI theme configuration
├── public/              # Static assets
├── .github/workflows/   # CI/CD pipelines
├── .specify/            # Project governance and planning
└── docs/                # This directory
```

For detailed architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our [constitution principles](.specify/memory/constitution.md)
   - Keep business logic in `src/domain/`
   - Keep UI components presentational

3. **Test your changes:**
   ```bash
   npm test              # Run tests in watch mode
   npm run test:cov      # Run tests with coverage
   npm run lint          # Check code style
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

### Code Style

- **Formatting**: Prettier (auto-format on save recommended)
- **Linting**: ESLint (run with `npm run lint`)
- **TypeScript**: Strict mode enabled (no `any` without justification)

**VS Code setup (recommended):**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Common Tasks

### Creating a New Component

```bash
# Example: Creating a Button component
src/components/Button/
├── Button.tsx
├── Button.test.tsx
└── index.ts  # Re-export
```

### Adding a New Page

```bash
# Example: Creating a Settings page
src/pages/Settings/
├── Settings.tsx
├── Settings.test.tsx
├── components/      # Page-specific components
├── hooks/           # Page-specific hooks
└── index.ts
```

### Running Specific Tests

```bash
npm test -- Button.test.tsx        # Run single test file
npm test -- --coverage             # Run with coverage
npm test -- --watch                # Watch mode
```

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

### Tests Fail Locally but Pass in CI

- Ensure you're on the latest `main` branch
- Clear Jest cache: `npm test -- --clearCache`
- Check Node.js version matches CI (v18)

### Prettier/ESLint Conflicts

- Prettier takes precedence (format with Prettier first)
- Run both: `npm run format && npm run lint`

## Next Steps

- **Architecture**: Understand the codebase structure - [ARCHITECTURE.md](ARCHITECTURE.md)
- **Testing**: Learn how to write tests - [TESTING.md](TESTING.md)
- **Contributing**: Review contribution guidelines - [../CONTRIBUTING.md](../CONTRIBUTING.md)

## Getting Help

- 📖 Check [ARCHITECTURE.md](ARCHITECTURE.md) for codebase structure questions
- 🐛 Found a bug in setup? [Create an issue](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)
- 💬 General questions? [Start a discussion](https://github.com/goal-based-financial-planner/goal-based-financial-planner/discussions)
```

---

## 2. ARCHITECTURE.md

**Purpose**: Explain codebase structure and design decisions
**Target Audience**: Contributors wanting to understand the system

### Template Outline

```markdown
# Architecture

## Project Overview
[React + TypeScript, pure frontend, Material-UI]

## Constitution Principles
[Reference .specify/memory/constitution.md with key principles]

## Directory Structure
[Detailed explanation of src/, components/, pages/, domain/]

## Key Dependencies
[React, Material-UI, testing libraries - why chosen]

## Design Decisions
[Clear Layering, Feature Co-location, Type Safety - examples]

## State Management
[How state is handled - no Redux, local state + localStorage]

## Data Flow
[User input → domain logic → UI update]

## Testing Strategy
[Unit tests for domain, React Testing Library for UI]

## Deployment
[GitHub Pages, CI/CD via GitHub Actions]
```

---

## 3. TESTING.md

**Purpose**: Explain testing approach and requirements
**Target Audience**: Contributors writing or fixing tests

### Template Outline

```markdown
# Testing Guide

## Overview
[Jest + React Testing Library philosophy]

## Running Tests
[npm test, npm run test:cov commands]

## Coverage Requirements
[70% lines, 60% branches, 70% functions - why these thresholds]

## Writing Tests
[Unit test examples, React component test examples]

## Test Structure
[Colocate tests, naming conventions, describe/it blocks]

## Best Practices
[Test behavior not implementation, user-centric queries]

## Troubleshooting
[Common issues: async tests, mocking, coverage gaps]
```

---

## 4. DEPLOYMENT.md

**Purpose**: Explain deployment process
**Target Audience**: Maintainers and contributors understanding release process

### Template Outline

```markdown
# Deployment Guide

## GitHub Pages Deployment
[Automatic from main branch via .github/workflows/deploy.yml]

## Local Production Build
[npm run build, testing with serve]

## Deployment Workflow
[PR → merge to main → CI passes → auto-deploy to Pages]

## Environment Configuration
[No env vars currently, all configuration in source]

## Deployment Checklist
[Pre-deployment verification steps]

## Rollback Process
[How to revert if deployment fails]
```

---

## Validation Criteria

For all /docs files:
- [ ] Clear, concise writing (no jargon without explanation)
- [ ] Code examples are tested and work
- [ ] All commands are accurate (npm scripts exist)
- [ ] All links resolve (internal and external)
- [ ] Formatted with Prettier
- [ ] Includes "Next Steps" or "Getting Help" section
- [ ] Cross-references other docs appropriately (DEVELOPMENT ↔ ARCHITECTURE ↔ TESTING)
- [ ] No outdated information
- [ ] Accessible to someone new to the project
