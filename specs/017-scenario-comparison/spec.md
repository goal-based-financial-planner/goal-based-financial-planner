# Feature Specification: What If

**Feature Branch**: `017-scenario-comparison` (feature renamed to "What If" during design; branch/folder name kept for history)
**Created**: 2026-07-19
**Status**: Draft
**Input**: User description: "A live 'What If' tab: sliders for per-goal inflation adjustment and per-investment-type return adjustment, with a single combined chart (Current Plan vs What If) that updates as the sliders move. No saved/named scenarios, no per-goal browsing — one live, ephemeral exploration tool."

## Revision history

This feature went through two prior designs before landing here — see `research.md` for the full
account:
1. SIP-amount / inflation-rate / target-date overrides on named, saved scenarios compared via a
   chart reused from the Portfolio tab's shared-withdrawal engine.
2. Named, saved scenarios limited to inflation-rate and return-rate overrides, compared per goal
   (one chart per goal).
3. **(current)** No saved scenarios at all. One live, ephemeral "What If" panel: a slider per goal
   for inflation, a slider per investment type for returns, and one combined chart comparing the
   current plan against the live adjustment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag a Slider and See the Impact Immediately (Priority: P1)

A user opens the "What If" tab and wants to know, right now, without any setup: "if inflation on my
house goal runs at 15% instead of 5%, or if equity returns drop to 6%, would I still be on track?"
They drag the relevant slider and watch the chart and the status figure update as they move it —
no "create scenario," no naming, no saving.

**Why this priority**: This immediacy is the entire point of the feature. A slider that doesn't
update live isn't meaningfully different from a form.

**Independent Test**: Open the What If tab with an existing plan, drag an inflation slider, and
verify the "What If" line/figure updates within the same interaction (no separate save/apply step).

**Acceptance Scenarios**:

1. **Given** a user opens the What If tab, **When** the tab first renders, **Then** every slider
   starts at the goal's (or investment type's) current baseline rate, and the chart shows the
   "What If" line overlapping the "Current Plan" line exactly (no adjustment yet).
2. **Given** a user drags a goal's inflation slider upward, **When** the drag is in progress,
   **Then** the combined "What If" line and the "What If" status figure update continuously to
   reflect the new, higher target — while the "Current Plan" line and figure stay fixed.
3. **Given** a user drags an investment type's return slider downward, **When** the drag is in
   progress, **Then** every goal using that investment type contributes a lower value to the
   combined "What If" line, updating continuously — while the target stays fixed.

---

### User Story 2 - See One Combined Picture, Not Per-Goal Detail (Priority: P1)

A user with several goals doesn't want to click through each goal individually to understand the
effect of an assumption change — they want one chart and one headline number that tells them,
across their whole plan, whether they're still on track.

**Why this priority**: This is what distinguishes "What If" from the earlier per-goal comparison
design — deliberately less detail, more immediacy.

**Independent Test**: With 2+ goals in the plan, adjust a slider and verify the chart shows exactly
two lines ("Current Plan" and "What If") and one pair of status figures, never a per-goal
breakdown.

**Acceptance Scenarios**:

1. **Given** a plan with multiple goals, **When** the What If tab renders, **Then** exactly one
   chart is shown, combining every goal's contribution into two lines.
2. **Given** the combined "What If" projection falls short of the combined target, **When** viewed
   on the tab, **Then** a single "short by ₹X" figure is shown for the whole plan, not one per goal.

---

### User Story 3 - Reset Back to Baseline (Priority: P2)

Having explored a few adjustments, a user wants to get back to the starting point without manually
resetting every slider.

**Why this priority**: Convenience — the feature is fully usable without it (a user could drag each
slider back), but it removes friction from exploration.

**Independent Test**: Adjust several sliders, click "Reset," and verify every slider returns to its
baseline position and the "What If" line/figure matches "Current Plan" again.

**Acceptance Scenarios**:

1. **Given** one or more sliders have been moved, **When** the user clicks "Reset," **Then** all
   sliders return to their baseline values and the chart/figures show no divergence.
2. **Given** no sliders have been moved, **When** the tab renders, **Then** "Reset" is disabled
   (nothing to reset).

---

### Edge Cases

- What happens when a user has no one-time goals? The tab shows a message directing them to add a
  goal first; no sliders are shown.
- What happens when the user navigates away from the What If tab and back? Adjustments reset to
  baseline — nothing is persisted (this is a deliberate simplification; see Assumptions).
- What happens when an investment type isn't used by any goal? It doesn't appear as a slider (only
  types actually present in the plan's allocation mix are shown).
- What happens when a slider is dragged to its baseline value exactly? The "What If" line/figure
  matches "Current Plan" for that dimension — no special-casing needed.
- What happens when the plan itself changes (a goal is added/edited) while adjustments are active?
  The combined chart and figures recompute from the current plan; any adjustment for a goal that no
  longer exists is simply not applied (nothing to look up).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show, for each one-time goal, a slider that adjusts that goal's
  inflation rate assumption, defaulting to the goal's own baseline inflation rate.
- **FR-002**: The system MUST show, for each investment type present anywhere in the plan's
  allocation mix, a slider that adjusts that type's expected annual return assumption, defaulting
  to its baseline expected return.
- **FR-003**: The monthly amount planned for each goal (the existing baseline "required monthly
  investment") MUST NOT change as sliders move — only the assumptions used to project that fixed
  investment forward change.
- **FR-004**: The system MUST show a single combined chart with two lines — "Current Plan" (fixed,
  baseline) and "What If" (live, reflecting current slider positions) — summing every one-time
  goal's contribution onto one shared calendar timeline.
- **FR-005**: The system MUST show a status figure for both "Current Plan" and "What If" — total
  target vs. total projected value across all goals, as "on track" or "short by ₹X."
- **FR-006**: The chart and status figures MUST update continuously as a slider is dragged, without
  a separate save/apply/confirm step.
- **FR-007**: The system MUST provide a "Reset" action that returns every slider to its baseline
  value; it MUST be disabled when no adjustments are active.
- **FR-008**: Slider adjustments MUST NOT be persisted — they reset to baseline every time the tab
  is opened (including on page reload), and MUST NOT alter the underlying stored plan.
- **FR-009**: The What If tab applies only to one-time goals; recurring goals are excluded,
  consistent with their exclusion from the existing portfolio projection.

### Key Entities

- **Adjustments**: The current, ephemeral, in-memory slider state — a map of per-goal inflation
  rate overrides and a map of per-investment-type return rate overrides. Never persisted; exists
  only for the lifetime of the What If tab being open.
- **Portfolio What-If Result**: The computed outcome of applying the current adjustments (or none,
  for baseline) across every one-time goal — total target amount, total projected value, total
  shortfall/surplus, status, and one combined monthly series for the chart.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Moving any slider updates the chart and status figures within the same drag
  interaction — no perceptible lag, no separate confirmation step.
- **SC-002**: The combined chart always shows exactly two lines regardless of how many goals exist.
- **SC-003**: 100% of the time, the "Current Plan" line and figure are unaffected by slider
  movement — only "What If" changes.
- **SC-004**: Reloading the page or reopening the What If tab always shows every slider back at its
  baseline position.
- **SC-005**: A return-rate slider for an investment type affects exactly the goals whose
  allocation includes that type, and no others.

## Assumptions

- No scenario is named, saved, or comparable against other saved scenarios — this feature is a
  single live exploration tool, not a scenario library.
- No per-goal chart or per-goal browsing exists — everything is combined into one chart and one
  pair of status figures across the whole plan.
- Adjustments are ephemeral local UI state; nothing is added to `PlannerData` and nothing is written
  to local storage or Google Drive for this feature.
- Slider ranges are bounded to realistic values (0–20% for both inflation and return rate) rather
  than the wider ranges some existing forms allow, since this is an exploratory tool, not a data
  entry form.
- The existing PDF export (010) is unaffected — What If adjustments are never part of any export.
