import { TermType } from '../types/enums';
import { InvestmentSuggestion } from '../types/planner';

export type AllocationSlice = {
  investmentName: string;
  amount: number;
  /** Share of the term's total, rounded to a whole percent. */
  percentage: number;
};

export type TermAllocation = {
  termType: TermType;
  total: number;
  slices: AllocationSlice[];
};

type TermBreakdown = {
  termType: TermType;
  investmentBreakdown: { investmentSuggestions: InvestmentSuggestion[] }[];
};

const toSlices = (amounts: Record<string, number>): { total: number; slices: AllocationSlice[] } => {
  const total = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  const slices = Object.entries(amounts)
    .filter(([, amount]) => amount > 0)
    .map(([investmentName, amount]) => ({
      investmentName,
      amount: Math.round(amount),
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
  return { total: Math.round(total), slices };
};

/** Suggested monthly amount per instrument, summed across every goal in each term. */
export function buildIdealTermAllocations(breakdown: TermBreakdown[]): TermAllocation[] {
  return breakdown.map(({ termType, investmentBreakdown }) => {
    const amounts: Record<string, number> = {};
    investmentBreakdown.forEach(({ investmentSuggestions }) =>
      investmentSuggestions.forEach(({ investmentName, amount }) => {
        amounts[investmentName] = (amounts[investmentName] ?? 0) + amount;
      }),
    );
    return { termType, ...toSlices(amounts) };
  });
}
