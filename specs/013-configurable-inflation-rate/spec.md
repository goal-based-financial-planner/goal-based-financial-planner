# Feature Specification: User-Configurable Inflation Rate

**Feature Branch**: `013-configurable-inflation-rate`
**Created**: 2026-05-13
**Status**: Draft
**Input**: User description: "Inflation adjustment already exists but is hardcoded at 5% and only applied to one-time goals, not recurring ones. The real gap is: (a) let users set their own rate, (b) apply it to recurring goals too."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Set a Custom Inflation Rate for a Plan (Priority: P1)

A user who knows that their country's long-term inflation averages 6–7%, or who is planning for a high-inflation category like education (often 8–10%), wants the planner to use their expected rate instead of the system default. They change the inflation rate directly from a persistent inline control on the Planner page (near the total monthly investment header) and immediately see all goal corpus targets and SIP suggestions recalculate to reflect the new assumption.

**Why this priority**: This is the core gap. Currently any user who disagrees with the hardcoded 5% has no recourse — their SIP suggestions are silently wrong. This story alone delivers the majority of the feature's value.

**Independent Test**: Can be fully tested by changing the inflation rate on an existing plan with at least one one-time goal and verifying that the displayed inflation-adjusted target amount and suggested SIP change accordingly.

**Acceptance Scenarios**:

1. **Given** an existing plan with a one-time goal of ₹10,00,000 in 5 years, **When** the user views the plan with the default inflation rate of 5%, **Then** the inflation-adjusted corpus shown is approximately ₹12,76,282 (₹10L × 1.05⁵).
2. **Given** the same plan, **When** the user changes the inflation rate to 8%, **Then** the inflation-adjusted corpus updates to approximately ₹14,69,328 (₹10L × 1.08⁵) and the SIP suggestion recalculates accordingly.
3. **Given** the user enters an invalid value (e.g., negative or above 20%), **When** they try to save, **Then** the system rejects the input with a clear error message.
4. **Given** the user clears the inflation rate field, **When** they save, **Then** the rate falls back to the default of 5%.

---

### User Story 2 — Inflation Applied to Recurring Goals (Priority: P2)

A user with recurring goals (e.g., an annual vacation budgeted at ₹1,00,000/year for 3 years) currently gets SIP suggestions that ignore the fact that costs will rise year over year. They expect the planner to factor in inflation for recurring goals the same way it does for one-time goals.

**Why this priority**: Without this, recurring goal SIP suggestions are systematically under-estimated. It is a correctness fix. P2 because the plan-level rate setting (P1) is a prerequisite.

**Independent Test**: Can be fully tested by comparing the suggested monthly SIP for a recurring goal before and after enabling inflation adjustment, confirming the inflated amount equals `targetAmount × (1 + inflationRate)^durationYears`.

**Acceptance Scenarios**:

1. **Given** a recurring goal with a yearly target of ₹1,00,000 and a 3-year duration, **When** the inflation rate is 5%, **Then** the inflation-adjusted corpus is approximately ₹1,15,763 (₹1L × 1.05³) and the SIP suggestion reflects this higher target.
2. **Given** the same recurring goal, **When** the inflation rate is changed to 7%, **Then** the inflation-adjusted corpus updates to approximately ₹1,22,504 (₹1L × 1.07³) and the SIP updates in real time.
3. **Given** a recurring goal with no duration stored (legacy data), **When** inflation is applied, **Then** the system treats the duration as 1 year, consistent with existing default behaviour.

---

### User Story 3 — Inflation Rate Persists Across Sessions (Priority: P3)

A user who has set a custom inflation rate of 7% expects to see that same rate the next time they open the plan — whether stored locally or on Google Drive.

**Why this priority**: Without persistence, users must re-enter their preference on every visit, which undermines trust in the tool.

**Independent Test**: Can be fully tested by setting a non-default inflation rate, closing and reopening the plan, and confirming the rate and all calculated values match what was saved.

**Acceptance Scenarios**:

1. **Given** the user sets the inflation rate to 8% and saves/closes the plan, **When** they reopen the same plan, **Then** the inflation rate field shows 8% and all goal calculations reflect 8%.
2. **Given** a plan created before this feature existed (no inflation rate stored), **When** it is opened, **Then** the inflation rate defaults to 5% and all existing calculations remain unchanged (backward compatibility).

---

### Edge Cases

- What happens when a goal has a term of 0 years (start date equals target date)? Inflation factor is `(1+r)^0 = 1` — target is unchanged regardless of rate.
- What happens if the user sets inflation to exactly 0%? All goals show their nominal (non-inflated) target amount — valid use case for users who prefer to plan in today's money.
- How does the system handle an inflation rate with more than 2 decimal places (e.g., 5.123%)? The system rounds to 2 decimal places on save.
- What if two browser tabs have the same plan open and one changes the inflation rate? The last-saved value wins, consistent with existing storage behaviour for other plan edits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a plan-level inflation rate setting, displayed as a persistent inline control on the Planner page near the total monthly investment summary, that applies uniformly to all goals in the plan.
- **FR-002**: The inflation rate MUST accept values in the range 0%–20% inclusive, in increments of up to 0.01%.
- **FR-003**: The default inflation rate for all new plans and all legacy plans without a stored rate MUST be 5%.
- **FR-004**: The system MUST apply the inflation rate to one-time goals using compound inflation over the goal's year-term: `inflatedTarget = targetAmount × (1 + rate)^termYears`.
- **FR-005**: The system MUST apply the inflation rate to recurring goals using compound inflation over the goal's duration in years: `inflatedTarget = targetAmount × (1 + rate)^recurringDurationYears`.
- **FR-006**: For recurring goals with no duration stored (legacy data), the system MUST treat the duration as 1 year when computing the inflation-adjusted target.
- **FR-007**: All goal corpus targets, SIP suggestions, and progress calculations that currently use the hardcoded rate MUST use the user-configured rate instead.
- **FR-011**: The inflation-adjusted target amount MUST be the primary figure displayed for each goal. The original nominal amount entered by the user MUST be accessible via an info indicator (e.g., tooltip or supplementary label) adjacent to the adjusted figure.
- **FR-008**: Changes to the inflation rate MUST cause all dependent calculations to update immediately without requiring a page reload.
- **FR-009**: The inflation rate MUST be persisted as part of the plan data and restored when the plan is reopened (local and cloud storage).
- **FR-010**: The system MUST reject inflation rate inputs outside the 0–20% range with a user-readable validation message.

### Key Entities

- **Plan Settings**: A plan-level configuration object that includes `inflationRate` (number, 0–20, default 5). Previously implicit via a hardcoded constant; now an explicit, stored attribute of the plan.
- **Financial Goal**: Existing entity. No new fields added. The inflation-adjusted target calculation changes to accept the plan-level rate as an input rather than reading the global constant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can change the plan inflation rate and see all goal targets and SIP amounts update within 1 second, with no page reload required.
- **SC-002**: 100% of inflation-adjusted target amounts — both one-time and recurring — reflect the user-configured rate rather than a hardcoded value.
- **SC-003**: Legacy plans opened after this feature ships display identical goal calculations to before the change (default rate of 5% preserves backward compatibility).
- **SC-004**: Invalid inflation rate inputs are blocked at the point of entry with a clear error message, resulting in zero silent miscalculations reaching the planner view.
- **SC-005**: The inflation rate setting survives a plan close-and-reopen cycle in both local and cloud storage modes.

## Clarifications

### Session 2026-05-13

- Q: Where should the inflation rate setting live in the UI? → A: Persistent inline control on the Planner page, near the total monthly investment header — always visible and editable without navigating away.
- Q: When displaying a goal's target amount, should both nominal and inflation-adjusted values be shown? → A: Inflation-adjusted amount is the primary figure; an info indicator (tooltip or label) reveals the original nominal amount entered by the user.
- Q: Should the inflation rate be configurable in the onboarding wizard? → A: No — onboarding defaults to 5%; users adjust the rate from the persistent Planner control after onboarding completes.

## Assumptions

- The inflation rate is a **plan-level** setting, not a per-goal setting. A single rate applies to all goals in a plan. Per-goal rates would add significant UX complexity and are out of scope for this feature.
- The inflation rate is not surfaced in the onboarding wizard. New users start with the default of 5% and can change it from the Planner page at any time.
- The inflation adjustment formula for recurring goals mirrors the one-time goal formula, using `recurringDurationYears` as the exponent. This reflects the compound cost increase a user would face over the recurring goal's active period.
- The upper bound of 20% is a practical cap covering extreme economic environments while preventing obviously erroneous inputs.
- Allowing 0% is intentional: users planning purely in nominal terms should be able to disable inflation adjustment.
- Inflation rate affects only the **target corpus** — it makes the savings target larger. It does not alter the SIP formula or investment return rates.
