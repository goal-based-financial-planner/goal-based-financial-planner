import dayjs from 'dayjs';
import { FinancialGoal, isGoalActive } from './FinancialGoals';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { calculateFutureValue, calculateInvestmentSuggestionsForGoal } from './investmentCalculations';
import { SIPEntry } from '../types/investmentLog';
import { GoalType } from '../types/enums';

/** One SIP's share attributed to a goal. */
export type GoalContribution = {
  sip: SIPEntry;
  /** This goal's share of the SIP, per month. */
  monthly: number;
  annualReturnPct: number;
  /** When this share started counting for the goal (YYYY-MM-DD). */
  from: string;
};

export type GoalFunding = {
  /** Planned monthly SIP for the goal over its whole term, whether or not it has started. */
  requiredMonthly: number;
  /** The share of logged SIPs attributed to the goal, per month. */
  investingMonthly: number;
  /** What the attributed SIPs have grown to by `asOf`. */
  fundedValue: number;
  /** `fundedValue` as a whole percent of the inflation-adjusted target, capped at 100. */
  fundedPercent: number;
  contributions: GoalContribution[];
};

/** When the goal's money is needed: its target date, or the end of a recurring goal's cycle. */
const goalEnd = (goal: FinancialGoal) =>
  goal.goalType === GoalType.RECURRING
    ? dayjs(goal.getInvestmentStartDate()).add(goal.getMonthTerm(), 'month')
    : dayjs(goal.getTargetDate());

/**
 * Per-goal funding from the logged SIPs. SIPs aren't linked to goals, so each instrument's
 * logged monthly total fills the goals active on `asOf` that plan to invest in it, earliest
 * target date first, each up to what its plan needs from that instrument. Anything left over once
 * every goal's need is met is shared in proportion to need. SIP types no active goal plans for
 * aren't attributed. A SIP without a start date counts from the goal's own investment start.
 */
export function buildGoalFunding(
  goals: FinancialGoal[],
  allocations: InvestmentAllocationsType,
  sips: SIPEntry[],
  asOf: string,
): Record<string, GoalFunding> {
  const suggestionsByGoal = new Map(
    goals.map((goal) => [goal.id, calculateInvestmentSuggestionsForGoal(goal, allocations)]),
  );
  const activeGoals = goals
    .filter((goal) => isGoalActive(goal, asOf))
    .sort((a, b) => goalEnd(a).diff(goalEnd(b)));

  const actualByInstrument: Record<string, number> = {};
  sips.forEach(({ type, monthlyAmount }) => {
    actualByInstrument[type] = (actualByInstrument[type] ?? 0) + monthlyAmount;
  });

  // share[goalId][instrument]: the fraction of that instrument's logged SIPs attributed to the goal.
  const share: Record<string, Record<string, number>> = {};
  Object.entries(actualByInstrument).forEach(([instrument, actual]) => {
    if (actual <= 0) return;
    const needs = activeGoals
      .map((goal) => ({
        goal,
        need: suggestionsByGoal.get(goal.id)!.find((s) => s.investmentName === instrument)?.amount ?? 0,
      }))
      .filter(({ need }) => need > 0);
    const totalNeed = needs.reduce((sum, { need }) => sum + need, 0);
    if (totalNeed === 0) return;

    let remaining = actual;
    const allotted = needs.map(({ goal, need }) => {
      const take = Math.min(need, remaining);
      remaining -= take;
      return { goal, need, amount: take };
    });
    allotted.forEach(({ goal, need, amount }) => {
      const total = amount + (remaining * need) / totalNeed;
      share[goal.id] = { ...share[goal.id], [instrument]: total / actual };
    });
  });

  const result: Record<string, GoalFunding> = {};
  goals.forEach((goal) => {
    const suggestions = suggestionsByGoal.get(goal.id)!;
    const requiredMonthly = suggestions.reduce((sum, s) => sum + s.amount, 0);
    let investingMonthly = 0;
    let fundedValue = 0;
    const contributions: GoalContribution[] = [];

    if (share[goal.id]) {
      const goalStart = dayjs(goal.getInvestmentStartDate());
      suggestions.forEach(({ investmentName, expectedReturnPercentage }) => {
        const fraction = share[goal.id][investmentName];
        if (!fraction) return;
        sips
          .filter((sip) => sip.type === investmentName)
          .forEach((sip) => {
            const monthly = sip.monthlyAmount * fraction;
            // Float leftovers from the earliest-first split shouldn't show up as ₹0 links.
            if (monthly < 0.5) return;
            const sipStart =
              sip.startDate && dayjs(sip.startDate).isValid() ? dayjs(sip.startDate) : goalStart;
            const from = sipStart.isAfter(goalStart) ? sipStart : goalStart;
            // Calendar months, like the projection chart: a SIP counts an instalment for every
            // month it has been running, whatever the day or time it started.
            const months = Math.max(0, dayjs(asOf).startOf('month').diff(from.startOf('month'), 'month'));
            const annualReturnPct = sip.expectedReturnPct ?? expectedReturnPercentage;
            investingMonthly += monthly;
            fundedValue += calculateFutureValue(monthly, months, annualReturnPct);
            contributions.push({ sip, monthly, annualReturnPct, from: from.format('YYYY-MM-DD') });
          });
      });
    }

    const target = goal.getInflationAdjustedTargetAmount();
    result[goal.id] = {
      requiredMonthly: Math.round(requiredMonthly),
      investingMonthly: Math.round(investingMonthly),
      fundedValue: Math.round(fundedValue),
      fundedPercent: target > 0 ? Math.min(100, Math.round((fundedValue / target) * 100)) : 0,
      contributions,
    };
  });
  return result;
}
