import { FinancialGoal } from './FinancialGoals';
import { PortfolioWhatIfResult } from './whatIf';
import { GoalType } from '../types/enums';

/**
 * A goal's non-persisted, render-time risk classification.
 *
 * - `on-track` / `at-risk`: derived for one-time goals from the plan's current (unmodified)
 *   assumptions — see `deriveGoalRiskStatuses`.
 * - `not-evaluated`: recurring goals have no shortfall projection today, so they always get this
 *   distinct third state rather than being silently mapped to either of the other two.
 */
export type GoalRiskDisplayStatus = 'on-track' | 'at-risk' | 'not-evaluated';

/** Portfolio-level count for the always-visible summary. Recurring goals are never counted. */
export type GoalRiskSummary = {
  atRisk: number;
  total: number;
};

/**
 * Reads the per-goal risk signal straight off `baseline` (built from `whatIf.ts`'s
 * `buildPortfolioWhatIfResult` with `EMPTY_ADJUSTMENTS` — i.e. the plan's own current
 * assumptions), rather than running any new projection. `WhatIfGoalMarker.portfolioValueAfter` is
 * already the shared corpus's value right after that goal's own withdrawal; negative means the
 * corpus couldn't fully fund it (whether because of this goal alone or an earlier one sharing its
 * withdrawal month) — exactly the signal this feature needs.
 */
export function deriveGoalRiskStatuses(
  goals: FinancialGoal[],
  baseline: PortfolioWhatIfResult,
): Record<string, GoalRiskDisplayStatus> {
  const markerByGoalId = new Map(baseline.markers.map((marker) => [marker.goalId, marker]));

  const statuses: Record<string, GoalRiskDisplayStatus> = {};
  goals.forEach((goal) => {
    if (goal.goalType !== GoalType.ONE_TIME) {
      statuses[goal.id] = 'not-evaluated';
      return;
    }
    const marker = markerByGoalId.get(goal.id);
    statuses[goal.id] = marker && marker.portfolioValueAfter < 0 ? 'at-risk' : 'on-track';
  });
  return statuses;
}

/** Portfolio-level count for the always-visible summary — recurring goals excluded entirely. */
export function summarizeGoalRisk(
  statuses: Record<string, GoalRiskDisplayStatus>,
): GoalRiskSummary {
  const evaluated = Object.values(statuses).filter((status) => status !== 'not-evaluated');
  return {
    atRisk: evaluated.filter((status) => status === 'at-risk').length,
    total: evaluated.length,
  };
}
