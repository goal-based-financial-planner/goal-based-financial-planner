import { Assets } from './AssetData';
import { FinancialGoal } from './FinancialGoals';

export class PlannerData {
  financialGoals: FinancialGoal[] = [];
  assets: Assets = { longTermGoals: [], midTermGoals: [], shortTermGoals: [] };
}
