# Research: Planner Page Layout Redesign

**Feature**: 016-layout-redesign
**Date**: 2026-07-11

---

## 1. Current Component Architecture

### Decision
Full codebase read completed. No external research required — all unknowns are internal.

### Current Structure (Planner/index.tsx)

```
Planner
├── Header (title + date picker + headerRight slot)
├── TargetBox            ← Total Goal Target + Add Goal button
├── TermwiseProgressBox  ← "Goals by Timeline" chips
├── InvestmentSuggestionsBox  [~75% width, left column]
│   ├── Tab: "Allocation Plan"
│   │   └── per-TermType: InvestmentPieChart → »» → InvestmentSuggestionsDoughnutChart → CustomLegend
│   └── Tab: "Investment Tracker"
│       └── InvestmentTracker
│           ├── Monthly Required / Monthly Investing stat boxes
│           ├── GoalGrowthChart          ← full portfolio chart
│           ├── By Instrument Type bars  ← SIP vs suggested comparison
│           └── Your SIPs list           ← SIP log + add/edit/delete
└── GoalBox  [~25% width, right sidebar]
    ├── Tab: "One Time (N)"
    │   ├── GoalList → GoalCard (pending goals)
    │   └── GoalList → GoalCard (completed goals)
    └── Tab: "Recurring (N)"
        └── GoalList → GoalCard
```

### Data Flow for Monthly Stats

`totalRequired` and `totalInvesting` are computed inside `InvestmentTracker`:
- `totalRequired` = `buildSIPComparison(sips, aggregatedSuggestions)` → sum of `suggestedAmount`
- `totalInvesting` = same comparison → sum of `actualAmount`

`aggregatedSuggestions` is computed in `InvestmentSuggestionsBox` from `investmentBreakdownForAllGoals` (already available in Planner).

**For the stat strip**, both values can be derived in `Planner/index.tsx`:
- `totalRequired`: aggregate `investmentBreakdownForAllGoals[*].investmentSuggestions[*].amount` by name, then sum
- `totalInvesting`: `plannerData.investmentLogs.reduce((sum, s) => sum + s.monthlyAmount, 0)`

---

## 2. Component Disposition Table

| Component | Disposition | Reason |
|-----------|-------------|--------|
| `TargetBox` | **Remove** | Total target moves to stat strip; Add Goal moves to Goals tab header |
| `TermwiseProgressBox` | **Remove** | Goals by Timeline chips are redundant with Goals tab |
| `GoalBox` | **Keep, promote to Goals tab** | Logic unchanged; receives more horizontal space |
| `GoalList` | **Modify** | Convert vertical `flex-column` to `Grid2` 2-column layout |
| `GoalCard` | **Modify** | Increase `px`/`py` from 1→2 to use available space |
| `InvestmentSuggestionsBox` | **Keep, becomes Investment Plan tab content** | No structural change needed |
| `InvestmentTracker` | **Modify** | Strip `GoalGrowthChart` and monthly stat boxes (both move out) |
| `GoalGrowthChart` | **Keep, promote to Portfolio tab** | Zero code changes; just moved in hierarchy |
| `PageTour` | **Modify** | Update step selectors: `.target-box` and `.financial-progress-box` go away |
| `PrintableReport` | **No change** | Has its own layout for PDF export |
| `Planner/index.tsx` | **Major restructure** | Add top-level tabs, stat strip, remove sidebar |
| `PlannerStatStrip` | **New component** | Three stat tiles: Total Target, Monthly Required, Monthly Investing |

---

## 3. MUI Layout Approach

### Decision
Use MUI `Tabs` + `Tab` (already imported project-wide) for top-level tabs in `Planner/index.tsx`. Use `Grid2` with `size={{ xs: 12, md: 6 }}` inside `GoalList` for the 2-column goal grid.

### Rationale
- `Tabs` is already in use inside `GoalBox` and `InvestmentSuggestionsBox` — no new API surface.
- `Grid2` is already used project-wide via `import Grid2 as Grid`.
- No new dependencies needed.

### Tab state persistence
Tab selection is ephemeral `useState` — same pattern used in existing `GoalBox` and `InvestmentSuggestionsBox` tabs. No persistence needed.

---

## 4. Stat Strip Data Sources

| Stat | Source | Already in Planner? |
|------|--------|---------------------|
| Total Goal Target | `plannerData.financialGoals.reduce(sum + getInflationAdjustedTargetAmount())` | ✅ (`targetAmount` memo) |
| Monthly Required | Aggregate `investmentBreakdownForAllGoals[*].investmentSuggestions[*].amount` | ✅ (`investmentBreakdownForAllGoals` memo) |
| Monthly Investing | `plannerData.investmentLogs.reduce(sum + monthlyAmount)` | ✅ (`plannerData.investmentLogs`) |

All three are derivable in `Planner/index.tsx` with no new data-fetching or prop drilling.

---

## 5. Page Tour Updates

Tour steps that reference removed elements:
- `.target-box` → update to point to the stat strip's Total Goal Target tile (new class: `.stat-total-target`)
- `.add-goals-button` → no change needed; button moves to Goals tab header but keeps same class
- `.financial-goals-box` → update selector to `.goals-tab-panel` (the Goals tab content area)
- `.financial-progress-box` → **remove this step** (TermwiseProgressBox is removed; the stat strip covers this information)
- `.investment-plan-box` → no change needed; `InvestmentSuggestionsBox` keeps this class

---

## 6. GoalCard Improvement

GoalCard is designed with narrow-column constraints (`px: 1, py: 1`; actions are `position: absolute` with `top: 4/36, right: 4`). In a wider grid cell, these constraints relax naturally. Changes needed:
- `px: 1 → px: 2`, `py: 1 → py: 2` for more breathing room
- No layout logic changes; card structure is already correct

---

## 7. Allocation Plan Visual Simplification

The current Allocation Plan tab shows:
- `InvestmentPieChart` (allocation %) [hidden on xs/sm/md]
- `»»` arrow icon [hidden on xs/sm/md]
- `InvestmentSuggestionsDoughnutChart` (amounts) [lg+ only]
- `CustomLegend` (always)

At full width in the Investment Plan tab, this layout has more room. The pie chart shows allocation %, the donut shows ₹ amounts — they're complementary, not redundant. The main improvement is that at full width, all three can show simultaneously on medium-screen desktops where they were previously hidden.

**Decision**: Keep both charts. Remove the `»»` arrow icon (it serves no informational purpose). The Grid breakpoints can be relaxed so charts show on `md` rather than only `lg`.

---

## 8. Risks

| Risk | Mitigation |
|------|-----------|
| Snapshot tests for `GoalBox`, `GoalCard`, `Planner` may fail after layout changes | Update snapshots; verify no logic changes |
| Tour may fail if selectors don't exist when tour fires | Update `allSteps` in PageTour to use new class names |
| PrintableReport references TargetBox/TermwiseProgressBox directly | PrintableReport is self-contained — it passes its own sub-components, not the removed wrappers |
