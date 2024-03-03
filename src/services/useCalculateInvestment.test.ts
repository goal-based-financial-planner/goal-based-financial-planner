import useCalculateInvestment from './useCalculateInvestment';
import { TermType } from '../types/enums';
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocation } from '../domain/InvestmentOptions';

describe('Test useCalculateInvestment', () => {
  it('should calculate investment breakdown given planner data', () => {
    // Arrange

    const financialGoals: FinancialGoal[] = [new FinancialGoal('goal1', 2024, 2030, 100000)];
    const assets: InvestmentAllocation = {
      [TermType.LONG_TERM]: { 'assetType_1': 100 }, [TermType.MEDIUM_TERM]: {}, [TermType.SHORT_TERM]:
        {},
    };
    const plannerData: PlannerData = new PlannerData(financialGoals, assets);

    // Act
    const result = useCalculateInvestment(plannerData);

    // Assert
    expect(result).toEqual([{ 'goal1': [{ 'assetType_1': 945 }] }]);
  });
});