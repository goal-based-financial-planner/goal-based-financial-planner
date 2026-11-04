import { FinancialGoal } from './FinancialGoals';
import { GoalFunding } from './goalFunding';
import { buildGoalProjection } from './goalProjection';
import { GoalRiskDisplayStatus, GoalRiskSummary, summarizeGoalRisk } from './goalRiskStatus';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { calculateInvestmentSuggestionsForGoal } from './investmentCalculations';
import { GoalType } from '../types/enums';
import { isGoalDone } from './goalCompletion';
import dayjs from 'dayjs';

/** Absorbs rupee rounding: a goal whose SIPs match its plan exactly shouldn't read as at risk. */
const ON_TRACK_RATIO = 0.995;

export type GoalOutlook = {
  statuses: Record<string, GoalRiskDisplayStatus>;
  summary: GoalRiskSummary;
  /** Average share of each evaluated goal's target its own SIPs reach by its date (0–100), or null. */
  healthScore: number | null;
};

/**
 * Per-goal risk from each goal's own share of the SIPs (see `buildGoalFunding`): on track when
 * that share, continued, reaches the goal's target by its target date. Unlike the shared-pot
 * projection in `whatIf.ts`, money isn't assumed to move to this goal once earlier goals finish.
 * Recurring goals and one-time goals that haven't started yet are not evaluated.
 */
export function deriveGoalOutlook(
  goals: FinancialGoal[],
  allocations: InvestmentAllocationsType,
  funding: Record<string, GoalFunding>,
  asOf: string,
): GoalOutlook {
  const statuses: Record<string, GoalRiskDisplayStatus> = {};
  const fundedRatios: number[] = [];

  goals.forEach((goal) => {
    const notStarted = dayjs(asOf).isBefore(dayjs(goal.getInvestmentStartDate()), 'day');
    const completed = isGoalDone(goal, asOf);
    if (goal.goalType !== GoalType.ONE_TIME || notStarted || completed) {
      statuses[goal.id] = 'not-evaluated';
      return;
    }
    const target = goal.getInflationAdjustedTargetAmount();
    const { points } = buildGoalProjection(
      goal,
      calculateInvestmentSuggestionsForGoal(goal, allocations),
      funding[goal.id]?.contributions ?? [],
    );
    const projected = points[points.length - 1]?.projected ?? 0;
    const ratio = target > 0 ? projected / target : 1;
    statuses[goal.id] = ratio >= ON_TRACK_RATIO ? 'on-track' : 'at-risk';
    fundedRatios.push(Math.min(1, ratio));
  });

  return {
    statuses,
    summary: summarizeGoalRisk(statuses),
    healthScore:
      fundedRatios.length > 0
        ? Math.round((fundedRatios.reduce((sum, r) => sum + r, 0) / fundedRatios.length) * 100)
        : null,
  };
}
