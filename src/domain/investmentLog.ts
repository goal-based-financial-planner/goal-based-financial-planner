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
