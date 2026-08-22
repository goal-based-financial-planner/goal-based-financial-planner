# Research: Goal Risk Dashboard

## Decision: Read status from `whatIf.ts`'s existing output — no new simulation

**Decision**: Do not touch `src/domain/whatIf.ts`. Add one new, small pure module,
`src/domain/goalRiskStatus.ts`, that derives a per-goal display status and a portfolio summary
purely from data `buildPortfolioWhatIfResult` already returns when called with empty adjustments
(`{ goalInflationRates: {}, investmentReturnRates: {} }`) — the exact same "baseline" the What-If
tab already computes via `useWhatIf`.

**Rationale**:
- `WhatIfGoalMarker.portfolioValueAfter` is already documented as "negative means this goal (or an
  earlier one sharing its month) couldn't be fully funded" — i.e. it is already the per-goal
  attainment signal this feature needs. No new math, no risk of the new indicator disagreeing with
  what the What-If tab reports for the unmodified plan (this is exactly Success Criterion SC-002).
- The portfolio-wide dip that produces `PortfolioWhatIfResult.totalShortfall` can only occur in a
  month where a withdrawal happens (compounding alone never produces a dip), so the overall
  `status`/`totalShortfall` is mathematically equivalent to "at least one marker's
  `portfolioValueAfter < 0`". This means the reconciled stat-strip signal (FR-009) and the per-goal
  chips (FR-001) are guaranteed consistent by construction — nothing to keep in sync by hand.
- Reusing rather than modifying `whatIf.ts` respects Constitution Principle I (no duplicated
  calculations) and keeps this feature's diff small and reversible (Principle V).

**Alternatives considered**:
- *Extend `buildPortfolioWhatIfResult` to also return a `Record<goalId, GoalAttainmentStatus>`
  directly* — rejected: would touch a well-tested, already-shipped engine (017) for a derivation
  that's entirely expressible from its existing output; higher blast radius for no gain.
- *Run an independent, simplified per-goal solvency check (e.g. compare each goal's own SIPs against
  its own target, ignoring shared-corpus sequencing)* — rejected: this is exactly the naive
  heuristic `PlannerStatStrip` uses today (`totalInvesting >= totalRequired`), which the
  clarification session already identified as misleading (ignores timing) and asked to retire, not
  reintroduce at goal level.

## Decision: Compute once per render at the Planner page level, not inside a shared hook

**Decision**: `Planner/index.tsx` computes the baseline result and the derived per-goal statuses via
plain `useMemo`s (matching its existing style — `targetAmount`, `totalRequired`, `totalInvesting`
are already computed this way in that file), then passes the results down as props to
`PlannerStatStrip` and, through `GoalBox` → `GoalList`, to `GoalCard`. The `What If` tab keeps using
its own `useWhatIf` hook unchanged (it independently computes the same baseline internally, plus
the adjusted/top-up results the dashboard doesn't need).

**Rationale**: `buildPortfolioWhatIfResult` is a pure, `useMemo`-cheap function over data already in
memory (typically 3–10 goals) — recomputing it once for the main page and once inside the What-If
tab is a negligible duplicate calculation, not a duplicated *business rule* (the rule itself still
lives in exactly one place, `whatIf.ts`). Introducing a shared hook or lifting state to avoid this
would add prop-plumbing between two otherwise-independent tabs for no measurable benefit.

**Alternatives considered**:
- *Extract a `useGoalRiskStatus` hook* — considered, but with only one call site (`Planner/index.tsx`)
  today, a hook adds indirection without reuse; a plain `useMemo` next to the file's existing
  derivations is more consistent with the surrounding code (Principle II: keep page-specific
  derivation co-located, don't manufacture shared surface prematurely).

## Decision: Where per-goal chips render — inside the existing Goals drawer, not a new surface

**Decision**: The per-goal indicator (FR-001) renders on `GoalCard`, which already only renders
inside the Goals drawer (opened via the "Goals" stat tile's chips / the drawer trigger), not
directly on the always-visible page body. The always-visible surface (no click required) is the
`PlannerStatStrip` summary from User Story 2 (FR-005) and the reconciled shortfall caption (FR-009).

**Rationale**: This matches the codebase as it stands — `GoalCard` has never rendered outside that
drawer, and the spec's "without requiring the user to open the What-If tab or touch any sliders"
is satisfied by not needing the What-If tab; opening the pre-existing Goals drawer (a single click,
not a slider) is the established way to browse individual goals in this app and isn't in tension
with any spec requirement or success criterion.

**Alternatives considered**:
- *Add goal chips to a new, always-visible list on the main page body* — rejected as unnecessary
  scope: no clarification or requirement asked for individual goals to be visible without any
  interaction, only that the *fact* of risk be surface-level (satisfied by the summary count) and
  that per-goal detail not require the What-If tab specifically.

## Decision: "Not evaluated" is a third display state, not an absence of markup

**Decision**: Introduce `GoalRiskDisplayStatus = 'on-track' | 'at-risk' | 'not-evaluated'` in the new
domain module, rather than reusing `whatIf.ts`'s `GoalAttainmentStatus` (`'on-track' | 'at-risk'`)
directly with `undefined` standing in for "not evaluated".

**Rationale**: Per the resolved clarification (FR-008), recurring goals must show a *visually
distinct* treatment, not simply omit a chip — an explicit third value makes that a compile-time
requirement on every render path (`GoalCard` must handle all three), rather than a convention that
"no chip" means "recurring", which is easy to accidentally collapse with a loading/empty state.

**Alternatives considered**:
- *Reuse `GoalAttainmentStatus` and treat `undefined`/missing map entry as "not evaluated"* —
  rejected: makes "not evaluated" an implicit, easy-to-miss case rather than an explicit one; harder
  to unit test exhaustively.
