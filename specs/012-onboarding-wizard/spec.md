# Feature Specification: Onboarding Wizard

**Feature Branch**: `012-onboarding-wizard`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "Lets start by working on an onboarding wizard. The tool currently has a joyride plugin which shows some kind of guide but it is better to have a full blown onboarding first and then show the joyride based tour"

## Overview

First-time users arrive at the app with no context about what it does or how to use it. The current experience drops them onto a landing page with a "New Plan" button and then immediately into the Joyride tooltip tour on the Planner screen — which assumes the user already understands the concepts (goals, terms, investment allocations). This feature adds a structured onboarding wizard that fires immediately on first page load (overlaying the landing page), teaches core concepts, presents the user with a choice to create a new plan or open an existing one, and then hands off to the Joyride UI tour on the Planner screen.

## Clarifications

### Session 2026-04-25

- Q: When does the wizard trigger and where does the entry point live? → A: The wizard fires on first page load, overlaying the landing page before any user interaction. Within the wizard itself, users are offered both a "Create new plan" and an "Open existing plan" path so neither option is hidden from first-time users.
- Q: Does the wizard's goal creation step replace AddGoalPopup for first-time users, or do both fire? → A: The wizard goal step fully replaces AddGoalPopup for first-time users. The goal is saved as part of wizard completion; AddGoalPopup does not fire.
- Q: Is onboarding state per-device or shared across devices/plans? → A: Per-device only (localStorage), consistent with the existing `tourTaken` flag. Re-appearing on a new device is acceptable.
- Q: What keyboard/accessibility behavior is required for the wizard modal? → A: Full accessible modal: focus is trapped inside the wizard while open, all controls are Tab-navigable, and pressing Escape triggers Skip.
- Q: Where does storage provider selection happen for the "Create new plan" path? → A: Storage picker is a step inside the wizard (before goal creation), keeping the entire first-time setup in one unified flow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First-time user completes onboarding and reaches the Planner (Priority: P1)

A brand-new user visits the app for the first time. The onboarding wizard appears immediately on page load, overlaying the landing page. The wizard walks them through 3–5 screens: what the app is, the concept of financial goals and investment terms, how allocations work, and a path choice (create new plan or open existing). For new-plan users, the wizard ends with creating the first goal. On completion, the wizard dismisses and the user lands on the Planner screen. The Joyride tour then fires as it normally would, pointing out the specific UI elements.

**Why this priority**: This is the core problem being solved. Without it, the feature doesn't exist.

**Independent Test**: Can be fully tested by visiting the app for the first time (or clearing onboarding state) — the wizard should appear, allow step-by-step progression, collect the first goal, and exit to the Planner with the Joyride tour firing.

**Acceptance Scenarios**:

1. **Given** a user visits the app for the first time (no onboarding state stored), **When** the page loads, **Then** the onboarding wizard is displayed before any other interactive content.
2. **Given** the wizard is open on step 1, **When** the user clicks "Next", **Then** they advance to step 2 and a progress indicator updates.
3. **Given** the wizard is on the final step (create first goal), **When** the user submits a valid goal, **Then** the wizard closes, the user is placed in the Planner, and the Joyride tour begins.
4. **Given** the user has previously completed the wizard, **When** they return to the app, **Then** the wizard does NOT appear.

---

### User Story 2 — User skips the wizard (Priority: P2)

A user who already understands the app (e.g., returning from a different device, or simply impatient) can skip the wizard at any step. Skipping should record the onboarding as completed so it never appears again, then continue into the normal new-plan flow without loss of context.

**Why this priority**: Forcing onboarding on savvy or returning users is a frustrating anti-pattern. Skip must be available throughout.

**Independent Test**: Open the wizard, click "Skip", verify the wizard closes, the user enters the standard new-plan flow, and the wizard never reappears on future visits.

**Acceptance Scenarios**:

1. **Given** the wizard is open on any step, **When** the user clicks "Skip", **Then** the wizard closes and onboarding is marked complete.
2. **Given** onboarding is marked complete (via skip), **When** the user returns to the app, **Then** the wizard does not appear.
3. **Given** the user skips the wizard, **When** they reach the Planner, **Then** the Joyride tour still fires (it is independent of the wizard).

---

### User Story 3 — User navigates backward through the wizard (Priority: P3)

A user who has advanced past a step can go back to review or correct information before proceeding. Navigation should be non-destructive — going back does not lose data entered on later steps.

**Why this priority**: Back-navigation is expected UX in any multi-step wizard and prevents re-entry frustration.

**Independent Test**: Advance to step 3, click "Back", confirm step 2 is shown with previously entered data intact.

**Acceptance Scenarios**:

1. **Given** the user is on step 3, **When** they click "Back", **Then** step 2 is displayed.
2. **Given** the user entered data on step 2 and navigated forward then back, **When** step 2 is re-shown, **Then** previously entered data is retained.
3. **Given** the user is on step 1, **Then** no "Back" button is visible.

---

### User Story 4 — Returning user who has completed onboarding starts a new plan (Priority: P4)

A user who already completed onboarding previously creates a new plan (e.g., via "New Plan" on the landing page). The wizard should not appear. They go directly to the storage picker and AddGoalPopup as before.

**Why this priority**: Onboarding is a one-time experience; it must not interfere with the normal new-plan flow for established users.

**Independent Test**: Set onboarding state to completed, click "New Plan" — confirm wizard never appears, flow proceeds as it does today.

**Acceptance Scenarios**:

1. **Given** onboarding is marked complete, **When** the user clicks "New Plan", **Then** the wizard does not appear and the existing storage picker flow runs normally.

---

### Edge Cases

- What happens if the user closes the browser mid-wizard (before completing or skipping)? → Onboarding is NOT marked complete; the wizard resumes from the beginning on next visit.
- What happens on very small screens (mobile)? → The wizard must be fully functional and readable on screens as narrow as 320px without horizontal scrolling.
- What happens if the user tries to create a goal with invalid data on the wizard's final step? → Inline validation errors are shown; the wizard does not advance until the goal is valid.
- What happens if the Joyride tour was already taken before this onboarding feature is introduced? → Existing `tourTaken` flag is respected; Joyride will not re-fire for users who already completed it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the onboarding wizard immediately on page load to users who have not previously completed or skipped it, before the landing page becomes interactive.
- **FR-002**: The wizard MUST consist of at least 3 and no more than 5 distinct steps.
- **FR-003**: Step content MUST cover: (a) what the app does, (b) how financial goals and terms (short/medium/long) work, (c) how investment allocations are suggested, and (d) a path choice: "Create new plan" or "Open existing plan".
- **FR-003a**: For users who choose "Create new plan", the wizard MUST include a storage provider selection step followed by a goal creation step. The goal MUST be persisted as part of wizard completion — the existing AddGoalPopup MUST NOT fire for these users.
- **FR-003b**: For users who choose "Open existing plan", the wizard MUST hand off to the standard storage picker / file-open flow after marking onboarding complete.
- **FR-004**: The wizard MUST show a step progress indicator (e.g., "Step 2 of 4") at all times.
- **FR-005**: Each step except step 1 MUST provide a "Back" button to return to the previous step.
- **FR-006**: Every step MUST provide a "Skip" option that closes the wizard and marks onboarding complete.
- **FR-007**: The wizard MUST mark onboarding as complete in persistent storage upon successful finish or skip, so it never appears again for that user/device.
- **FR-008**: After wizard completion (not skip), the user MUST be navigated to the Planner screen where the Joyride tour fires if it has not already been taken.
- **FR-009**: After wizard skip, the user MUST continue into the standard new-plan flow (storage picker → Planner) without re-triggering the wizard.
- **FR-010**: The wizard MUST be fully usable on mobile screen sizes (minimum 320px width).
- **FR-011**: The wizard MUST NOT appear for users who have previously completed or skipped onboarding, regardless of which page they navigate to.
- **FR-012**: The goal creation step in the wizard MUST use the same validation rules as the existing goal creation flow.
- **FR-013**: If the user closes the browser mid-wizard without completing or skipping, onboarding state MUST remain incomplete so the wizard shows again on next visit.
- **FR-014**: The wizard MUST trap keyboard focus while open — Tab cycles through all interactive controls within the wizard and does not reach content behind it.
- **FR-015**: Pressing Escape at any wizard step MUST trigger the Skip action (close wizard, mark onboarding complete).

### Key Entities

- **OnboardingState**: Tracks whether the current user/device has completed or skipped onboarding. Stored persistently (same mechanism as existing `tourTaken` flag). Attributes: `completed: boolean`.
- **WizardStep**: A single screen within the wizard. Attributes: step number, title, body content, optional interactive element (e.g., goal creation form on the final step).
- **FinancialGoal** (existing): Created on the wizard's final step; same shape as goals created via the existing goal creation flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can complete the full wizard and reach the Planner in under 3 minutes.
- **SC-002**: A first-time user who skips the wizard reaches the Planner in under 30 seconds.
- **SC-003**: 100% of new users see the wizard before interacting with the main Planner UI — no bypass path exists.
- **SC-004**: The wizard never appears more than once per user/device after it has been completed or skipped.
- **SC-005**: The Joyride tour fires correctly after wizard completion for users who have not previously taken the tour.
- **SC-006**: All wizard screens are fully readable and operable on a 320px-wide screen without horizontal scrolling.
- **SC-007**: Inline validation on the goal creation step prevents submission of invalid goals and displays a clear error message within 1 second of form interaction.

## Assumptions

- Onboarding state is stored in the same browser-local mechanism used by the existing `tourTaken` flag (localStorage), consistent with the app's current storage patterns.
- The wizard appears as a full-screen modal overlay, not a separate route, so it can be layered over the landing page without a page navigation event.
- The wizard does not collect any data other than the first financial goal; all other wizard steps are informational.
- The Joyride tour (PageTour component) remains unchanged and continues to be triggered by its own existing `tourTaken` flag independently of the new onboarding wizard state.
- The "New Plan" and "Open existing plan" flows for returning users are not changed.
