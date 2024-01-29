import { TermType } from '../types/enums';
import { InvestmentAllocation } from './InvestmentOptions';
import { FinancialGoal } from './FinancialGoals';

export type FinancialGoalSumary = Array<{
  termType: TermType;
  numberOfGoals: number;
}>;
export class PlannerData {
  financialGoals: FinancialGoal[] = [];
  assets: InvestmentAllocation = {
    longTermGoals: {},
    midTermGoals: {},
    shortTermGoals: {},
  };

  constructor(
    financialGoals: FinancialGoal[] = [],
    assets: InvestmentAllocation = {
      longTermGoals: {},
      midTermGoals: {},
      shortTermGoals: {},
    },
  ) {
    this.financialGoals = financialGoals;
    this.assets = assets;
  }

  getFinancialGoalSummary(): FinancialGoalSumary {
    return Object.values(TermType).map((termType) => {
      return {
        termType,
        numberOfGoals: this.financialGoals.filter(
          (goal) => goal.getTermType() === termType,
        ).length,
      };
    });
  }
}
