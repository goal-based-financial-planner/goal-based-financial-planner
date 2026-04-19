# Feature Specification: Implicit Goal Start Date and Auto Investment Tracking

**Feature Branch**: `008-implicit-start-date`
**Created**: 2026-03-29
**Status**: Draft
**Input**: User description: "Remove the confusing date selection feature from goal planning and replace it with automatic investment tracking using goal creation date as the implicit start date, plus an optional current savings field per goal for accuracy"

## Overview

Today the planner asks users to manually select a "start date" to calculate how much they should be investing monthly. This is confusing — users don't understand why they need to pick a date, and the investment amount changes every time they return because today's date has shifted.

This feature removes that date picker entirely. Instead, the system silently records the date a goal was created and uses that as the investment start date. The monthly investment amount auto-updates daily without any user action. For users who already had savings before creating the goal, or who deviated from the plan, an optional "current savings" field lets them correct the baseline without breaking the experience for everyone else.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Goal Without Choosing a Start Date (Priority: P1)

A user creates a new financial goal. They fill in the goal name, target amount, target date, and investment type — and nothing else. The system silently records today as the goal's investment start date. On the planner view, the user immediately sees a monthly investment recommendation without ever being asked about a date.

**Why this priority**: This is the core UX improvement. Every user who creates a new goal benefits immediately. It eliminates the most confusing step from the current flow.

**Independent Test**: Create a new goal with no start date field present in the form, save it, and verify the planner shows a monthly investment figure. Delivers full value as a standalone change.

**Acceptance Scenarios**:

1. **Given** a user is creating a new goal, **When** they fill in goal details and save, **Then** the goal is saved with a creation date equal to today and no date picker is shown anywhere in the form.
2. **Given** a goal was created on a specific date, **When** the user views the planner, **Then** the monthly investment shown is calculated based on elapsed months since that creation date.
3. **Given** a user creates a goal today with a 10-year horizon, **When** they view the planner tomorrow, **Then** the monthly investment figure is slightly higher, reflecting one fewer day in the horizon.

---

### User Story 2 - Return to Plan After Time Has Passed (Priority: P2)

A user created their financial plan six months ago. They open the app today without changing anything. The planner automatically shows updated monthly investment figures that reflect the shorter time remaining — no prompts, no date picker, no stale numbers.

**Why this priority**: This is the core long-term value of the feature. Without it, the planner gives users outdated recommendations every time they return, eroding trust.

**Independent Test**: Create a goal, simulate the passage of time, reload the planner, and verify the monthly investment amount increased appropriately. Delivers the "always-current" behaviour independently.

**Acceptance Scenarios**:

1. **Given** a goal was created 6 months ago with a 5-year horizon, **When** the user opens the planner today, **Then** the monthly investment shown accounts for 4.5 years remaining, not 5 years.
2. **Given** a user has multiple goals created at different times, **When** they view the planner, **Then** each goal's investment recommendation is independently recalculated based on its own creation date.
3. **Given** no user action is required to trigger recalculation, **When** the planner loads, **Then** all investment figures are current to the day of viewing.

---

### User Story 3 - Override Current Savings for Accuracy (Priority: P3)

A user started saving for a goal six months before they started using this planner. Or they missed a few months of contributions. They want the planner to reflect their actual accumulated savings so the new monthly investment figure is accurate. They enter their actual current savings for that goal. The planner immediately recalculates the required monthly investment against the corrected baseline.

**Why this priority**: Important for accuracy but optional — users who don't use it still get a reasonable default. Lower priority than the baseline experience.

**Independent Test**: Enter a current savings value for a goal and verify the monthly investment amount decreases (or increases) accordingly relative to the default calculated value.

**Acceptance Scenarios**:

1. **Given** a user has already saved an amount toward a goal, **When** they enter that amount in the "current savings" field, **Then** the monthly investment recommendation decreases proportionally to reflect the head start.
2. **Given** a user enters a current savings amount that, combined with expected growth, already meets the target, **When** they view the planner, **Then** the system shows a monthly investment of zero and indicates the goal is on track without additional contributions.
3. **Given** a user clears the current savings field, **When** they save, **Then** the planner reverts to calculating from the creation date baseline as if no override was provided.
4. **Given** a user enters a current savings amount that meets or exceeds the inflation-adjusted target, **When** they save, **Then** the goal displays a "fully funded" status badge with no investment figure, and remains visible in the planner until the user deletes it.

---

### Edge Cases

- What happens when an existing goal (created before this feature shipped) has no recorded creation date? The system silently assigns the feature's deploy date as the creation date for all legacy goals — no user prompt is shown.
- What happens if a goal's target date is in the past? The goal displays an "expired" status badge with no investment figure and remains visible until the user deletes it — consistent with the fully funded treatment.
- What happens if a user enters current savings in a currency or format the system doesn't expect? Input must be validated as a non-negative number.
- What if the creation date is somehow in the future (e.g., a clock was wrong)? The system should treat the investment start as today rather than a future date.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record the date a goal is created without requiring any user input related to dates during goal creation.
- **FR-002**: The date picker / start date selection field MUST be removed from all goal creation and editing forms.
- **FR-003**: The planner view MUST calculate each goal's required monthly investment using the current date and the goal's recorded creation date — recalculating fresh on every page load.
- **FR-004**: Users MUST be able to enter an optional "current savings" amount per goal to override the system-calculated portfolio baseline.
- **FR-005**: When a "current savings" value is provided, the monthly investment MUST be calculated against the remaining amount (target minus current savings, adjusted for expected growth).
- **FR-006**: When no "current savings" value is provided, the system MUST assume the user has been investing the recommended amount since the goal's creation date and calculate accordingly.
- **FR-007**: Existing goals that predate this feature MUST have the feature's deploy date silently assigned as their creation date — no user prompt, no data loss, no broken displays.
- **FR-008**: If a goal's target date has already passed, the planner MUST display the goal with an "expired" status badge and no investment figure. The goal remains visible until the user manually deletes it.
- **FR-009**: If entered current savings already meet or exceed the goal target, the planner MUST display the goal with a "fully funded" status badge and no investment figure. The goal remains visible until the user manually deletes it.

### Key Entities

- **Financial Goal**: Represents a savings target a user wants to reach. Gains a creation date (set automatically at goal creation, immutable) and an optional current savings override (user-editable at any time).
- **Investment Recommendation**: The calculated monthly contribution for a goal. Derived fresh from today's date, the goal's creation date, the target amount, the optional current savings, and the expected return rate. Not stored — always computed on demand.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The date picker is fully absent from the goal creation and editing experience — zero users are asked to select a start date.
- **SC-002**: Opening the planner on any day produces investment figures consistent with the number of months remaining from today to each goal's target date — verified to be accurate within the same calendar day.
- **SC-003**: Users who enter a current savings value see their monthly investment figure recalculate immediately, reflecting the correct remaining amount.
- **SC-004**: All existing goals continue to display correct investment recommendations after the feature ships, with no broken or missing data.
- **SC-005**: A user returning after 12 months sees a monthly investment figure that is higher than what was shown at goal creation, reflecting the shorter remaining horizon — without having taken any action themselves.

## Clarifications

### Session 2026-03-29

- Q: How should legacy goals (no recorded creation date) be migrated? → A: Silently assign the feature's deploy date as creation date — no user prompt.
- Q: Should users be able to defer their investment start date (e.g., "I'll start next month")? → A: Out of scope — goal creation date is always the investment start date; no deferred start mechanism.
- Q: What happens to a fully funded goal in the planner — is it hidden, archived, or kept visible? → A: Remains visible with a "fully funded" status badge; no investment figure shown; user deletes it manually if desired.
- Q: What happens to an expired goal (target date passed) — archived, prompted, or shown inline? → A: Show "expired" status badge inline, no investment figure — user deletes manually. Consistent with fully funded treatment.

## Assumptions

- Users are expected to begin investing on the day they create a goal. The creation date is therefore a valid proxy for the investment start date for the majority of users.
- For users who deviate from the plan, the optional "current savings" field is the correction mechanism. Proactive nudges (e.g., "are you on track?") are out of scope for this feature.
- Legacy goals with no recorded creation date will have the feature's deploy date silently assigned as their effective creation date. This is a one-time silent migration with no user interaction required.
- The "current savings" value is manually entered and manually updated by the user. Automatic syncing with bank accounts or investment portfolios is out of scope.
- Inflation adjustment and expected return rate logic remain unchanged from the current implementation.
- Deferred contribution start ("I'll begin investing next month") is out of scope. Goal creation date is always the investment start date. Users who haven't started yet will see their required monthly investment increase naturally over time.
