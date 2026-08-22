import dayjs, { Dayjs } from 'dayjs';
import { FinancialGoal } from './FinancialGoals';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { SIPEntry } from '../types/investmentLog';
import { DEFAULT_INFLATION_RATE } from './constants';
import { GoalType } from '../types/enums';

export type GoalAttainmentStatus = 'on-track' | 'at-risk';

export type WhatIfProjectionPoint = {
  date: string; // YYYY-MM-DD
  value: number;
};

/** One goal becoming due: what it costs, recalculated under the live inflation adjustment. */
export type WhatIfGoalMarker = {
  goalId: string;
  goalName: string;
  date: string; // YYYY-MM-DD, the goal's target date
  amount: number;
  /** What's left in the invested corpus right after this goal's withdrawal. Negative means this
   *  goal (or an earlier one sharing its month) couldn't be fully funded. */
  portfolioValueAfter: number;
};

/**
 * The live, ephemeral set of assumption overrides driving the What If tab. Not persisted —
 * resets whenever the tab is reopened.
 */
export type Adjustments = {
  /** Per-goal inflation rate override (percent). Only goals the user has touched are present. */
  goalInflationRates: Record<string, number>;
  /** Per-investment-type expected return override (percent). Applies wherever that type appears. */
  investmentReturnRates: Record<string, number>;
};

/** The "no overrides" adjustments — i.e. the plan's own current assumptions. Shared so every
 *  caller that wants the unmodified baseline (the What If tab, the goal risk dashboard) uses the
 *  exact same empty object rather than each redeclaring it locally. */
export const EMPTY_ADJUSTMENTS: Adjustments = { goalInflationRates: {}, investmentReturnRates: {} };

export type PortfolioWhatIfResult = {
  totalTargetAmount: number;
  totalInvestedValue: number;
  totalShortfall: number;
  status: GoalAttainmentStatus;
  /** What you need: a cumulative staircase that jumps up by a goal's (recalculated) target
   *  amount the moment that goal comes due — never before. */
  requirementPoints: WhatIfProjectionPoint[];
  /** How you're actually investing: your logged SIPs, compounding forward from their own start
   *  dates under the live return-rate adjustment, withdrawing each goal's (recalculated) target
   *  amount from the corpus the moment that goal comes due. */
  investingPoints: WhatIfProjectionPoint[];
  /** One marker per one-time goal, for labeling the requirement staircase's steps. */
  markers: WhatIfGoalMarker[];
};

/** One instrument's share of the extra monthly investment needed to close the gap. */
export type WhatIfTopUp = {
  investmentName: string;
  additionalMonthlyAmount: number;
};

export type WhatIfTopUpResult = {
  /** Extra monthly amount needed per instrument to fully fund every goal under the live
   *  adjustments, weighted toward whichever instrument(s)' return rate you've lowered — or, if
   *  the shortfall isn't caused by any return-rate change, split across your current SIP mix (or
   *  evenly across your allocation mix, if you haven't logged any SIPs). Empty when on track. */
  topUps: WhatIfTopUp[];
  /** True when increasing SIPs alone can't close the gap — e.g. a goal is due too soon for any
   *  additional future contribution to compound before it's withdrawn. */
  unresolvable: boolean;
};

const DEFAULT_RETURN_PCT = 10;

function buildReturnRateMap(investmentAllocations: InvestmentAllocationsType): Record<string, number> {
  const map: Record<string, number> = {};
  Object.values(investmentAllocations).forEach((allocations) => {
    allocations.forEach((allocation) => {
      if (!(allocation.investmentName in map)) {
        map[allocation.investmentName] = allocation.expectedReturnPercentage;
      }
    });
  });
  return map;
}

type SimSipParams = {
  type: string;
  monthlyAmount: number;
  monthlyRate: number;
  /** This same SIP's rate with any live return-rate override for its type removed — used to
   *  isolate how much a single instrument's adjustment is responsible for a shortfall. */
  unadjustedMonthlyRate: number;
  startOffset: number;
};

type PreparedSimulation = {
  rawMarkers: { goalId: string; goalName: string; date: string; amount: number }[];
  chartStart: Dayjs;
  totalMonths: number;
  withdrawalByMonth: Map<number, number>;
  monthOf: (date: string) => number;
  baseSimSipParams: SimSipParams[];
  returnRateMap: Record<string, number>;
  typeRate: (type: string, adjustments: Adjustments) => number;
};

/**
 * Shared setup for both the full What If projection and the top-up search below: the calendar
 * grid, each goal's (recalculated) requirement, when it's withdrawn, and the base SIP
 * contribution schedule — all under the live adjustments.
 */
function prepareSimulation(
  oneTimeGoals: FinancialGoal[],
  sips: SIPEntry[],
  investmentAllocations: InvestmentAllocationsType,
  adjustments: Adjustments,
): PreparedSimulation {
  const rawMarkers = oneTimeGoals.map((goal) => {
    const effectiveInflationRate =
      adjustments.goalInflationRates[goal.id] ?? goal.inflationRate ?? DEFAULT_INFLATION_RATE;
    return {
      goalId: goal.id,
      goalName: goal.getGoalName(),
      date: goal.getTargetDate(),
      amount: goal.getInflationAdjustedTargetAmount(effectiveInflationRate),
    };
  });

  const returnRateMap = buildReturnRateMap(investmentAllocations);
  const typeRate = (type: string, adj: Adjustments): number =>
    adj.investmentReturnRates[type] ?? returnRateMap[type] ?? DEFAULT_RETURN_PCT;
  const effectiveSipRate = (sip: SIPEntry): number =>
    adjustments.investmentReturnRates[sip.type] ?? sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
  const unadjustedSipRate = (sip: SIPEntry): number =>
    sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;

  const goalStartDates = oneTimeGoals.map((g) => dayjs(g.getInvestmentStartDate()));
  const sipStartDates = sips
    .filter((s) => s.startDate && dayjs(s.startDate).isValid())
    .map((s) => dayjs(s.startDate!));
  const chartStart = [...goalStartDates, ...sipStartDates].reduce((min, d) => (d.isBefore(min) ? d : min));
  const lastGoalDate = oneTimeGoals.map((g) => dayjs(g.getTargetDate())).reduce((max, d) => (d.isAfter(max) ? d : max));
  // A little runway past the last goal so its withdrawal dip is visible instead of landing on
  // the chart's last plotted point.
  const chartEnd = lastGoalDate.add(6, 'month');
  const totalMonths = Math.max(0, chartEnd.diff(chartStart, 'month'));

  // Each SIP compounds on its own (annuity-due: contribute, then grow) so it can be withdrawn
  // from independently once a goal it's funding comes due.
  const baseSimSipParams: SimSipParams[] = sips.map((sip) => ({
    type: sip.type,
    monthlyAmount: sip.monthlyAmount,
    monthlyRate: effectiveSipRate(sip) / 100 / 12,
    unadjustedMonthlyRate: unadjustedSipRate(sip) / 100 / 12,
    startOffset: Math.max(0, (sip.startDate && dayjs(sip.startDate).isValid() ? dayjs(sip.startDate) : chartStart).diff(chartStart, 'month')),
  }));

  const monthOf = (date: string): number => Math.max(0, dayjs(date).diff(chartStart, 'month'));

  const withdrawalByMonth = new Map<number, number>();
  rawMarkers.forEach((marker) => {
    const month = monthOf(marker.date);
    withdrawalByMonth.set(month, (withdrawalByMonth.get(month) ?? 0) + marker.amount);
  });

  return { rawMarkers, chartStart, totalMonths, withdrawalByMonth, monthOf, baseSimSipParams, returnRateMap, typeRate };
}

/** Runs the month-by-month simulation for a given set of contribution schedules, tracking the
 *  full point series (used for the chart) and the lowest the invested corpus ever dips to. */
function runSimulation(
  simSipParams: SimSipParams[],
  chartStart: Dayjs,
  totalMonths: number,
  withdrawalByMonth: Map<number, number>,
): { requirementPoints: WhatIfProjectionPoint[]; investingPoints: WhatIfProjectionPoint[]; minInvestedValue: number } {
  const simSips = simSipParams.map((p) => ({ ...p, value: 0 }));
  const requirementPoints: WhatIfProjectionPoint[] = [];
  const investingPoints: WhatIfProjectionPoint[] = [];
  let requirement = 0;
  let minInvestedValue = 0;

  for (let m = 0; m <= totalMonths; m++) {
    const date = chartStart.add(m, 'month').format('YYYY-MM-DD');

    for (const sub of simSips) {
      if (m > sub.startOffset) sub.value += sub.monthlyAmount;
      sub.value *= 1 + sub.monthlyRate;
    }
    let invested = simSips.reduce((sum, sub) => sum + sub.value, 0);

    // A goal's target enters the requirement staircase the same month its money is withdrawn.
    const withdrawal = withdrawalByMonth.get(m) ?? 0;
    requirement += withdrawal;
    if (withdrawal > 0) {
      if (invested > 0) {
        // Reduce each sub-SIP proportionally so future compounding uses the post-withdrawal base.
        const fraction = Math.min(1, withdrawal / invested);
        for (const sub of simSips) sub.value *= 1 - fraction;
      }
      invested -= withdrawal; // allowed to go negative — surfaces as a shortfall dip
    }
    minInvestedValue = Math.min(minInvestedValue, invested);

    requirementPoints.push({ date, value: Math.round(requirement) });
    investingPoints.push({ date, value: Math.round(invested) });
  }

  return { requirementPoints, investingPoints, minInvestedValue };
}

/**
 * Aggregates one-time goals and logged SIPs into two comparable series over a shared calendar:
 * what's required (staircase, driven by inflation adjustments) and what you're actually
 * investing (compounding SIPs, driven by return-rate adjustments).
 */
export function buildPortfolioWhatIfResult(
  goals: FinancialGoal[],
  sips: SIPEntry[],
  investmentAllocations: InvestmentAllocationsType,
  adjustments: Adjustments,
): PortfolioWhatIfResult {
  const oneTimeGoals = goals.filter((g) => g.goalType === GoalType.ONE_TIME);

  if (oneTimeGoals.length === 0) {
    return {
      totalTargetAmount: 0,
      totalInvestedValue: 0,
      totalShortfall: 0,
      status: 'on-track',
      requirementPoints: [],
      investingPoints: [],
      markers: [],
    };
  }

  const { rawMarkers, chartStart, totalMonths, withdrawalByMonth, monthOf, baseSimSipParams } =
    prepareSimulation(oneTimeGoals, sips, investmentAllocations, adjustments);

  const { requirementPoints, investingPoints, minInvestedValue } =
    runSimulation(baseSimSipParams, chartStart, totalMonths, withdrawalByMonth);

  const markers: WhatIfGoalMarker[] = rawMarkers.map((marker) => ({
    ...marker,
    portfolioValueAfter: investingPoints[Math.min(monthOf(marker.date), investingPoints.length - 1)].value,
  }));

  const totalTargetAmount = Math.round(rawMarkers.reduce((sum, marker) => sum + marker.amount, 0));
  const totalInvestedValue = investingPoints.length > 0 ? investingPoints[investingPoints.length - 1].value : 0;
  const totalShortfall = Math.round(Math.max(0, -minInvestedValue));

  return {
    totalTargetAmount,
    totalInvestedValue,
    totalShortfall,
    status: totalShortfall === 0 ? 'on-track' : 'at-risk',
    requirementPoints,
    investingPoints,
    markers,
  };
}

const TOP_UP_ROUNDING = 100;
const TOP_UP_MAX_DOUBLINGS = 40;
const TOP_UP_BINARY_SEARCH_ITERATIONS = 40;

/**
 * Binary-searches for the smallest extra monthly investment that clears every shortfall under
 * the live adjustments, then splits it across instruments weighted toward whichever ones you've
 * actually dragged the return rate down for — the ones responsible for the shortfall widening —
 * rather than spreading it evenly across your whole mix. Falls back to your current SIP mix (or
 * an even split across your allocation mix, if you haven't logged any SIPs yet) when the
 * shortfall isn't attributable to any return-rate change at all (e.g. it's driven purely by an
 * inflation adjustment).
 *
 * The extra amount is modelled as a fresh contribution starting at the very first month of the
 * simulation window (not "starting today"), consistent with how the rest of the What If tab
 * treats every adjustment as if it had been true all along.
 */
export function calculateRequiredTopUp(
  goals: FinancialGoal[],
  sips: SIPEntry[],
  investmentAllocations: InvestmentAllocationsType,
  adjustments: Adjustments,
): WhatIfTopUpResult {
  const oneTimeGoals = goals.filter((g) => g.goalType === GoalType.ONE_TIME);
  if (oneTimeGoals.length === 0) {
    return { topUps: [], unresolvable: false };
  }

  const { chartStart, totalMonths, withdrawalByMonth, baseSimSipParams, returnRateMap, typeRate } =
    prepareSimulation(oneTimeGoals, sips, investmentAllocations, adjustments);

  const minInvestedValueFor = (extraParams: SimSipParams[]) =>
    runSimulation([...baseSimSipParams, ...extraParams], chartStart, totalMonths, withdrawalByMonth).minInvestedValue;

  const minInvestedValueFull = minInvestedValueFor([]);
  if (minInvestedValueFull >= 0) {
    return { topUps: [], unresolvable: false };
  }

  // Weight the top-up toward whichever instrument(s) actually widened the shortfall — the ones
  // whose return rate you've dragged down — rather than spreading it evenly across your whole
  // mix. An instrument's "damage" is how much the corpus's low point would recover if just that
  // one instrument's rate were reverted to its unadjusted value, with everything else unchanged.
  const damageByType: Record<string, number> = {};
  Object.keys(adjustments.investmentReturnRates).forEach((type) => {
    const revertedParams = baseSimSipParams.map((p) =>
      p.type === type ? { ...p, monthlyRate: p.unadjustedMonthlyRate } : p);
    const revertedMin = runSimulation(revertedParams, chartStart, totalMonths, withdrawalByMonth).minInvestedValue;
    damageByType[type] = Math.max(0, revertedMin - minInvestedValueFull);
  });
  const totalDamage = Object.values(damageByType).reduce((sum, d) => sum + d, 0);

  let weights: Record<string, number>;
  if (totalDamage > 0) {
    weights = Object.fromEntries(
      Object.entries(damageByType).filter(([, damage]) => damage > 0).map(([type, damage]) => [type, damage / totalDamage]),
    );
  } else {
    // No return-rate change is responsible for the shortfall (e.g. it's driven purely by an
    // inflation adjustment) — fall back to your natural mix: each instrument's current share of
    // your monthly SIP total, or an even split across your allocation mix if you haven't logged
    // any SIPs to scale from.
    const byType = new Map<string, number>();
    baseSimSipParams.forEach((p) => byType.set(p.type, (byType.get(p.type) ?? 0) + p.monthlyAmount));
    const totalBase = Array.from(byType.values()).reduce((sum, v) => sum + v, 0);

    if (totalBase > 0) {
      weights = Object.fromEntries(Array.from(byType.entries()).map(([type, amount]) => [type, amount / totalBase]));
    } else {
      const types = Object.keys(returnRateMap);
      if (types.length === 0) {
        return { topUps: [], unresolvable: true };
      }
      weights = Object.fromEntries(types.map((type) => [type, 1 / types.length]));
    }
  }

  const topUpParamsFor = (totalExtra: number): SimSipParams[] =>
    Object.entries(weights).map(([type, weight]) => {
      const rate = typeRate(type, adjustments) / 100 / 12;
      return { type, monthlyAmount: totalExtra * weight, monthlyRate: rate, unadjustedMonthlyRate: rate, startOffset: 0 };
    });

  // Grow the search ceiling until it's enough to clear the shortfall, bailing out if even a very
  // large top-up can't help — e.g. the shortfall is at month 0, before any new SIP could
  // contribute at all.
  let high = Math.max(1000, -minInvestedValueFull);
  let doublings = 0;
  while (minInvestedValueFor(topUpParamsFor(high)) < 0) {
    if (doublings >= TOP_UP_MAX_DOUBLINGS) {
      return { topUps: [], unresolvable: true };
    }
    high *= 2;
    doublings += 1;
  }

  let low = 0;
  for (let i = 0; i < TOP_UP_BINARY_SEARCH_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    if (minInvestedValueFor(topUpParamsFor(mid)) >= 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const requiredTotal = Math.ceil(high / TOP_UP_ROUNDING) * TOP_UP_ROUNDING;

  const topUps: WhatIfTopUp[] = Object.entries(weights)
    .map(([investmentName, weight]) => ({ investmentName, additionalMonthlyAmount: Math.round(requiredTotal * weight) }))
    .filter((topUp) => topUp.additionalMonthlyAmount > 0)
    .sort((a, b) => b.additionalMonthlyAmount - a.additionalMonthlyAmount);

  return { topUps, unresolvable: false };
}
