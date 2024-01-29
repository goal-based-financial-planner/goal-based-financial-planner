import { TermType } from '../types/enums';
import { Assets } from './AssetData';
import { FinancialGoal } from './FinancialGoals';

export type FinancialGoalSumary = Array<{
  termType: TermType;
  numberOfGoals: number;
}>;
export class PlannerData {
  financialGoals: FinancialGoal[] = [];
  assets: Assets = { longTermGoals: {}, midTermGoals: {}, shortTermGoals: {} };

  constructor(
    financialGoals: FinancialGoal[] = [],
    assets: Assets = {
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
