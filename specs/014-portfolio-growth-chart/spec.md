# Feature Specification: Portfolio Growth Projection Chart

**Feature Branch**: `014-portfolio-growth-chart`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: User description: "Portfolio growth projection chart showing each goal's projected vs actual accumulation over time"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the Full Projection Picture (Priority: P1)

A user who has set up their goals and investment allocations wants to understand whether their current plan will get them to their targets. They open the planner and immediately see a chart that shows, for each goal, both the expected growth trajectory from today to the target date. The chart makes it immediately clear whether the plan is on track and when each goal will be fully funded. This replaces guesswork with a visual confirmation that the plan works (or a clear signal that it doesn't).

**Why this priority**: This is the core value proposition of the new feature — the visual "aha" moment that turns the planner from a number-generator into a story. Without this, the feature doesn't exist.

**Independent Test**: Set up at least two goals with different target dates and investment allocations, navigate to the chart, and verify that a line/area appears for each goal covering the correct time range with the correct end-point value matching the inflation-adjusted target.

**Acceptance Scenarios**:

1. **Given** a user has at least one goal with a target date in the future, **When** they view the chart, **Then** a projection line appears for that goal from its investment start date to its target date, ending at the inflation-adjusted target amount.
2. **Given** a user has multiple goals, **When** they view the chart, **Then** each goal has its own distinct line/area, with a legend identifying each goal by name.
3. **Given** a user has no goals entered, **When** they view the chart, **Then** an empty-state message is shown prompting them to add goals.
4. **Given** a user has a recurring goal, **When** they view the chart, **Then** the recurring goal is represented within its configured duration window.

---

### User Story 2 - Track Actual Accumulated Value vs. Projection (Priority: P2)

A user who has been investing for several months wants to verify that their actual accumulation is tracking the plan. On the same chart that shows the projected growth line, they see their current accumulated portfolio value for each goal as of today — so they can immediately spot whether they are ahead, on track, or falling behind.

**Why this priority**: The comparison between projected and actual is what makes the chart actionable, not just informational. Without it, the chart is purely aspirational; with it, users can course-correct.

**Independent Test**: With investment log entries recorded, verify that the chart shows a distinct "actual" marker or data point up to today's date, and that the value matches the accumulated value calculated from existing investment data.

**Acceptance Scenarios**:

1. **Given** a user views the chart (with or without investment log entries), **When** the chart renders, **Then** the accumulated value to date is marked distinctly on the projection line for each goal (e.g., a dot or annotated point), derived from SIP math over elapsed months.
2. **Given** the accumulated value matches the projected value, **When** viewed on the chart, **Then** the actual marker sits on the projection line, indicating an on-track state.
3. **Given** the accumulated value is below the projected value, **When** viewed on the chart, **Then** the actual marker visually falls below the projection line, making the gap apparent.

---

### User Story 3 - Understand Per-Goal Milestones (Priority: P3)

A user wants to see exactly when each goal's target is fully funded. The chart shows a clear milestone marker at each goal's target date with the required amount, so the user can reason about sequencing — for example, understanding that one goal completes in 2029, freeing up cash for another.

**Why this priority**: Milestone markers add a planning layer on top of the visual trend — useful but not essential for the core projection view.

**Independent Test**: Verify that each goal target date has a visible milestone marker on the chart showing the goal name and target amount.

**Acceptance Scenarios**:

1. **Given** a goal has a target date, **When** the chart is rendered, **Then** a milestone marker appears at that date annotated with the goal name and inflation-adjusted target amount.
2. **Given** two goals share the same target year, **When** the chart is rendered, **Then** both milestone markers are legible and do not obscure each other.

---

### Edge Cases

- What happens when a goal's target date is already past? The goal should be shown as completed/fully-funded, not extrapolated beyond its target date.
- What happens when a goal has 0 months remaining (target date is this month)? The chart must handle a zero-length projection without errors or blank display.
- What happens when there are only recurring goals (no fixed target date)? Recurring goals use their configured duration window; the chart should display them within that window starting from today.
- What happens when a user has many goals (10+)? The legend and lines must remain readable — overlapping or illegible labels are not acceptable.
- What happens when one goal's target amount is vastly larger than another (e.g., ₹5 crore vs. ₹50,000)? The Y-axis must scale to accommodate both without making the smaller goal's line invisible or indistinguishable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a time-series projection chart on the Planner page showing the expected growth trajectory for each active financial goal.
- **FR-002**: Each goal's projection line MUST start from the goal's investment start date and end at the goal's target date, with the endpoint matching the inflation-adjusted target amount.
- **FR-003**: The chart MUST visually distinguish each goal using both a unique color and a unique line style (e.g., solid, dashed, dotted), with a legend mapping each combination to its goal name. This ensures readability for users with color-vision deficiency.
- **FR-004**: The chart MUST mark the current accumulated value for each goal at today's date, visually distinct from the projected line. This value is always derived from the SIP math (monthly amount × elapsed months compounded at expected return), regardless of whether investment log entries exist.
- **FR-005**: The chart MUST display a milestone marker at each goal's target date annotated with the goal name and target amount.
- **FR-006**: The chart's X-axis MUST span from the earliest goal's investment start date to the latest goal target date across all active goals, showing both the elapsed (historical) portion and the remaining future projection.
- **FR-007**: The chart's Y-axis MUST auto-scale to accommodate the full range of all goal target amounts without clipping any line.
- **FR-008**: When no goals exist, the chart area MUST display a clear empty-state message prompting the user to add goals.
- **FR-009**: Goals whose target date has already passed MUST be displayed as completed/fully-funded and excluded from active projection lines.
- **FR-010**: The exported PDF report MUST include a projected year-end values table (one row per active goal, columns for goal name, target date, target amount, and yearly projected values) — not a chart image capture.
- **FR-011**: The chart MUST be responsive and readable on both desktop and mobile screen sizes.

### Key Entities

- **Projection Series**: The full ordered sequence of calculated data points representing the expected accumulated value for a single goal from its start date to its target date.
- **Projection Point**: A single data point within a projection series — a (date, amount) pair derived from the monthly SIP amount and expected return rate for a goal.
- **Actual Value Marker**: The accumulated portfolio value for a goal as of today, derived from elapsed months of investing at the suggested SIP amounts using existing calculation logic.
- **Goal Milestone**: A marked point on the time axis at a goal's target date, annotated with the goal name and required inflation-adjusted amount.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with 3 or more goals can view the full projection chart — with all goals plotted, the legend visible, and milestone markers shown — within 2 seconds of loading the Planner page.
- **SC-002**: 100% of active goals (goals with a future target date) appear as distinct lines on the chart; no goal is silently omitted.
- **SC-003**: The current accumulated value marker for each goal matches the value produced by the existing investment calculator logic to within ±1 unit of the user's selected currency.
- **SC-004**: The chart is fully readable on screen widths from 375px (mobile) to 1920px (desktop) without horizontal scrolling or overlapping text labels.
- **SC-005**: The exported PDF includes a projected year-end values table showing each active goal's name, target date, target amount, and projected accumulated value at each yearly milestone — readable without a chart image.
- **SC-006**: When no goals exist, the empty-state message is displayed instead of a broken or blank chart area.

## Clarifications

### Session 2026-06-07

- Q: What form should the chart take in the exported PDF — a chart image or a structured data table? → A: A projected year-end values table (one row per active goal, yearly milestone columns); no chart image capture.
- Q: Does the X-axis start at today or at the earliest goal's investment start date? → A: At the earliest goal's investment start date, showing the full elapsed + future trajectory.
- Q: Should goals be distinguished by color only, or color + line style? → A: Color + line style (solid/dashed/dotted) for color-blind accessibility.
- Q: Should the actual value marker be shown even when no investment log entries exist? → A: Yes — always show it using SIP math (monthly amount × elapsed months compounded), regardless of log entries.

## Assumptions

- The projection calculation uses the same SIP math already implemented in the planner (annuity-due formula) applied month-by-month to generate the time series — no new financial model is needed.
- "Actual accumulated value" is derived from existing investment log entries and elapsed months using the same calculation logic already present in the codebase.
- Inflation adjustment for target amounts uses the per-goal inflation rate already stored on each goal.
- The chart is displayed on the existing Planner page, integrated alongside the current investment suggestions and progress boxes — not on a new dedicated page.
- Recurring goals are shown over their configured duration window (1–3 years) starting from today, consistent with how the rest of the planner treats them.
- No new data is persisted for this feature — all chart data is derived at render time from existing planner data.

## Out of Scope

- Interactive "what-if" editing directly on the chart (e.g., dragging a line to change SIP amounts) — that is a separate scenario analyzer feature.
- Fetching real market data or live portfolio valuations from external sources.
- Comparing multiple saved plan scenarios side by side.
- Displaying individual investment instrument breakdowns on the chart (only goal-level aggregates are shown).
