import dayjs, { Dayjs } from 'dayjs';
import { FinancialGoal } from './FinancialGoals';
import { calculateFutureValue } from './investmentCalculations';
import { GoalContribution } from './goalFunding';
import { InvestmentSuggestion } from '../types/planner';

export type GoalProjectionPoint = {
  date: Date;
  /** What this goal's share of the logged SIPs has grown to, assuming they continue. */
  projected: number;
  /** Where the corpus needs to be to reach the target on time if the plan were followed. */
  required: number;
};

export type GoalProjection = {
  points: GoalProjectionPoint[];
  /** First month the projected corpus reaches the target, or null if it never does within 50 years. */
  estimatedCompletion: Dayjs | null;
};

const MAX_MONTHS = 50 * 12;

// Counted in whole calendar months, matching the month-start grid the points are built on —
// a SIP starting mid-month must still count its first instalment in that month's point.
const projectedAt = (contributions: GoalContribution[], at: Dayjs) =>
  contributions.reduce(
    (sum, c) =>
      sum +
      calculateFutureValue(
        c.monthly,
        Math.max(0, at.startOf('month').diff(dayjs(c.from).startOf('month'), 'month')),
        c.annualReturnPct,
      ),
    0,
  );

/** Month-by-month corpus for one goal, from its investment start to its end. */
export function buildGoalProjection(
  goal: FinancialGoal,
  suggestions: InvestmentSuggestion[],
  contributions: GoalContribution[],
): GoalProjection {
  const start = dayjs(goal.getInvestmentStartDate()).startOf('month');
  const termMonths = Math.max(goal.getMonthTerm(), 1);
  const target = goal.getInflationAdjustedTargetAmount();

  const points: GoalProjectionPoint[] = [];
  for (let m = 0; m <= termMonths; m += 1) {
    const at = start.add(m, 'month');
    points.push({
      date: at.toDate(),
      projected: Math.round(projectedAt(contributions, at)),
      required: Math.round(
        suggestions.reduce((sum, s) => sum + calculateFutureValue(s.amount, m, s.expectedReturnPercentage), 0),
      ),
    });
  }

  let estimatedCompletion: Dayjs | null = null;
  if (contributions.length > 0 && target > 0) {
    for (let m = 0; m <= MAX_MONTHS; m += 1) {
      const at = start.add(m, 'month');
      if (projectedAt(contributions, at) >= target) {
        estimatedCompletion = at;
        break;
      }
    }
  }

  return { points, estimatedCompletion };
}
