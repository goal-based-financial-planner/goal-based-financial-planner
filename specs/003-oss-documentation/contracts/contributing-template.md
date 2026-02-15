# CONTRIBUTING.md Template Contract

**Purpose**: Define contribution guidelines and process
**Target File**: `/CONTRIBUTING.md` (new file)

## Template Structure

```markdown
# Contributing to Goal Based Financial Planner

Thank you for your interest in contributing! We appreciate all contributions, from bug reports to new features.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior through GitHub.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When reporting a bug, please include:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, Node.js version)

**Create a bug report**: [New Issue](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues/new)

### Suggesting Features

We welcome feature suggestions! Please:
- Check if the feature has already been requested
- Provide clear use case and benefits
- Explain how it fits the project's goals (pure frontend, privacy-focused financial planning)

**Request a feature**: [New Issue](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues/new)

### Contributing Code

1. **Fork the repository** and create a branch from `main`
2. **Set up your development environment** (see [Development Guide](docs/DEVELOPMENT.md))
3. **Make your changes** following our coding standards
4. **Add or update tests** to maintain coverage thresholds
5. **Ensure tests pass**: `npm run test:cov`
6. **Format your code**: `npm run format` (Prettier)
7. **Commit your changes** with clear, descriptive messages
8. **Push to your fork** and submit a pull request

## Development Setup

Quick start:
```bash
git clone https://github.com/YOUR-USERNAME/goal-based-financial-planner.git
cd goal-based-financial-planner
npm install
npm start
```

For detailed setup instructions, see [Development Guide](docs/DEVELOPMENT.md).

## Coding Standards

This project follows the principles defined in [`.specify/memory/constitution.md`](.specify/memory/constitution.md). Key principles:

- **Clear Layering**: Business logic in `src/domain/`, UI in `src/components/` and `src/pages/`
- **Feature Co-location**: Page-specific code lives under `src/pages/<Page>/`
- **Type Safety**: All new code must be TypeScript with proper types (no `any` without justification)
- **Upgrade-Friendly**: Use public APIs only, wrap third-party components
- **Predictable Change**: Test financial calculations, keep PRs small and focused

## Testing Requirements

- **Unit tests**: Required for all business logic (domain/, hooks/)
- **Coverage thresholds**: 70% lines, 60% branches, 70% functions (enforced by CI)
- **Test location**: Colocate tests with source (e.g., `useCalculator.test.ts` next to `useCalculator.ts`)
- **Test framework**: Jest + React Testing Library

See [Testing Guide](docs/TESTING.md) for detailed testing instructions.

## Pull Request Process

1. **Update documentation** if needed (README, /docs guides)
2. **Follow the PR checklist** below
3. **Link related issues** in the PR description
4. **Wait for review** - maintainers will review within a few days
5. **Address feedback** - make requested changes
6. **Merge** - maintainer will merge once approved

### Pull Request Checklist

Before submitting, ensure:

- [ ] Tests pass (`npm run test:cov`)
- [ ] Code is formatted (`npm run format` or Prettier auto-format)
- [ ] No console.log or debug statements
- [ ] TypeScript types are correct (no `any` without justification)
- [ ] Documentation updated (if changing public APIs or user-facing features)
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains what and why (not just how)
- [ ] No merge conflicts with main branch

## Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Start with a capital letter
- No period at the end of the first line
- Reference issues (e.g., "Fix calculation bug (#123)")

**Examples**:
- ✅ `Add goal priority feature to planner page`
- ✅ `Fix allocation calculation for edge case (#45)`
- ✅ `Update README with coverage badge`
- ❌ `fixed bug`
- ❌ `WIP commit`

## Getting Help

- 💬 **Questions?** Open a [Discussion](https://github.com/goal-based-financial-planner/goal-based-financial-planner/discussions) or create an issue
- 📖 **Documentation**: Check [docs/](docs/) for detailed guides
- 🐛 **Found a bug?** Create an [Issue](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)

## Recognition

All contributors will be recognized! We appreciate your time and effort in making this project better.

---

**Note**: This project is maintained by volunteers. Please be patient and respectful in all interactions.
```

## Validation Criteria

- [ ] Welcoming, inclusive tone throughout
- [ ] Code of Conduct referenced prominently
- [ ] Clear bug reporting and feature request process
- [ ] Links to /docs guides for detailed instructions
- [ ] PR checklist matches CI requirements (tests, formatting, types)
- [ ] Commit message guidelines included
- [ ] Constitution principles referenced
- [ ] Testing requirements clearly stated
- [ ] No outdated or placeholder content
- [ ] All links resolve correctly
