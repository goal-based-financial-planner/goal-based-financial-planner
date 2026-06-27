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

export function buildPortfolioWithdrawalSeries(
  sips: SIPEntry[],
  goals: FinancialGoal[],
  allSuggestions: InvestmentSuggestion[],
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

  function grossAt(month: number): number {
    return sips.reduce((sum, sip) => {
      const sipStart = (
        sip.startDate && dayjs(sip.startDate).isValid()
          ? dayjs(sip.startDate)
          : chartStart
      ).startOf('month');
      const sipOffset = Math.max(0, sipStart.diff(chartStart, 'month'));
      const sipMonths = Math.max(0, month - sipOffset);
      const returnPct = sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
      return sum + futureValue(sip.monthlyAmount, returnPct, sipMonths);
    }, 0);
  }

  function cumulativeWithdrawals(month: number): number {
    return goalEvents
      .filter((g) => g.month <= month)
      .reduce((sum, g) => sum + g.amount, 0);
  }

  const points: PortfolioPoint[] = [];
  for (let m = 0; m <= totalMonths; m++) {
    const date = chartStart.add(m, 'month').toDate();
    const net = Math.round(grossAt(m) - cumulativeWithdrawals(m));
    points.push({ date, value: net });
  }

  const goalMarkers: GoalMarker[] = goalEvents.map((g) => ({
    date: g.date,
    goalName: g.name,
    amount: Math.round(g.amount),
    portfolioValueAfter: points[Math.min(g.month, totalMonths)]?.value ?? 0,
  }));

  const suggestedAmountMap: Record<string, number> = {};
  for (const s of allSuggestions) {
    suggestedAmountMap[s.investmentName] = (suggestedAmountMap[s.investmentName] ?? 0) + s.amount;
  }

  const actualTotalByType: Record<string, number> = {};
  for (const sip of sips) {
    actualTotalByType[sip.type] = (actualTotalByType[sip.type] ?? 0) + sip.monthlyAmount;
  }

  function grossSuggestedAt(month: number): number {
    return sips.reduce((sum, sip) => {
      const sipStart = (
        sip.startDate && dayjs(sip.startDate).isValid()
          ? dayjs(sip.startDate)
          : chartStart
      ).startOf('month');
      const sipOffset = Math.max(0, sipStart.diff(chartStart, 'month'));
      const sipMonths = Math.max(0, month - sipOffset);
      const returnPct = sip.expectedReturnPct ?? returnRateMap[sip.type] ?? DEFAULT_RETURN_PCT;
      const actualTotal = actualTotalByType[sip.type] ?? sip.monthlyAmount;
      const suggestedTotal = suggestedAmountMap[sip.type] ?? sip.monthlyAmount;
      const scaledAmount = actualTotal > 0
        ? (sip.monthlyAmount / actualTotal) * suggestedTotal
        : suggestedTotal;
      return sum + futureValue(scaledAmount, returnPct, sipMonths);
    }, 0);
  }

  const suggestedPoints: PortfolioPoint[] = allSuggestions.length > 0
    ? points.map((_, m) => ({
        date: points[m].date,
        value: Math.round(grossSuggestedAt(m) - cumulativeWithdrawals(m)),
      }))
    : [];

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
