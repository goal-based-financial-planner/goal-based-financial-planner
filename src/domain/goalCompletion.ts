import dayjs from 'dayjs';
import { FinancialGoal, isGoalActive } from './FinancialGoals';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { buildGoalFunding, GoalContribution, GoalFunding } from './goalFunding';
import { buildGoalProjection } from './goalProjection';
import { calculateInvestmentSuggestionsForGoal } from './investmentCalculations';
import { SIPEntry } from '../types/investmentLog';
import { GoalType } from '../types/enums';

/** Done: reached its target early (recorded), or a one-time goal past its target date. */
export const isGoalDone = (goal: FinancialGoal, asOf: string) =>
  (!!goal.completion && !dayjs(asOf).isBefore(dayjs(goal.completion.at), 'day')) ||
  (goal.goalType === GoalType.ONE_TIME && dayjs(asOf).isAfter(dayjs(goal.getTargetDate()), 'day'));

/** When a done goal finished: the day it reached its target, or its target date. */
export const goalDoneDate = (goal: FinancialGoal) => goal.completion?.at ?? goal.getTargetDate();

/** Whole months the goal finished before its target date (0 when it finished on the date). */
export const monthsAhead = (goal: FinancialGoal) =>
  Math.max(0, dayjs(goal.getTargetDate()).diff(dayjs(goalDoneDate(goal)), 'month'));

const projectionFor = (goal: FinancialGoal, allocations: InvestmentAllocationsType, contributions: GoalContribution[]) =>
  buildGoalProjection(goal, calculateInvestmentSuggestionsForGoal(goal, allocations), contributions);

/**
 * One-time goals whose own SIPs have already grown to their target before the target date, with
 * the month that happened and the value then. Reopened goals are left alone.
 */
export function findNewlyReachedGoals(
  goals: FinancialGoal[],
  allocations: InvestmentAllocationsType,
  fundingToday: Record<string, GoalFunding>,
  today: string,
): { goal: FinancialGoal; at: string; value: number }[] {
  return goals.flatMap((goal) => {
    if (goal.goalType !== GoalType.ONE_TIME || goal.completion || goal.reopened) return [];
    if (!isGoalActive(goal, today)) return [];
    const target = goal.getInflationAdjustedTargetAmount();
    const funding = fundingToday[goal.id];
    if (!funding || target <= 0 || funding.fundedValue < target) return [];
    const reached = projectionFor(goal, allocations, funding.contributions).points.find(
      (p) => p.projected >= target && !dayjs(p.date).isAfter(dayjs(today), 'day'),
    );
    return [
      {
        goal,
        at: dayjs(reached?.date ?? today).format('YYYY-MM-DD'),
        value: reached?.projected ?? funding.fundedValue,
      },
    ];
  });
}

export type CompletionSummary = {
  doneAt: string;
  target: number;
  finalValue: number;
  contributed: number;
  returns: number;
  monthsInvested: number;
  monthsAhead: number;
  /** finalValue − target: positive means more than planned. */
  surplus: number;
  reachedTarget: boolean;
  /** Monthly SIP share that counted towards the goal while it was running. */
  monthlySip: number;
  points: { date: Date; value: number; contributed: number }[];
  milestones: { fraction: number; date: string | null; value: number }[];
};

/**
 * What a finished goal achieved, rebuilt from the SIP split as it stood on the day it finished.
 */
export function buildCompletionSummary(
  goal: FinancialGoal,
  goals: FinancialGoal[],
  allocations: InvestmentAllocationsType,
  sips: SIPEntry[],
): CompletionSummary {
  const doneAt = goalDoneDate(goal);
  const funding = buildGoalFunding(goals, allocations, sips, doneAt)[goal.id];
  const contributions = funding?.contributions ?? [];
  const target = goal.getInflationAdjustedTargetAmount();
  const end = dayjs(doneAt);

  const points = projectionFor(goal, allocations, contributions)
    .points.filter((p) => !dayjs(p.date).isAfter(end, 'month'))
    .map((p) => {
      const at = dayjs(p.date);
      const contributed = contributions.reduce(
        (sum, c) =>
          sum + c.monthly * Math.max(0, at.startOf('month').diff(dayjs(c.from).startOf('month'), 'month')),
        0,
      );
      return { date: p.date, value: p.projected, contributed: Math.round(contributed) };
    });

  const last = points[points.length - 1];
  const finalValue = goal.completion?.value ?? last?.value ?? 0;
  const contributed = last?.contributed ?? 0;

  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) => {
    const hit = points.find((p) => p.value >= target * fraction);
    return {
      fraction,
      date: hit ? dayjs(hit.date).format('YYYY-MM-DD') : null,
      value: hit ? hit.value : 0,
    };
  });

  return {
    doneAt,
    target,
    finalValue,
    contributed,
    returns: Math.round(finalValue - contributed),
    monthsInvested: Math.max(0, end.diff(dayjs(goal.getInvestmentStartDate()), 'month')),
    monthsAhead: monthsAhead(goal),
    surplus: Math.round(finalValue - target),
    reachedTarget: finalValue >= target * 0.995,
    monthlySip: Math.round(contributions.reduce((sum, c) => sum + c.monthly, 0)),
    points,
    milestones,
  };
}

export type RedirectSummary = {
  /** The finished goal's monthly SIP share just before it finished. */
  freed: number;
  recipients: { goal: FinancialGoal; extraMonthly: number; coveragePercent: number }[];
  /** Part of `freed` no other goal's plan needs. */
  unassigned: number;
};

/**
 * Where a finished goal's SIP share goes now: compares today's split with the split if the goal
 * were still running.
 */
export function buildRedirect(
  goal: FinancialGoal,
  goals: FinancialGoal[],
  allocations: InvestmentAllocationsType,
  sips: SIPEntry[],
  today: string,
): RedirectSummary {
  const stillRunning = Object.assign(Object.create(Object.getPrototypeOf(goal)), goal) as FinancialGoal;
  delete stillRunning.completion;
  const withoutCompletion = goals.map((g) => (g.id === goal.id ? stillRunning : g));

  const before = buildGoalFunding(withoutCompletion, allocations, sips, today);
  const now = buildGoalFunding(goals, allocations, sips, today);
  const freed = before[goal.id]?.investingMonthly ?? 0;

  const recipients = goals
    .filter((g) => g.id !== goal.id)
    .map((g) => {
      const extraMonthly = (now[g.id]?.investingMonthly ?? 0) - (before[g.id]?.investingMonthly ?? 0);
      const required = now[g.id]?.requiredMonthly ?? 0;
      return {
        goal: g,
        extraMonthly,
        coveragePercent: required > 0 ? Math.min(100, Math.round((extraMonthly / required) * 100)) : 0,
      };
    })
    .filter((r) => r.extraMonthly > 0)
    .sort((a, b) => b.extraMonthly - a.extraMonthly);

  return {
    freed,
    recipients,
    unassigned: Math.max(0, freed - recipients.reduce((sum, r) => sum + r.extraMonthly, 0)),
  };
}
