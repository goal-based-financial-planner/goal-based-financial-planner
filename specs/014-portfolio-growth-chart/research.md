# Research: Portfolio Growth Projection Chart

**Feature**: 014-portfolio-growth-chart  
**Date**: 2026-06-07

## Decision 1: Chart Library

**Decision**: Use `@mui/x-charts` (already at `^7.23.6` in `package.json`) — specifically `LineChart` with area shading.

**Rationale**: Already installed and already in use in the codebase (`InvestmentPieChart`, `InvestmentSuggestionsDoughnutChart`, `TermwiseProgressBox` all use it). No new dependency. MUI v6 `LineChart` in `@mui/x-charts` v7 supports multi-series, custom tooltips, reference lines, and area fills. Wrapping it in a local component satisfies Constitution Principle III.

**Alternatives considered**:
- **Recharts**: Not installed, would require a new dependency.
- **Chart.js / react-chartjs-2**: Not installed, would require new dependencies.
- **Raw SVG**: More control, but far more work to replicate tooltips, legends, scales.
- **Victory**: Not installed.

---

## Decision 2: Projection Series Granularity

**Decision**: Generate one data point per month for each goal's projection series.

**Rationale**: Goals span from 1 month to 30+ years. Monthly granularity gives smooth curves without excessive data points (max ~360 for a 30-year goal). This aligns with how the existing `calculateFutureValue` function works (operates in months). Yearly granularity would be too coarse for short-term goals.

**Alternatives considered**:
- **Yearly granularity**: Too coarse — a 2-year goal would have only 2 points, not a smooth curve.
- **Weekly granularity**: Excessive data (~1,560 points for a 30-year goal) with no visual benefit.

---

## Decision 3: Chart Placement in the UI

**Decision**: Add a third tab "Growth Chart" to the existing `InvestmentSuggestionsBox` tab group (alongside "Allocation Plan" and "Investment Tracker").

**Rationale**: The `InvestmentSuggestionsBox` already has a `Tabs` component with two tabs. Adding a third tab is the least disruptive integration — no layout changes needed, the chart sits in context with other investment views, and it stays within existing page structure.

**Alternatives considered**:
- **New top-level section in Planner**: Would require layout changes and consume vertical space on the primary view.
- **Separate page/route**: Over-engineered for this feature size; the planner is a single-page app.
- **Inline above investment suggestions**: Would push content below the fold and always be visible even when not needed.

---

## Decision 4: Projection Calculation Location

**Decision**: Add a new pure function `buildGoalProjectionSeries` to `src/domain/investmentCalculations.ts`, and a new hook `useGoalProjections` in `src/pages/Planner/hooks/`.

**Rationale**: Constitution Principle I mandates financial logic in `src/domain/`. The hook handles the React/memoization layer, while the pure function is independently testable. `calculateFutureValue` already in `investmentCalculations.ts` can be reused directly.

**Alternatives considered**:
- **Calculation inside the component**: Violates Constitution Principle I (business rules must not live in UI components).
- **Calculation in the existing `useInvestmentCalculator` hook**: Would bloat the hook; projection series generation is a distinct concern.

---

## Decision 5: PDF Export of Chart

**Decision**: Include the chart in the `PrintableReport` as a simplified table of projected year-end values (not a rendered chart image).

**Rationale**: `PrintableReport` uses inline HTML/CSS styles and is captured by `html2canvas`. Chart SVGs rendered by `@mui/x-charts` may not reliably render in `html2canvas` due to SVG-to-canvas limitations. A data table showing "Year | Projected Value" for each goal is always reliable and provides the same information in the export format.

**Alternatives considered**:
- **Capture chart SVG directly**: `html2canvas` has known issues with SVG content; unreliable across browsers.
- **Use a canvas-based chart library**: Would require a new dependency or replacing the existing chart.
- **Omit from PDF entirely**: FR-010 requires the chart to be included in the PDF — a table satisfies this without the reliability risk.

---

## Decision 6: Actual Value Marker Representation

**Decision**: Show the actual accumulated value as a vertical reference line at today's date, with a dot marker on each goal's series where it crosses today.

**Rationale**: `@mui/x-charts` v7 `LineChart` supports `referenceLines` prop for vertical/horizontal markers. This cleanly separates "historical" from "projected" visually without a separate data series for each goal.

**Alternatives considered**:
- **Separate "actual" series ending at today**: Would require a second series per goal, doubling the series count and cluttering the legend.
- **Shaded region for elapsed period**: More complex to implement and harder to read when goals have different start dates.
