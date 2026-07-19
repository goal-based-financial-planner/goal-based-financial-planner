# Feature Specification: Planner Page Layout Redesign

**Feature Branch**: `016-layout-redesign`
**Created**: 2026-07-11
**Status**: Draft
**Input**: User description: "UI overhaul — the current layout is cramped due to a fixed two-column split where goals are squeezed into a narrow sidebar and the investment charts are constrained on the left."

## Overview

The Planner page currently forces goals, investment charts, and the portfolio chart to share a cramped two-column layout. Everything feels small and dense. This redesign gives each major section its own full-width space using a top-level tab structure, so users can focus on one thing at a time without squinting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View and Manage Goals Comfortably (Priority: P1)

A user opens the planner and navigates to the Goals tab. They see their goals displayed in a spacious grid — two cards per row on desktop — each with the goal name, target amount, monthly SIP, inflation rate, date range, and action controls clearly visible without crowding. They can add a new goal directly from the Goals tab.

**Why this priority**: Goals are the core unit of the app. If goal cards are unreadable, everything else is undermined. This is the first thing a user sees and the most frequently interacted-with part of the planner.

**Independent Test**: Navigate to the Goals tab, verify all goal cards are readable with comfortable spacing, add a new goal, and confirm it appears in the grid.

**Acceptance Scenarios**:

1. **Given** the planner is open, **When** the user is on the Goals tab, **Then** goal cards are displayed in a two-column grid on desktop (single column on mobile) with each card showing all goal details without truncation or visual crowding.
2. **Given** the Goals tab is active, **When** the user clicks "Add Goal", **Then** the goal creation form opens (same as current behaviour).
3. **Given** there are both one-time and recurring goals, **When** viewing the Goals tab, **Then** goals are grouped or filterable by type (one-time / recurring) using the existing tab or filter mechanism.
4. **Given** a user is on mobile, **When** they open the Goals tab, **Then** goal cards stack in a single full-width column.

---

### User Story 2 — See Investment Allocation at Full Width (Priority: P2)

A user navigates to the Investment Plan tab. The allocation plan (what to invest, how much per instrument) and the investment tracker (actual vs suggested SIP comparison and SIP log) are displayed at full page width, with no sidebar competing for space.

**Why this priority**: The allocation plan currently has redundant visuals that fill space awkwardly at 75% width. Full width lets the charts and tables breathe and removes the need for the pie → arrow → donut triple visual.

**Independent Test**: Navigate to the Investment Plan tab, verify the allocation chart and SIP tracker fill the full page width and remain readable.

**Acceptance Scenarios**:

1. **Given** the Investment Plan tab is active, **When** the user views it, **Then** the allocation plan and investment tracker occupy the full content width.
2. **Given** the allocation plan is shown, **When** there is only one investment type per term, **Then** only one chart is shown (not a duplicate pie + donut).
3. **Given** the investment tracker is shown, **When** the user adds or edits a SIP, **Then** the existing SIP management behaviour is preserved.

---

### User Story 3 — View Portfolio Growth Chart Without Distraction (Priority: P3)

A user navigates to the Portfolio tab and sees the portfolio growth chart — actual vs "if on plan" — occupying the full content width, with the goal event markers and legend clearly visible.

**Why this priority**: The chart is already well-designed; it just needs space. Full width makes the goal markers and long date ranges much more readable.

**Independent Test**: Navigate to the Portfolio tab, verify the chart fills the full content width and all labels are legible.

**Acceptance Scenarios**:

1. **Given** the Portfolio tab is active, **When** the user views it, **Then** the portfolio growth chart occupies the full content width.
2. **Given** the chart is shown, **When** there are many goal markers, **Then** labels remain readable (existing stagger logic is preserved).
3. **Given** the user toggles between "Keep investing" and "Stop per goal" modes, **Then** the toggle and chart update as before.

---

### User Story 4 — Understand Financial Health at a Glance (Priority: P4)

A user opens the planner and immediately sees a horizontal stat strip at the top showing: total inflation-adjusted goal target, total monthly SIP required, and total monthly SIP currently invested. This replaces the current unequal two-box summary row.

**Why this priority**: The top summary is the first thing users scan. Three stat tiles on one horizontal strip is cleaner and more informative than the current two unequal boxes with goal name chips.

**Independent Test**: Open the planner and verify the three stat values are visible across the top without opening any tab.

**Acceptance Scenarios**:

1. **Given** the planner is open, **When** the user views the top of the page, **Then** three stat tiles are displayed: Total Goal Target, Monthly Required, and Monthly Investing.
2. **Given** the user has no SIPs logged, **When** viewing the stat strip, **Then** Monthly Investing shows ₹0 (or a placeholder).
3. **Given** the user's actual SIP meets or exceeds the required amount, **When** viewing the stat strip, **Then** the "Monthly Investing" stat shows a positive indicator (e.g. green colouring or "On track" label).

---

### Edge Cases

- What happens when there are no goals? Goals tab shows an empty state with a prominent "Add your first goal" call-to-action.
- What happens when goals exist but no SIPs are logged? The stat strip shows ₹0 for Monthly Investing; the Portfolio and Investment Plan tabs show their existing empty states.
- What happens when all goals are completed/expired? The existing congratulations screen is preserved.
- What happens on a narrow tablet (768px)? Goal cards switch to single-column; tabs remain horizontally scrollable or wrap.
- What happens if the user is mid-tour (page tour)? Tour step targets are updated to reference the new layout; the tour remains functional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The planner page MUST display a top-level tab bar with three tabs: "Goals", "Investment Plan", and "Portfolio".
- **FR-002**: The "Goals" tab MUST display all goal cards in a responsive grid (two columns on desktop, one column on mobile/tablet).
- **FR-003**: Each goal card in the grid MUST show all current goal details — name, inflation-adjusted target, original target, inflation rate, date range, monthly SIP, progress indicator, edit and delete actions — with comfortable padding and no truncation.
- **FR-004**: The "Goals" tab MUST include an "Add Goal" button that opens the goal creation form.
- **FR-005**: The "Goals" tab MUST preserve the existing one-time / recurring goal grouping or filtering.
- **FR-006**: The "Investment Plan" tab MUST display the allocation plan and investment tracker at full content width.
- **FR-007**: The "Portfolio" tab MUST display the portfolio growth chart at full content width, preserving all existing chart features (mode toggle, goal markers, legend).
- **FR-008**: A horizontal stat strip MUST be displayed above the tab bar, always visible regardless of active tab, showing: Total Goal Target, Monthly Required (across all goals), and Monthly Investing (sum of actual SIPs).
- **FR-009**: The narrow right sidebar showing goals MUST be removed from the layout.
- **FR-010**: The "Goals by Timeline" chip section in the current top summary row MUST be removed.
- **FR-011**: All existing goal management functionality (edit inline, delete, SIP toggle, inflation rate edit, current savings edit) MUST continue to work unchanged.
- **FR-012**: The layout MUST be responsive: on mobile and small screens the tab bar and goal grid adapt to single-column, and the stat strip values remain visible.
- **FR-013**: The date picker in the header (for viewing the plan at a past/future date) MUST be preserved.
- **FR-014**: The PDF export functionality MUST continue to work; the printable report layout is unaffected by this change.

### Key Entities

- **Stat Strip**: A persistent horizontal bar above the tabs showing three summary values (Total Target, Monthly Required, Monthly Investing) derived from existing computed data.
- **Top-level Tabs**: Three tabs — Goals, Investment Plan, Portfolio — each rendering its section at full page width.
- **Goal Grid**: The Goals tab layout; replaces the narrow sidebar goal list with a two-column responsive grid of expanded goal cards.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every piece of information currently shown on a goal card is visible in the new grid card without horizontal scrolling or text truncation on a 1280px-wide desktop viewport.
- **SC-002**: The Investment Plan and Portfolio tabs use at least 95% of the available content width (no sidebar consuming space).
- **SC-003**: All existing user interactions — add goal, edit goal, delete goal, add/edit SIP, toggle SIP mode, export PDF, page tour — continue to function correctly after the redesign.
- **SC-004**: The page renders correctly and is usable at 375px (mobile), 768px (tablet), and 1280px (desktop) widths.
- **SC-005**: The stat strip values are always visible without scrolling on all supported viewport widths.
