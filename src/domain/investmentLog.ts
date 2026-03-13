import { SIPEntry, SIPComparison } from '../types/investmentLog';
import { InvestmentSuggestion } from '../types/planner';

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
