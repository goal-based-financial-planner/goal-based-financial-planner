# Feature Specification: Goal Risk Dashboard

**Feature Branch**: `018-goal-risk-dashboard`
**Created**: 2026-08-22
**Status**: Draft
**Input**: User description: "Goal risk dashboard: surface at-risk vs on-track status per goal on the main Planner screen using the current (non-What-If) assumptions. Reuse the existing goal attainment logic from src/domain/whatIf.ts (GoalAttainmentStatus, on-track/at-risk determination) so the same rules that power the What-If tab's live projection also drive a persistent, always-visible status indicator — without requiring the user to open the What-If tab or touch any sliders. This should read as a natural extension of the 016-layout-redesign stat strip / goal chips, showing which goals are on track and which are at risk under the plan's actual current assumptions (inflation rate, investment allocations, SIP amounts) as already stored in PlannerData."

## Clarifications

### Session 2026-08-22

- Q: The existing `PlannerStatStrip` already shows a portfolio-level on-track/shortfall caption today, computed with a simple total-invested-vs-total-required comparison that ignores timing — separate from the corpus-sequencing engine this feature reuses. Should the two signals be reconciled? → A: Yes — replace the stat strip's existing heuristic so it sources from the same per-goal risk computation this feature introduces, so the two signals on the screen always agree.
- Q: In a mixed plan (one-time + recurring goals), the summary counts only one-time goals and stays silent about the excluded recurring goals — or should it explicitly call out the exclusion in the same line? → A: Stay silent — the summary reads "N of M goals at risk" for one-time goals only; a recurring goal's own "not evaluated" chip is the only place its status is shown.
- Q: Should the per-goal risk indicator support any click/navigation interaction (e.g., deep-link into What-If, show a shortfall breakdown)? → A: No — it is a static, non-interactive badge for this feature; drill-down is a possible later enhancement, not in scope now.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See which goals are at risk without leaving the main screen (Priority: P1)

A user who has set up goals, investment allocations, and logged some SIP contributions opens the Planner page (not the What-If tab) and immediately sees, for each goal, whether it is on track to be fully funded by its target date or at risk of falling short — based on the plan exactly as it stands today, with no sliders touched.

**Why this priority**: This is the entire point of the feature — turning a signal that currently only exists inside an exploratory tool (What-If) into an always-visible fact about the real plan. Without this, the feature doesn't exist.

**Independent Test**: Can be fully tested by loading a plan containing at least one underfunded goal and one adequately funded goal, opening the Planner page only, and confirming each goal shows the correct status without visiting the What-If tab.

**Acceptance Scenarios**:

1. **Given** a plan with a one-time goal whose logged SIPs are projected to fully cover its target amount by its target date, **When** the user views the Planner page, **Then** that goal displays an "on-track" status indicator.
2. **Given** a plan with a one-time goal whose shared invested corpus is projected to run short at the goal's target date, **When** the user views the Planner page, **Then** that goal displays an "at-risk" status indicator.
3. **Given** a plan with no goals at all, **When** the user views the Planner page, **Then** no risk status indicators are shown.

---

### User Story 2 - See at a glance how many goals need attention (Priority: P2)

A user with several goals wants a single summary figure — how many goals are at risk right now — without having to scan every individual goal chip and count for themselves.

**Why this priority**: Individual per-goal indicators (P1) already deliver the core value; a summary count is a fast-scan convenience on top of that, valuable but not blocking.

**Independent Test**: Can be tested by loading a plan with a known mix of at-risk and on-track goals and confirming a summary count (e.g., "2 of 5 goals at risk") appears on the main screen and matches the individual indicators.

**Acceptance Scenarios**:

1. **Given** a plan with 5 goals where 2 are at risk, **When** the user views the Planner page, **Then** a summary shows 2 goals at risk out of 5.
2. **Given** a plan where every goal is on track, **When** the user views the Planner page, **Then** the summary reflects zero goals at risk (and does not read as an alarming/negative state).

---

### User Story 3 - Status stays current as the plan changes (Priority: P3)

A user edits a goal's target amount, adjusts an investment allocation, or logs a new SIP contribution, and wants the risk status to reflect that change immediately, without saving, reloading, or switching tabs.

**Why this priority**: Correctness over time matters, but the initial static read (P1) already delivers the core value the first time the page loads; this story hardens that value against staleness.

**Independent Test**: Can be tested by loading a plan with an at-risk goal, increasing its SIP contribution enough to close the shortfall, and confirming the indicator flips to on-track on the same screen without a manual refresh.

**Acceptance Scenarios**:

1. **Given** a goal currently shown as at-risk, **When** the user increases the monthly SIP amount funding it enough to close the projected shortfall, **Then** the goal's status updates to on-track without a page reload.
2. **Given** a goal currently shown as on-track, **When** the user reduces its investment allocation return rate enough to create a shortfall, **Then** the goal's status updates to at-risk without a page reload.

---

### Edge Cases

- What happens when a plan has goals but none has any logged SIP contributions yet? Each such goal is evaluated the same way (its funding requirement vs. its projected $0 corpus) and is shown as at-risk if the target amount is greater than $0.
- What happens when two goals share a target date (or month) and the shared corpus can only cover one of them? Both goals show at-risk, since the underlying corpus is insufficient at that point for the combined withdrawal — matching what the What-If tab already reports for the same situation.
- How does the system handle a goal added moments ago with no time to accumulate contributions before its own target date? It is shown as at-risk, reflecting the real shortfall, not treated as a special/exempt case.
- What happens while plan data is still loading (e.g., right after opening the app)? No status indicator is shown until the plan's goals, allocations, and SIP data have finished loading.
- What happens when a plan contains only recurring goals and no one-time goals? Every goal shows the "not evaluated" treatment, and the portfolio-level summary reflects zero one-time goals evaluated rather than showing a misleading 0-at-risk count.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an on-track/at-risk status indicator for every one-time goal directly on the main Planner screen, visible without navigating to the What-If tab or adjusting any control.
- **FR-002**: The status shown MUST be computed from the plan's currently stored assumptions only — each goal's own inflation rate (or the plan's default), each investment type's own expected return rate, and the SIP contributions actually logged — with no user-adjusted overrides applied.
- **FR-003**: A goal MUST be marked at-risk when the shared invested corpus is projected to be insufficient to cover that goal's full withdrawal at its target date under those current assumptions; otherwise it MUST be marked on-track.
- **FR-004**: The status indicator MUST recompute automatically whenever the underlying plan data changes (goals added/edited/removed, investment allocations changed, or SIP entries logged/edited/removed) — reflected on the same screen without requiring a manual refresh or reload.
- **FR-005**: System MUST display a portfolio-level summary showing how many one-time goals are at risk out of the total number of one-time goals evaluated. Recurring goals are excluded from both the numerator and denominator of this count, consistent with FR-008, and the summary text does not call out that exclusion — a recurring goal's "not evaluated" state is visible only on its own indicator.
- **FR-006**: When a plan contains no goals, the system MUST NOT display any risk status indicator or summary.
- **FR-007**: The visual treatment distinguishing at-risk from on-track MUST be clearly distinguishable at a glance (e.g., distinct color and icon/label), consistent with the status conventions already used elsewhere on the Planner screen's stat strip and goal chips. The indicator is a static display element only — it MUST NOT carry a click/navigation action (e.g., no deep-link into the What-If tab or drill-down breakdown) as part of this feature.
- **FR-008**: Recurring goals MUST NOT display an on-track/at-risk status, since no shortfall projection exists for them today; they MUST instead be shown with a visually distinct "not evaluated" treatment so their absence of a verified status is never mistaken for either an on-track or at-risk determination.
- **FR-009**: The existing portfolio-level on-track/shortfall indicator on the main Planner screen (today a simple total-invested-vs-total-required comparison) MUST be updated to source from the same per-goal risk computation this feature introduces, so it and the new per-goal indicators never disagree about the same plan.

### Key Entities *(include if feature involves data)*

- **Goal Risk Status**: A derived, non-persisted attribute of a one-time goal — either "on-track" or "at-risk" — computed at render time from the goal's target amount/date, its inflation rate, the relevant investment allocations' expected return rates, and logged SIP contributions. Not stored in `PlannerData`; recalculated whenever any of its inputs change. Recurring goals do not get this attribute; they are always shown as "not evaluated" (see FR-008).
- **Portfolio Risk Summary**: A derived count of how many one-time goals are at-risk versus the total number of one-time goals, shown alongside the individual indicators.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can determine whether any of their goals are at risk within 5 seconds of loading the Planner page, without opening any other tab or touching any control.
- **SC-002**: Every one-time goal's displayed status matches the outcome the What-If tab would show for that goal under unmodified (zero-override) assumptions, 100% of the time.
- **SC-003**: After editing a goal, an investment allocation, or a SIP entry, the displayed status for affected goals reflects the change immediately, with no separate save, refresh, or navigation step.
- **SC-004**: A user can state the total number of at-risk goals in their plan by reading a single summary figure, without individually counting status indicators themselves.
