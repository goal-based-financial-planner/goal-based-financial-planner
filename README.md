# Goal Based Financial Planner

![CI](https://github.com/goal-based-financial-planner/goal-based-financial-planner/actions/workflows/ci.yml/badge.svg)
[![Coverage](https://img.shields.io/badge/coverage-check%20CI%20report-blue)](coverage/)
[![License](https://img.shields.io/github/license/goal-based-financial-planner/goal-based-financial-planner)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)

## Description

The Goal Based Financial Planner is a pure frontend application designed to help users set and track financial goals. Users can input their financial objectives, choose allocation ratios for investment categories, and the planner calculates optimal investment distribution to meet their goals. This project provides a simple, intuitive interface for financial planning without requiring backend services.

**Key Features:**

- 🎯 Goal-based financial planning
- 📊 Visual investment tracking with charts
- 💰 Automatic allocation calculations
- 💾 Flexible storage — save to a local file or sync with Google Drive
- 🔄 Autosave with manual save and retry on failure
- 📱 Responsive design for mobile and desktop

## 🚀 Live Demo

Try the application now: **[Goal Based Financial Planner](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)**

No installation required - start planning your financial goals immediately!

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/goal-based-financial-planner/goal-based-financial-planner.git
   ```

2. Navigate to the project directory:

   ```bash
   cd goal-based-financial-planner
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will open in your browser at [http://localhost:5173](http://localhost:5173).

#### Google Drive (optional)

To enable Google Drive storage locally, copy `.env.example` to `.env.local` and fill in your OAuth Client ID:

```bash
cp .env.example .env.local
# then edit .env.local and set VITE_GOOGLE_CLIENT_ID
```

See [Google Drive Setup](#google-drive-setup) for full instructions.

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Running Tests

### Run tests in watch mode (development):

```bash
npm test
```

### Run tests with coverage (CI/validation):

```bash
npm run test:cov
```

This command:

- Runs all tests once (non-interactive)
- Generates a coverage report
- **Fails if coverage falls below thresholds** (63% lines, 55% branches, 63% functions)
- Outputs summary to terminal and detailed report to `coverage/` directory

### Interpreting Results

- ✅ **Green/passing**: Coverage meets or exceeds all thresholds
- ❌ **Red/failing**: Coverage below threshold - add tests to uncovered areas
- 📊 View detailed report: `coverage/lcov-report/index.html`

For more details on testing, see [Testing Guide](docs/TESTING.md).

## Google Drive Setup

To enable Google Drive storage (optional):

1. Go to [Google Cloud Console](https://console.cloud.google.com) and enable the **Google Drive API** for your project.
2. Configure the **OAuth consent screen** — add the `https://www.googleapis.com/auth/drive.appdata` scope.
3. Under **Credentials**, open your OAuth 2.0 Client ID and add your domain(s) to **Authorized JavaScript origins**:
   - `http://localhost:5173` (local dev)
   - `https://goal-based-financial-planner.github.io` (production)
4. Copy `.env.example` to `.env.local` and set `VITE_GOOGLE_CLIENT_ID` to your Client ID.
5. For production deployments, add `VITE_GOOGLE_CLIENT_ID` as a repository secret in **GitHub → Settings → Secrets and variables → Actions**.

> The Client Secret is **not** needed — this app uses Google's browser-only token flow.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- 📝 Reporting bugs
- 💡 Suggesting features
- 🔧 Setting up development environment
- ✅ Pull request process
- 🧪 Testing requirements

Please note that this project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Links

- 🌐 [Live Demo](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)
- 📖 [Documentation](docs/)
- 🐛 [Report Bug](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)
- 💡 [Request Feature](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)
- 🔒 [Security Policy](SECURITY.md)
