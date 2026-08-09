# Phase 0 Research: What If

## Revision history

This feature was built three times on the same branch. Each revision is kept here rather than
deleted, since each one reflects a real correction driven by user feedback after seeing the
previous version in a browser test.

### Revision 1 (abandoned): SIP/inflation/date overrides on a shared-portfolio chart

Read the original request as "compare scenarios with different SIP amounts, inflation rates, or
target dates." Built named, saved `Scenario` entities with a sparse per-goal override map, and
reused `buildPortfolioWithdrawalSeries` (the Portfolio tab's shared-pool, sequential-withdrawal
engine) to chart them. Rejected because: SIP-amount overrides let the user trivially "fix" any
shortfall by typing a bigger number, so nothing was actually being tested; and the shared-withdrawal
model produces a cliff-to-zero at each goal's withdrawal date that reads as broken rather than
informative.

### Revision 2 (abandoned): Named scenarios, inflation + return overrides, per-goal charts

User feedback reframed the feature as a stress test: "what happens if inflation on a goal changes,
or if returns on an investment type drop — would I still meet the target?" Rebuilt around two
override types (per-goal inflation rate, per-investment-type return rate) with the planned SIP held
fixed, computed independently per goal via `calculateFutureValue`, and displayed one chart + one
shortfall figure per goal, across up to 3 named/saved scenarios plus baseline.

Rejected because further feedback ("we don't really need multiple scenarios and the ability to
look individual goals through") established that neither the scenario-saving/comparison
infrastructure nor the per-goal breakdown were wanted — the user wanted something much lighter.

### Revision 3 (current): Live sliders, no persistence, one combined chart

**Decision**: Drop the `Scenario` entity entirely. Replace it with ephemeral local component state
(`Adjustments`: two maps, never saved) driving two live-updating sliders sections (inflation per
goal, return per investment type) and a single combined chart summing every goal's contribution
onto one shared calendar.

**Rationale**: Matches the explicit ask — "just create a section... sliders for inflation
adjustment and section for return rate adjustment, change the graph next to it live." No naming,
no saving, no comparing multiple named scenarios, no per-goal drill-down.

**What was reverted**: `PlannerData.scenarios` field, both storage providers' scenario
parsing, all 6 scenario reducer actions, and the entire `ScenarioComparison`/`GoalScenarioChart`/
`ScenarioOverrideForm` component tree. What was kept: `calculateInvestmentSuggestionsForGoal`
(still the right place for the fixed-SIP calculation) and `FinancialGoal.getInflationAdjustedTargetAmount(rateOverride?)`
(still the right way to project a goal under a different rate) — both are reused by the new
`domain/whatIf.ts`.

**Alternatives considered for the combined chart**:
- *Overlay every goal's own pair of lines on one chart*: rejected — busier, and the whole point of
  this revision was to stop showing per-goal detail.
- *Persist slider positions*: considered and explicitly rejected by the user — the tool is meant to
  be a quick, stateless "what if," not another piece of saved plan data.

## Decision: Combined series is a sum, not a withdrawal simulation

**Decision**: The combined "What If" line is the sum, at each calendar month, of every goal's own
independent compounding curve (0 before that goal's start, its own curve during, held flat at its
final value after its target date) — not a shared pool with sequential withdrawals.

**Rationale**: Withdrawal semantics (a shared pool that drains as each goal is "cashed out") answers
a different question than "would my assumptions hold" and was already rejected in Revision 1 for
producing a misleading cliff-to-zero shape. A simple sum keeps the combined chart interpretable:
each goal contributes independently, so a slider change on one goal/instrument visibly changes the
total by roughly that goal's share.

## Resolved unknowns

No `[NEEDS CLARIFICATION]` markers remain. The chart content (combined total vs. overlaid per-goal
lines) and persistence question (ephemeral vs. saved) were both confirmed directly with the user
before this revision.
