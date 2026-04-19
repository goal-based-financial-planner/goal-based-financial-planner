# Feature Specification: Show Total Monthly Investment Summary

**Feature Branch**: `011-total-monthly-investment`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "I just realized we are not showing monthly required investment as a single number anywhere. We are only showing the breakdown. Lets add that"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Total Monthly Investment at a Glance (Priority: P1)

A user with multiple financial goals across different time horizons opens the planner and wants to immediately understand the single total amount they need to invest every month across all goals. Currently, they have to mentally add up the per-term breakdowns to arrive at this number. The planner should surface this total prominently so users can instantly assess whether the combined commitment fits their budget.

**Why this priority**: This is the core missing piece — without a single total number, users cannot easily answer the fundamental question "how much do I need to invest each month?" It is the highest-value addition relative to implementation effort.

**Independent Test**: Can be fully tested by opening the planner with at least one financial goal added and verifying that a clearly labeled total monthly investment figure appears that equals the sum of all individual goal investment amounts.

**Acceptance Scenarios**:

1. **Given** the planner has two or more goals with investment breakdowns, **When** the user views the planner page, **Then** a clearly labeled "Total Monthly Investment" figure is displayed that equals the sum of all per-goal monthly investment amounts.
2. **Given** the planner has exactly one goal, **When** the user views the planner, **Then** the total monthly investment figure still appears and matches the single goal's monthly investment requirement.
3. **Given** a user changes the selected month/year via the date picker, **When** the date changes, **Then** the total monthly investment figure updates to reflect the recalculated amounts for that point in time.

---

### User Story 2 - Total Updates When Goals Are Added or Removed (Priority: P2)

A user adds a new goal or deletes an existing one, and the total monthly investment figure immediately reflects the updated commitment without requiring a page refresh.

**Why this priority**: The total must stay accurate as the plan evolves. A stale number undermines user trust in the planner.

**Independent Test**: Can be fully tested by adding a goal, noting the total, then adding a second goal and verifying the total increases by the second goal's monthly requirement.

**Acceptance Scenarios**:

1. **Given** the planner shows a total monthly investment for two goals, **When** the user adds a third goal, **Then** the total monthly investment immediately increases by the new goal's monthly investment amount.
2. **Given** the planner shows a total monthly investment for two goals, **When** the user removes one goal, **Then** the total monthly investment decreases accordingly and remains accurate.

---

### Edge Cases

- What happens when the user has no goals? The total monthly investment area should show zero or be hidden with an appropriate prompt to add goals.
- What happens when a goal has a target date that has already passed (completed goal)? Completed goals contribute zero to the monthly investment, so the total should exclude them.
- What if the total monthly investment is zero due to all goals being fully funded? Display zero clearly (not hide the element) so the user understands the current state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The planner page MUST display a single "Total Monthly Investment" figure that is the sum of monthly investment amounts required across all active (non-completed) goals.
- **FR-002**: The total monthly investment figure MUST be displayed in the user's locale-appropriate currency format, consistent with how other monetary values appear in the planner.
- **FR-003**: The total monthly investment figure MUST update reactively whenever goals are added, removed, or modified, or when the selected date changes.
- **FR-004**: The total monthly investment figure MUST be displayed inside the `TargetBox` summary panel (alongside the existing inflation-adjusted corpus target amount), clearly labeled, and visually distinguishable from the per-term breakdown figures.
- **FR-005**: When no goals exist, the planner MUST display a zero total or an empty/placeholder state rather than showing nothing, so users understand what the figure represents.
- **FR-006**: Completed goals (target date in the past relative to the selected date) MUST NOT contribute to the total monthly investment figure.

### Key Entities

- **Total Monthly Investment**: The scalar sum of all active goal monthly investment requirements at the selected point in time. Derived from existing per-goal calculations — no new stored data required.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with multiple goals can identify their total required monthly investment within 3 seconds of opening the planner, without any arithmetic.
- **SC-002**: The displayed total equals the arithmetic sum of all per-term, per-goal monthly investment figures shown in the breakdown — verifiable to within rounding tolerance (±1 currency unit per goal).
- **SC-003**: The total figure updates immediately (within one render cycle) when the user adds, removes, or modifies a goal, or changes the selected date.
- **SC-004**: The total is displayed in the same currency format and locale as all other monetary values on the planner page.

## Clarifications

### Session 2026-04-19

- Q: Where should the total monthly investment figure appear? → A: Inside `TargetBox` — added beneath or alongside the existing corpus target amount.

## Assumptions

- The existing per-goal investment calculation logic already produces the correct per-goal monthly amounts; this feature only aggregates and surfaces them.
- "Active goals" means goals whose target date is on or after the currently selected date.
- No new data persistence is needed — the total is computed on the fly from existing plan data.
- The total appears inside the existing `TargetBox` component, added beneath or alongside the existing inflation-adjusted corpus target amount. This keeps all top-level financial summary figures in one place.
