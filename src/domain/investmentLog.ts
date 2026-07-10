import dayjs from 'dayjs';
import { SIPEntry, SIPComparison } from '../types/investmentLog';
import { InvestmentSuggestion } from '../types/planner';
import { FinancialGoal } from './FinancialGoals';
import { GoalType } from '../types/enums';

export function totalMonthlySIP(sips: SIPEntry[]): number {
  return sips.reduce((sum, s) => sum + s.monthlyAmount, 0);
}

export function buildSIPComparison(
  sips: SIPEntry[],
  suggestions: InvestmentSuggestion[],
): SIPComparison[] {
  const result: SIPComparison[] = suggestions.map((suggestion) => {
    const matchingSIPs = sips.filter((s) => s.type === suggestion.investmentName);
    const actualAmount = matchingSIPs.reduce((sum, s) => sum + s.monthlyAmount, 0);
    return {
      type: suggestion.investmentName,
      suggestedAmount: suggestion.amount,
      actualAmount,
      difference: actualAmount - suggestion.amount,
      sips: matchingSIPs,
    };
  });

  // Include SIP types not covered by any suggestion (shown with suggestedAmount: 0)
  const suggestedTypes = new Set(suggestions.map((s) => s.investmentName));
  const seen = new Set<string>();
  const customTypes = sips.map((s) => s.type).filter((t) => {
    if (suggestedTypes.has(t) || seen.has(t)) return false;
    seen.add(t);
    return true;
  });
  for (const type of customTypes) {
    const matchingSIPs = sips.filter((s) => s.type === type);
    const actualAmount = matchingSIPs.reduce((sum, s) => sum + s.monthlyAmount, 0);
    result.push({
      type,
      suggestedAmount: 0,
      actualAmount,
      difference: actualAmount,
      sips: matchingSIPs,
    });
  }

  return result;
}

export type GrowthDataPoint = {
  year: number;
  expectedValue: number;
  actualValue: number;
};

const DEFAULT_RETURN_PCT = 10;

function futureValue(monthlyAmount: number, annualReturnPct: number, months: number): number {
  if (months === 0) return 0;
  const r = annualReturnPct / 100 / 12;
  if (r === 0) return monthlyAmount * months;
  return monthlyAmount * (Math.pow(1 + r, months) - 1) / r;
}

export type PortfolioPoint = { date: Date; value: number };
export type GoalMarker = { date: Date; goalName: string; amount: number; portfolioValueAfter: number };
export type PortfolioWithdrawalSeries = { points: PortfolioPoint[]; suggestedPoints: PortfolioPoint[]; goalMarkers: GoalMarker[] };
export type GoalSuggestion = { goalStartDate: string; goalTargetDate: string; suggestions: InvestmentSuggestion[] };

export function buildPortfolioWithdrawalSeries(
  sips: SIPEntry[],
  goals: FinancialGoal[],
  allSuggestions: InvestmentSuggestion[],
  goalWiseSuggestions?: GoalSuggestion[],
): PortfolioWithdrawalSeries {
  const oneTimeGoals = goals
    .filter((g) => g.goalType === GoalType.ONE_TIME)
    .sort((a, b) => dayjs(a.getTargetDate()).diff(dayjs(b.getTargetDate())));

  if (sips.length === 0 || oneTimeGoals.length === 0) {
    return { points: [], suggestedPoints: [], goalMarkers: [] };
  }

  const returnRateMap: Record<string, number> = {};
  for (const s of allSuggestions) {
    returnRateMap[s.investmentName] = s.expectedReturnPercentage;
  }

  const sipDates = sips
    .filter((s) => s.startDate && dayjs(s.startDate).isValid())
    .map((s) => dayjs(s.startDate!));
  const chartStart = (
    sipDates.length > 0
      ? sipDates.reduce((min, d) => (d.isBefore(min) ? d : min))
      : dayjs()
  ).startOf('month');

  const chartEnd = dayjs(oneTimeGoals[oneTimeGoals.length - 1].getTargetDate()).startOf('month').add(12, 'month');
  const totalMonths = Math.max(0, chartEnd.diff(chartStart, 'month'));
  if (totalMonths === 0) return { points: [], suggestedPoints: [], goalMarkers: [] };

  type GoalEvent = { month: number; amount: number; name: string; date: Date };
  const goalEvents: GoalEvent[] = oneTimeGoals
    .map((g) => ({
      month: dayjs(g.getTargetDate()).startOf('month').diff(chartStart, 'month'),
      amount: g.getInflationAdjustedTargetAmount(),
      name: g.getGoalName(),
      date: dayjs(g.getTargetDate()).startOf('month').toDate(),
    }))
    .filter((g) => g.month >= 0);

  const useStopMode = goalWiseSuggestions && goalWiseSuggestions.length > 0;
  const goalEventMap = new Map(goalEvents.map((g) => [g.month, g.amount]));

  // Each SimSIP is one contribution stream with its own monthly rate, start offset, and stop month.
  // Splitting a SIP into per-goal sub-streams (in stop mode) lets us stop each fraction independently.
  type SimSIP = { monthlyAmount: number; r: number; startOffset: number; stopMonth: number; value: number };

  function buildActualSimSIPs(): SimSIP[] {
    const result: SimSIP[] = [];
    for (const sip of sips) {
      const sipStart = (
        sip.startDate && dayjs(sip.startDate).isValid() ? dayjs(sip.startDate) : chartStart
      ).startOf('month');
      const startOffset = Math.max(0, sipStart.diff(chartStart, 'month'));
      const returnPct = sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
      const r = returnPct / 100 / 12;

      if (!useStopMode) {
        result.push({ monthlyAmount: sip.monthlyAmount, r, startOffset, stopMonth: Infinity, value: 0 });
        continue;
      }

      const goalAllocations = (goalWiseSuggestions ?? []).flatMap(({ goalTargetDate, suggestions }) => {
        const match = suggestions.find((s) => s.investmentName === sip.type);
        return match
          ? [{ goalMonth: Math.max(0, dayjs(goalTargetDate).startOf('month').diff(chartStart, 'month')), amount: match.amount }]
          : [];
      });
      const totalSuggested = goalAllocations.reduce((s, a) => s + a.amount, 0);

      if (goalAllocations.length === 0 || totalSuggested === 0) {
        result.push({ monthlyAmount: sip.monthlyAmount, r, startOffset, stopMonth: Infinity, value: 0 });
      } else {
        for (const { goalMonth, amount } of goalAllocations) {
          result.push({
            monthlyAmount: sip.monthlyAmount * (amount / totalSuggested),
            r, startOffset, stopMonth: goalMonth, value: 0,
          });
        }
      }
    }
    return result;
  }

  function buildSuggestedSimSIPs(): SimSIP[] {
    if (allSuggestions.length === 0 && !useStopMode) return [];

    if (useStopMode) {
      // Goal-mapped types: one SimSIP per (goal × investment type).
      // startOffset comes from the goal's own startDate so that "If on plan" reflects the
      // planned investment horizon. Actual SimSIPs may start earlier — that gap is the
      // visible reward for starting early.
      const result: SimSIP[] = (goalWiseSuggestions ?? []).flatMap(({ goalStartDate, goalTargetDate, suggestions }) => {
        const goalStartOffset = Math.max(0, dayjs(goalStartDate).startOf('month').diff(chartStart, 'month'));
        const goalMonth = Math.max(0, dayjs(goalTargetDate).startOf('month').diff(chartStart, 'month'));
        return suggestions.map((s) => ({
          monthlyAmount: s.amount,
          r: (s.expectedReturnPercentage ?? DEFAULT_RETURN_PCT) / 100 / 12,
          startOffset: goalStartOffset,
          stopMonth: goalMonth,
          value: 0,
        }));
      });

      // SIP types with no goal mapping keep running at scaled amounts (same as keep-investing).
      const goalMappedTypes = new Set(
        (goalWiseSuggestions ?? []).flatMap(({ suggestions }) => suggestions.map((s) => s.investmentName)),
      );
      const actualTotalByType: Record<string, number> = {};
      for (const sip of sips) actualTotalByType[sip.type] = (actualTotalByType[sip.type] ?? 0) + sip.monthlyAmount;
      const suggestedAmountMap: Record<string, number> = {};
      for (const s of allSuggestions) suggestedAmountMap[s.investmentName] = (suggestedAmountMap[s.investmentName] ?? 0) + s.amount;

      for (const sip of sips) {
        if (goalMappedTypes.has(sip.type)) continue;
        const sipStart = (sip.startDate && dayjs(sip.startDate).isValid() ? dayjs(sip.startDate) : chartStart).startOf('month');
        const startOffset = Math.max(0, sipStart.diff(chartStart, 'month'));
        const returnPct = sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
        const totalActual = actualTotalByType[sip.type] ?? sip.monthlyAmount;
        const suggestedTotal = suggestedAmountMap[sip.type] ?? sip.monthlyAmount;
        result.push({ monthlyAmount: (sip.monthlyAmount / totalActual) * suggestedTotal, r: returnPct / 100 / 12, startOffset, stopMonth: Infinity, value: 0 });
      }
      return result;
    }

    // Keep-investing mode: scale each actual SIP by suggested/actual ratio.
    // Both lines use actual SIP start dates — the only variable is the monthly amount.
    const actualTotalByType: Record<string, number> = {};
    for (const sip of sips) actualTotalByType[sip.type] = (actualTotalByType[sip.type] ?? 0) + sip.monthlyAmount;
    const suggestedAmountMap: Record<string, number> = {};
    for (const s of allSuggestions) suggestedAmountMap[s.investmentName] = (suggestedAmountMap[s.investmentName] ?? 0) + s.amount;

    return sips.map((sip) => {
      const sipStart = (sip.startDate && dayjs(sip.startDate).isValid() ? dayjs(sip.startDate) : chartStart).startOf('month');
      const startOffset = Math.max(0, sipStart.diff(chartStart, 'month'));
      const returnPct = sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
      const totalActual = actualTotalByType[sip.type] ?? sip.monthlyAmount;
      const suggestedTotal = suggestedAmountMap[sip.type] ?? sip.monthlyAmount;
      const scaledAmount = totalActual > 0 ? (sip.monthlyAmount / totalActual) * suggestedTotal : suggestedTotal;
      return { monthlyAmount: scaledAmount, r: returnPct / 100 / 12, startOffset, stopMonth: Infinity, value: 0 };
    });
  }

  // Month-by-month simulation: compound existing value, add contribution, then withdraw.
  // Withdrawals reduce each sub-SIP proportionally so the remaining corpus compounds on the
  // correct post-withdrawal base (avoids the "withdrawn amount keeps compounding" bug).
  function simulate(simSIPs: SimSIP[]): PortfolioPoint[] {
    const result: PortfolioPoint[] = [];
    for (let m = 0; m <= totalMonths; m++) {
      for (const sub of simSIPs) {
        if (m > sub.startOffset && m <= sub.stopMonth) sub.value += sub.monthlyAmount;
        sub.value *= (1 + sub.r);
      }
      let total = simSIPs.reduce((s, sub) => s + sub.value, 0);
      const withdrawal = goalEventMap.get(m) ?? 0;
      if (withdrawal > 0) {
        if (total > 0) {
          // Reduce each sub-SIP proportionally so future compounding uses the post-withdrawal base.
          // Cap fraction at 1 so sub-SIP values don't go negative when portfolio < withdrawal.
          const fraction = Math.min(1, withdrawal / total);
          for (const sub of simSIPs) sub.value *= (1 - fraction);
        }
        total -= withdrawal; // allow negative — used to surface the shortfall warning in the chart
      }
      result.push({ date: chartStart.add(m, 'month').toDate(), value: Math.round(total) });
    }
    return result;
  }

  const points = simulate(buildActualSimSIPs());

  const goalMarkers: GoalMarker[] = goalEvents.map((g) => ({
    date: g.date,
    goalName: g.name,
    amount: Math.round(g.amount),
    portfolioValueAfter: points[Math.min(g.month, totalMonths)]?.value ?? 0,
  }));

  const suggestedSimSIPs = buildSuggestedSimSIPs();
  const suggestedPoints = suggestedSimSIPs.length > 0 ? simulate(suggestedSimSIPs) : [];

  return { points, suggestedPoints, goalMarkers };
}

export function buildGrowthProjection(
  sips: SIPEntry[],
  suggestions: InvestmentSuggestion[],
  years = 10,
): GrowthDataPoint[] {
  const returnRateMap: Record<string, number> = {};
  for (const s of suggestions) {
    returnRateMap[s.investmentName] = s.expectedReturnPercentage;
  }

  const result: GrowthDataPoint[] = [];
  for (let year = 0; year <= years; year++) {
    const months = year * 12;

    const expectedValue = suggestions.reduce(
      (sum, s) => sum + futureValue(s.amount, s.expectedReturnPercentage, months),
      0,
    );

    const actualValue = sips.reduce((sum, sip) => {
      const returnPct = sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
      return sum + futureValue(sip.monthlyAmount, returnPct, months);
    }, 0);

    result.push({
      year,
      expectedValue: Math.round(expectedValue),
      actualValue: Math.round(actualValue),
    });
  }
  return result;
}
