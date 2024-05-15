import { TermType } from '../types/enums';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { FinancialGoal } from './FinancialGoals';

export type FinancialGoalSummary = Array<{
  termType: TermType;
  numberOfGoals: number;
}>;

export class PlannerData {
  financialGoals: FinancialGoal[];
  investmentAllocations: InvestmentAllocationsType;

  constructor(
    financialGoals: FinancialGoal[] = [],
    assets: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [],
      [TermType.MEDIUM_TERM]: [],
      [TermType.SHORT_TERM]: [],
    },
  ) {
    this.financialGoals = financialGoals;
    this.investmentAllocations = assets;
  }

  getFinancialGoalSummary(): FinancialGoalSummary {
    return Object.values(TermType).map((termType) => {
      return {
        termType,
        numberOfGoals: this.financialGoals.filter(
          (goal) => goal.getTermType() === termType,
        ).length,
      };
    });
  }

  getGoalSummaryAsText(): string {
    const goalSummary = this.getFinancialGoalSummary()
      .filter((e) => e.numberOfGoals > 0)
      .map((e) => `${e.numberOfGoals} ${e.termType}`);

    const summaryText = goalSummary.join(', ');
    const lastIndex = summaryText.lastIndexOf(',');
    if (lastIndex !== -1) {
      return (
        summaryText.substring(0, lastIndex) +
        ' and ' +
        summaryText.substring(lastIndex + 1)
      );
    }

    return summaryText;
  }
}
