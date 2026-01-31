# Quickstart: Test Coverage Gates

## Prerequisites

- Install dependencies: `npm install`

## Run tests (developer loop)

- Run tests in watch mode: `npm test`
  - Interactive mode with file watcher
  - Re-runs tests on file changes
  - Press `u` to update snapshots
  - Press `a` to run all tests

## Run tests with coverage (coverage gate)

- Run once with coverage reporting: `npm run test:cov`

**Expected outcomes:**
- A coverage report is produced and displayed in terminal
- The command exits with code 0 if coverage meets thresholds ✓
- The command exits with code 1 (fails) if coverage is below the configured minimum ✗
- Detailed HTML report generated in `coverage/lcov-report/index.html`

**Current thresholds (package.json):**
- Lines: 70%
- Branches: 60%
- Functions: 70%
- Statements: 70%

## Interpreting coverage reports

**Terminal output:**
- Shows per-file coverage percentages
- Highlights uncovered lines in red
- Displays overall summary with PASS/FAIL status

**HTML report** (`coverage/lcov-report/index.html`):
- Visual breakdown by file and directory
- Click files to see line-by-line coverage
- Red highlights = uncovered code
- Green highlights = covered code

## Update snapshots (when UI changes are intentional)

- Run tests and update snapshots:
  - **Option A (recommended)**: `npm test` then press `u` in watch mode
  - **Option B**: `npm test -- -u` to update all snapshots non-interactively

## CI Behavior

- **GitHub Actions CI** (`.github/workflows/ci.yml`): Runs `npm run test:cov` on every PR and push to main
- **Deploy workflow** (`.github/workflows/deploy.yml`): Runs `npm run test:cov` before deploying to GitHub Pages
- If coverage fails, CI fails and deploy is blocked

## Tips for stability

- Prefer fixed dates/times in tests when rendering date-related UI (use `mockTodayDate` from `src/testUtils/mockDayjs.ts`)
- Avoid assertions on unstable implementation details; assert user-visible behavior where possible
- Keep snapshots small and focused to reduce churn
- Use `src/testUtils/testEnv.ts` helpers for deterministic localStorage/locale behavior

