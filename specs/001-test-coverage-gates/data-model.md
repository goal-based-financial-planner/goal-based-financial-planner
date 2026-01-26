# Data Model: Test Coverage Gates

This feature does not introduce runtime “business data” entities. Instead it introduces a few
configuration and artifact concepts used to enforce quality gates.

## Entities

### CoverageThreshold
- **Represents**: Minimum acceptable automated test coverage for the repository.
- **Attributes**:
  - `branches` (number, percent)
  - `functions` (number, percent)
  - `lines` (number, percent)
  - `statements` (number, percent)
- **Lifecycle**:
  - defined in repository configuration
  - enforced during automated test runs

### CoverageReport
- **Represents**: Output of a test run that includes coverage measurements.
- **Attributes**:
  - summary totals for lines/branches/functions/statements
  - per-file breakdown (optional, informational)
- **Lifecycle**:
  - generated on demand (developer or CI)
  - used to decide pass/fail against `CoverageThreshold`

### SnapshotBaseline
- **Represents**: Stored expected rendering output for a component/page under test.
- **Attributes**:
  - snapshot content (text format)
  - association to test file and component/page under test
- **Lifecycle**:
  - created when first snapshot test is added
  - updated intentionally when UI changes are accepted

### TestSuite
- **Represents**: The set of executable automated tests in the repository.
- **Attributes**:
  - unit tests for calculation logic
  - component/page tests (including snapshot-style tests where appropriate)
- **Lifecycle**:
  - maintained over time; obsolete tests removed as part of this feature

## Relationships

- `TestSuite` **generates** `CoverageReport`
- `CoverageReport` **is evaluated against** `CoverageThreshold`
- `TestSuite` **includes** tests that reference `SnapshotBaseline` artifacts

