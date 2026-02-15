# README.md Enhancement Contract

**Purpose**: Define structure and content requirements for README.md
**Target File**: `/README.md` (enhance existing)

## Required Sections (in order)

### 1. Title + Badges
```markdown
# Goal Based Financial Planner

![CI](https://github.com/goal-based-financial-planner/goal-based-financial-planner/actions/workflows/ci.yml/badge.svg)
[![Coverage](https://img.shields.io/badge/coverage-check%20CI%20report-blue)](coverage/)
[![License](https://img.shields.io/github/license/goal-based-financial-planner/goal-based-financial-planner)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)
```

**Requirements**:
- Badges must appear immediately after title
- CI badge must reference actual workflow file (ci.yml)
- GitHub Pages badge must link to actual deployment URL
- License badge must link to LICENSE file

---

### 2. Description
```markdown
## Description

The Goal Based Financial Planner is a pure front-end application designed to help users set and track financial goals. Users can input their financial objectives, choose allocation ratios for investment categories, and the planner calculates optimal investment distribution to meet their goals. This project provides a simple, intuitive interface for financial planning without requiring backend services.

**Key Features:**
- 🎯 Goal-based financial planning
- 📊 Visual investment tracking with charts
- 💰 Automatic allocation calculations
- 🔒 Privacy-focused (all data stays in browser)
- 📱 Responsive design for mobile and desktop
```

**Requirements**:
- Clearly state "what" the project does
- Explain "who" it's for
- Highlight key differentiators (pure frontend, privacy-focused)
- Use emojis sparingly for visual appeal (optional)

---

### 3. Live Demo
```markdown
## 🚀 Live Demo

Try the application now: **[Goal Based Financial Planner](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)**

No installation required - start planning your financial goals immediately!
```

**Requirements**:
- Prominent link to GitHub Pages deployment
- Clear call-to-action
- Above "Getting Started" section for immediate access

---

### 4. Getting Started
```markdown
## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
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
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000).

### Building for Production

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `build/` directory.
```

**Requirements**:
- Clear, numbered steps
- Actual commands that work (tested)
- Include both development and production build instructions
- Specify Node.js version requirement

---

### 5. Running Tests
```markdown
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
- **Fails if coverage falls below thresholds** (70% lines, 60% branches, 70% functions)
- Outputs summary to terminal and detailed report to `coverage/` directory

### Interpreting Results

- ✅ **Green/passing**: Coverage meets or exceeds all thresholds
- ❌ **Red/failing**: Coverage below threshold - add tests to uncovered areas
- 📊 View detailed report: `coverage/lcov-report/index.html`

For more details on testing, see [Testing Guide](docs/TESTING.md).
```

**Requirements**:
- Document both `npm test` and `npm run test:cov`
- Explain coverage thresholds (must match package.json config)
- Link to detailed testing guide in /docs
- Include success/failure interpretation

---

### 6. Contributing
```markdown
## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- 📝 Reporting bugs
- 💡 Suggesting features
- 🔧 Setting up development environment
- ✅ Pull request process
- 🧪 Testing requirements

Please note that this project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.
```

**Requirements**:
- Link to CONTRIBUTING.md
- Highlight key topics covered in contributing guide
- Reference Code of Conduct
- Welcoming tone

---

### 7. License
```markdown
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

**Requirements**:
- State license type (MIT)
- Link to LICENSE file
- Keep concise (details in LICENSE file)

---

### 8. Project Links (optional footer)
```markdown
## Project Links

- 🌐 [Live Demo](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)
- 📖 [Documentation](docs/)
- 🐛 [Report Bug](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)
- 💡 [Request Feature](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)
- 🔒 [Security Policy](SECURITY.md)
```

**Requirements** (optional section):
- Quick navigation links
- Link to issue tracker
- Link to security policy
- Keep concise

---

## Content to Remove/Update from Current README

**Remove**:
- Placeholder text like "yourusername" → replace with actual org/repo name
- Outdated badge links
- Duplicate information

**Update**:
- Badge URLs to use actual workflow files
- GitHub Pages URL to correct deployment URL
- Repository URLs to use correct organization name
- Add missing sections (Live Demo at top, Contributing with CoC reference)

---

## Validation Criteria

Before marking complete:
- [ ] All badges display correctly (not 404)
- [ ] GitHub Pages link works and goes to live deployment
- [ ] All internal links resolve (CONTRIBUTING.md, LICENSE, etc.)
- [ ] Commands are tested and work (npm install, npm start, npm test)
- [ ] Node.js version requirement is accurate
- [ ] Coverage thresholds match package.json configuration
- [ ] Formatted with Prettier
- [ ] No placeholder text remains (yourusername, etc.)
- [ ] Tone is welcoming and inclusive
