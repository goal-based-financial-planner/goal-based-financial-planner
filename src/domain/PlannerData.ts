import { Assets } from './AssetData';
import { FinancialGoal } from './FinancialGoals';

export type PlannerData = {
  financialGoals: FinancialGoal[];
  assets: Assets;
};
