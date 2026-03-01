# Feature Specification: Investment Tracking

**Feature Branch**: `005-investment-tracking`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "I want to enhance this tool to add the ability to track investments. The tool currently provides a way to know what the suggestions are but not a way to track them. Go through the code and prepare a specification to achieve the same."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log Actual Investment (Priority: P1)

A user has received investment suggestions for their financial goal (e.g., invest ₹5,000/month in Large Cap Equity Mutual Funds). They have actually started this SIP and want to record that they made this investment so they can see how their actual contributions compare to the suggestion.

The user expands the GoalCard for their goal, navigates to the "Track" section within the card, selects an investment type from the suggestions, enters the amount they actually invested for a given month, and saves the entry.

**Why this priority**: This is the foundational capability. Without the ability to log investments, none of the tracking or comparison features can work. Delivering this alone gives users immediate value — they can begin building an investment history.

**Independent Test**: Can be fully tested by adding an investment entry for one suggested investment type on one goal, verifying it persists after a page refresh, and confirming it appears in the goal's investment history.

**Acceptance Scenarios**:

1. **Given** a user has at least one financial goal with investment suggestions, **When** they open the investment tracking interface for that goal and submit an investment entry with a valid amount and month, **Then** the entry is saved and visible in the goal's investment log.
2. **Given** a user attempts to log an investment, **When** they enter a zero or negative amount, **Then** the form prevents submission and shows a clear validation message.
3. **Given** a user saves an investment entry, **When** they refresh the browser or return later, **Then** the logged entry is still present and unchanged.
4. **Given** a user has multiple investment types suggested for a goal, **When** they log investments, **Then** they can log entries for each investment type independently in the same month.

---

### User Story 2 - Compare Actual vs Suggested Investments (Priority: P2)

A user wants to see at a glance how their actual monthly investments are stacking up against what the planner suggested. They want to know if they are on track — investing the right amounts across the recommended instruments.

For each goal, the user can view a side-by-side or clearly labelled breakdown showing the suggested monthly amount and the actual amount logged for the current or any past month for each investment type.

**Why this priority**: Knowing whether you are on track relative to the suggestion is the core analytical value of tracking. Without this comparison, the logged data provides no actionable insight.

**Independent Test**: Can be fully tested by logging at least one investment entry and verifying that the UI shows the logged amount alongside the suggested amount for that investment type, with a visible indication of whether the user is under, on, or over the suggestion.

**Acceptance Scenarios**:

1. **Given** a goal has investment suggestions and the user has logged investments for one or more types, **When** they view the investment tracking summary, **Then** each investment type shows both the suggested monthly amount and the actual amount logged for the selected month.
2. **Given** a user has not yet logged any investments for a month, **When** they view the comparison view, **Then** the suggested amounts are shown and the actual column clearly indicates no entry has been made (e.g., "Not recorded" or "₹0").
3. **Given** the user has logged an amount different from the suggestion, **When** viewing the comparison, **Then** the difference (shortfall or surplus) is visible.

---

### User Story 3 - View Investment History (Priority: P3)

A user wants to review their investment history over time — to see which months they invested, how much they logged per investment type, and whether their consistency has improved. This gives them a record they can refer back to during periodic financial reviews.

The user can access an investment log view for a goal showing all past entries organised by month, with the investment type, amount logged, and date.

**Why this priority**: Historical data gives context and enables self-assessment over time, but is not required to start tracking. Users get value from logging and comparing first; history enriches the experience.

**Independent Test**: Can be fully tested by logging investments across two or more different months, then viewing the history view and confirming all entries are displayed in reverse-chronological order with the correct details.

**Acceptance Scenarios**:

1. **Given** a user has logged investments across multiple months for a goal, **When** they open the investment history view, **Then** all entries are listed, grouped or ordered by month, with the investment type and amount visible for each entry.
2. **Given** a user wants to correct a logged entry, **When** they select an existing log entry and update the amount, **Then** the history reflects the updated value immediately.
3. **Given** a user logged an investment entry by mistake, **When** they delete the entry, **Then** it is removed from the history and the comparison view updates accordingly.
4. **Given** a user has no logged investments for a goal, **When** they open the history view, **Then** an empty state message is shown encouraging them to start logging.

---

### User Story 4 - See Cumulative Investment Progress per Goal (Priority: P4)

A user wants to understand how much they have actually invested in total towards each goal since they started, and see this alongside the cumulative amount that was projected to be invested by now. This gives them a high-level health check: "Am I actually putting money in at the expected rate?"

**Why this priority**: This aggregated view provides motivation and accountability without requiring the user to do manual calculations. It complements the per-month comparison with a long-term perspective.

**Independent Test**: Can be fully tested by logging investments across several months, then verifying the cumulative actual total displayed on the goal card matches the sum of all logged entries for that goal.

**Acceptance Scenarios**:

1. **Given** a user has logged investments for a goal across multiple months, **When** they view the goal summary, **Then** the total actual amount invested is displayed alongside the cumulative suggested amount (what should have been invested by now).
2. **Given** a user has just added their first goal with no investments logged, **When** they view the goal summary, **Then** the actual invested total shows zero with the cumulative suggestion shown for context.
3. **Given** a user adds a new investment log entry, **When** they return to the goal summary, **Then** the cumulative actual total updates to reflect the new entry.

---

### Edge Cases

- What happens when a user logs an investment for a month that is before the goal's start date?
- How does the system handle duplicate entries for the same investment type in the same month (is the second entry treated as a new record or does it overwrite)?
- What happens if a user deletes a goal that has investment log entries — are the logs also removed?
- What if a user customises the investment allocation (changing the suggested percentages) after they have already logged investments — how are past logs presented?
- What happens when a logged investment type no longer appears in the current suggestions (e.g., allocation was changed to remove it)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to log an actual investment amount for any investment type that is currently suggested for a goal, specifying the month and year of the investment.
- **FR-002**: System MUST validate that logged investment amounts are positive numeric values before saving.
- **FR-003**: System MUST persist all investment log entries in browser storage so they survive page refreshes and browser restarts without requiring a backend.
- **FR-004**: System MUST display, for each investment type per goal, the suggested monthly amount alongside the user's actual logged amount for a selected month.
- **FR-005**: System MUST allow users to view all past investment log entries for a goal, presented in a time-ordered manner.
- **FR-006**: System MUST allow users to edit an existing investment log entry to correct the amount.
- **FR-007**: System MUST allow users to delete an individual investment log entry.
- **FR-008**: System MUST display a cumulative total of all actual investments logged for a goal alongside the cumulative suggested total. The cumulative suggested total is calculated using the current allocation amounts applied retroactively across all elapsed months since the goal started — no historical snapshot of past allocations is maintained.
- **FR-009**: System MUST prevent logging an investment entry for a month earlier than the goal's start date or later than the current month. Investment log entries may only represent months that have already occurred or the current month.
- **FR-010**: System MUST handle the deletion of a financial goal by also removing all associated investment log entries.
- **FR-011**: System MUST allow the user to log investments for multiple investment types in the same month without conflict.
- **FR-012**: The investment tracking interface MUST be presented as a "Track" section within the existing GoalCard, so users access it in the same place they already see goal details and investment suggestions — no new navigation pattern required.

### Key Entities

- **InvestmentLogEntry**: A single recorded actual investment. Key attributes: goal identifier, investment type name, amount (positive numeric), month, and year. Represents one instance of a user acting on a suggestion.
- **GoalInvestmentLog**: The full collection of investment log entries associated with one financial goal. Used to calculate cumulative totals and populate history views.
- **MonthlyInvestmentSummary**: A derived view grouping all log entries for a goal in a given month, enabling the actual-vs-suggested comparison for that period.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can log an actual investment entry for a suggested investment type in under 30 seconds from the point of opening the tracking interface.
- **SC-002**: All investment log entries are fully preserved across browser sessions, with zero data loss under normal usage conditions (no clearing of browser storage).
- **SC-003**: The actual-vs-suggested comparison view is accessible within two interactions (taps or clicks) from the goal summary.
- **SC-004**: Users with logged investments across three or more months can retrieve a complete history view showing all entries without any visible loading delay under normal device conditions.
- **SC-005**: The cumulative actual investment total displayed for a goal always reflects 100% of logged entries, with no discrepancy between the history view totals and the summary total.
- **SC-006**: Editing or deleting a log entry is reflected in all views (history, comparison, cumulative summary) without requiring a manual page refresh.

## Clarifications

### Session 2026-02-28

- Q: Where does the investment tracking UI appear within the existing app? → A: Extend the existing GoalCard — add a "Track" section/tab within the card itself.
- Q: Can users log investment entries for future months? → A: No — entries are restricted to the current month and past months only.
- Q: How is the cumulative suggested total calculated when the user has changed their investment allocations? → A: Always use the current allocation amounts applied retroactively across all elapsed months (no snapshot history of past allocations).

## Assumptions

- The application remains a purely client-side tool with no backend services. All investment log data is stored in browser localStorage alongside existing planner data.
- Users are assumed to be self-reporting their actual investments manually; there is no integration with banks, brokers, or mutual fund platforms in this feature.
- A single investment log entry per investment type per month per goal is the standard pattern. If a user logs the same type again for the same month, it is stored as an additional entry (not an overwrite), and the comparison view shows the sum of all entries for that type and month.
- The investment type names used in logs are matched by name string to the current suggestion set. If an investment type is later removed from suggestions, historical log entries referencing it are still preserved and displayed.
- Inflation adjustment and SIP calculations remain unchanged; this feature adds tracking on top of existing projections without altering the underlying calculation engine.
- The cumulative suggested total always reflects the user's current allocation settings applied retroactively. No history of past allocation states is stored; if allocations change, historical comparison figures update accordingly.
- The feature targets the same user persona as the existing planner: individual retail investors in India managing their own personal financial goals.
