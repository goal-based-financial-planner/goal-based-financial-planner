# Goal Based Financial Planner

[![GitHub license](https://img.shields.io/github/license/goal-based-financial-planner/goal-based-financial-planner)](LICENSE)
[![GitHub pages](https://img.shields.io/badge/github-pages-blue)](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)

## Description

The Goal Based Financial Planner is a pure front-end application designed to help users set and track financial goals. Users can input their financial objectives, choose the allocation ratio of how they want to invest into various categories, and the planner will calculate and display how much they should be investing into each category to meet their goals. This project aims to provide a simple and intuitive interface for financial planning without requiring any backend services.

**Note:** This project is still a work in progress. We are actively developing new features and improving the user experience.

## How to Checkout and Start

To get started with the Goal Based Financial Planner, follow these steps:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/goal-based-financial-planner.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd goal-based-financial-planner
    ```

3. **Install the dependencies:**
    ```bash
    npm install
    ```

4. **Start the development server:**
    ```bash
    npm start
    ```

5. **Open your browser and navigate to:**
    ```
    http://localhost:3000
    ```

Alternatively, you can view the project hosted on GitHub Pages:
[Goal Based Financial Planner](https://yourusername.github.io/goal-based-financial-planner/)

## How to Test

Testing the Goal Based Financial Planner is straightforward:

1. **Run tests in watch mode (development):**
    ```bash
    npm test
    ```

2. **Run tests with coverage (CI/validation):**
    ```bash
    npm run test:cov
    ```
   
   This command:
   - Runs all tests once (non-interactive)
   - Generates a coverage report showing tested vs untested code
   - **Fails if coverage falls below minimum thresholds** (70% lines, 60% branches, 70% functions)
   - Outputs coverage summary to the terminal
   - Generates detailed reports in `coverage/` directory

3. **Interpreting coverage results:**
   - **Green/passing**: Coverage meets or exceeds all thresholds ✓
   - **Red/failing**: Coverage below threshold; add tests to uncovered areas
   - Check `coverage/lcov-report/index.html` for a visual breakdown of coverage by file

4. **Verify functionality:**
    - Ensure that you can add, edit, and delete financial goals.
    - Check that the allocation ratio input and investment calculations are working as expected.
    - Report any bugs or issues through the project's [GitHub Issues](https://github.com/yourusername/goal-based-financial-planner/issues) page.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Project Link

For more details, visit the project's GitHub page: [Goal Based Financial Planner](https://github.com/yourusername/goal-based-financial-planner)
