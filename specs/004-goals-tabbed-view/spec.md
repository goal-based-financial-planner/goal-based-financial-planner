# Feature Specification: Tabbed Financial Goals View

**Feature Branch**: `004-goals-tabbed-view`
**Created**: 2026-02-22
**Status**: Draft
**Input**: User description: "At the moment, the Financial goals are split into two sections, long term and recurring goals. We need a better way to show this. They are becoming too long. The recurring goals also show yearly target as monthly target by mistake. Can the section be tabbed to show one time and recurring goals?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Between Goal Types via Tabs (Priority: P1)

A user with many financial goals visits the Planner page. Instead of scrolling through a long page that mixes one-time and recurring goals in sequential sections, they see a tabbed interface with "One Time" and "Recurring" as tabs. Clicking a tab shows only the goals of that type, keeping the view focused and manageable.

**Why this priority**: This is the core request — replacing the two-section scroll layout with a tabbed layout. It directly reduces visual clutter and is the primary UX improvement.

**Independent Test**: Can be fully tested by loading the Planner with at least one one-time goal and one recurring goal, verifying that two tabs appear and each tab shows only its respective goals.

**Acceptance Scenarios**:

1. **Given** a user has both one-time and recurring goals, **When** they open the Planner page, **Then** they see a tab control with "One Time (N)" and "Recurring (N)" tabs above the goals area, where N is the count of goals in each category.
2. **Given** the goals view is open, **When** the user clicks the "One Time" tab, **Then** only one-time (non-recurring) goals are displayed.
3. **Given** the goals view is open, **When** the user clicks the "Recurring" tab, **Then** only recurring goals are displayed.
4. **Given** the user is on the "Recurring" tab, **When** they switch to "One Time", **Then** the recurring goals are hidden and one-time goals appear without a full page reload.

---

### User Story 2 - Correct Target Amount Label for Recurring Goals (Priority: P2)

A user reviews their recurring goals and sees a column labelled "Monthly Target". The value shown is actually the yearly target, which is misleading. After this fix, the column label is corrected to "Yearly Target" so it accurately reflects the stored value, removing the confusion without any recalculation.

**Why this priority**: This is a data accuracy bug that misleads users about their financial obligations. It must be fixed as part of this work since it affects trust in the planner.

**Independent Test**: Can be fully tested by viewing a recurring goal with a known yearly target and confirming the column header reads "Yearly Target" and the displayed value matches the stored yearly amount exactly.

**Acceptance Scenarios**:

1. **Given** a recurring goal has a yearly target of ₹120,000, **When** the recurring goals tab is viewed, **Then** the displayed amount under "Yearly Target" is ₹120,000.
2. **Given** a recurring goal is displayed, **When** the user reads the column header, **Then** the label reads "Yearly Target" and the value shown is the full yearly amount — not a monthly calculation.

---

### User Story 3 - Default Tab and Empty State Handling (Priority: P3)

A user who has only one-time goals (or only recurring goals) opens the Planner. The tabbed view defaults to the "One Time" tab. If the active tab has no goals, a clear empty state message is shown instead of a blank area.

**Why this priority**: Ensures the tabbed layout is robust for all user configurations and prevents confusion from blank or broken-looking views.

**Independent Test**: Can be tested by loading the planner with only one goal type and verifying the default tab and empty state render correctly.

**Acceptance Scenarios**:

1. **Given** a user opens the Planner for the first time with goals, **When** the goals section loads, **Then** the "One Time" tab is selected by default.
2. **Given** the user has no recurring goals, **When** they click the "Recurring" tab, **Then** they see a friendly message indicating no recurring goals exist (not a blank section).
3. **Given** the user has no one-time goals, **When** the page loads, **Then** the "One Time" tab is still the default but shows an appropriate empty state message.

---

### Edge Cases

- What happens when a user has no goals at all? The tabbed control should still render, with both tabs showing empty state messages.
- What happens if new goals are added while the user is on a tab? The tab content should reflect the latest state without requiring a page refresh.
- What happens if a goal's type changes? It should disappear from the current tab and appear in the correct one immediately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The goals section MUST replace the current stacked two-section layout with a tabbed interface containing exactly two tabs: "One Time (N)" and "Recurring (N)", where N is the count of goals in that category, updated reactively as goals are added or removed.
- **FR-002**: The "One Time" tab MUST display all goals of type ONE_TIME in two explicit sub-sections: active/pending goals first, followed by a "Completed Goals" sub-section below, preserving the existing card layout.
- **FR-003**: The "Recurring" tab MUST display all goals of type RECURRING using the existing table layout.
- **FR-004**: The tabbed view MUST default to the "One Time" tab on initial load.
- **FR-005**: The recurring goals table MUST rename the column label from "Monthly Target" to "Yearly Target" and display the stored yearly target amount without any recalculation.
- **FR-006**: When a tab contains no goals, the system MUST display a non-blank empty state message appropriate to that tab (e.g., "No recurring goals added yet").
- **FR-007**: Tab switching MUST be instantaneous with no full-page reload or data re-fetch.

### Key Entities

- **GoalType**: Classification with two values — ONE_TIME and RECURRING — used to determine which tab a goal belongs to.
- **FinancialGoal**: Core goal entity with name, type, target amount, and date range; the target amount for recurring goals is a yearly figure and is displayed as-is under the "Yearly Target" label.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between goal types in under 1 second with no perceptible delay.
- **SC-002**: The recurring goals table column is labelled "Yearly Target" and the displayed value matches the stored yearly target exactly — zero mismatch between label and value.
- **SC-003**: Users with 5 or more total goals can view either goal type without scrolling past irrelevant goals of the other type.
- **SC-004**: Both tab empty states are visually distinct from a loading state — users always know whether no goals exist or whether data is still loading.

## Clarifications

### Session 2026-02-22

- Q: Should tab labels include a goal count indicator? → A: Yes — show count in the tab label, e.g., "One Time (3)", "Recurring (2)". Count updates reactively as goals change.
- Q: How should the recurring goals amount mismatch be fixed — recalculate to monthly or relabel to yearly? → A: Relabel the column to "Yearly Target" and display the stored yearly amount as-is. No recalculation needed.
- Q: Within the "One Time" tab, should completed goals remain visible as a sub-section? → A: Yes — keep as a sub-section within the tab: active goals first, completed goals below with a "Completed Goals" heading.

## Assumptions

- The "One Time" tab displays two explicit sub-sections: active/pending goals first, then a "Completed Goals" sub-section below — matching the existing layout, now contained within the tab.
- Tab selection state is ephemeral (resets on page reload); no URL routing change is required.
- The fix for the recurring goals amount display is a label change only: the column header is renamed from "Monthly Target" to "Yearly Target". The stored yearly value is displayed without any recalculation.
- No changes are needed to the goal creation or editing flows as part of this feature.
- The tabbed layout applies only to the goals section of the Planner page, not to any other part of the app.
