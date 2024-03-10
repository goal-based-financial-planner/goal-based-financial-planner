import useCalculateInvestment from './useCalculateInvestment';
import { TermType } from '../types/enums';
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocation } from '../domain/InvestmentOptions';

describe('Test useCalculateInvestment', () => {
  const getGoal = (result: {
    goalName: string;
    assetBreakdown: { assetId: string; investmentValue: number }[]
  }[], goalName: string) => {
    return result.filter(e => e.goalName === goalName)[0];
  };

  const getAssetType = (goal: {
    goalName: string;
    assetBreakdown: { assetId: string; investmentValue: number }[]
  }, assetType: string) => {
    return goal.assetBreakdown.filter(b => b.assetId === assetType)[0];
  };

  const assertInvestmentValue = (result: {
    goalName: string;
    assetBreakdown: { assetId: string; investmentValue: number }[]
  }[], goalName: string, assetType: string, expectedValue: number) => {
    const goal = getGoal(result, goalName);
    const asset = getAssetType(goal, assetType);
    expect(Math.floor(asset.investmentValue)).toEqual(expectedValue);
  };

  it('should calculate investment breakdown given planner data with single goal', () => {
    // Arrange

    const financialGoals: FinancialGoal[] = [new FinancialGoal('goal1', 2024, 2030, 100000)];
    const assets: InvestmentAllocation = {
      [TermType.LONG_TERM]: { 'assetType_1': 100 }, [TermType.MEDIUM_TERM]: {}, [TermType.SHORT_TERM]:
        {},
    };
    const plannerData: PlannerData = new PlannerData(financialGoals, assets);

    // Act
    const { calculateInvestment } = useCalculateInvestment();
    const result = calculateInvestment(plannerData);

    // Assert
    assertInvestmentValue(result, 'goal1', 'assetType_1', 945);
  });

  it('should calcualte investment breakdown given planner data with multiple goals', () => {
    // Arrange
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 100000),
      new FinancialGoal('goal2', 2024, 2026, 100000),
    ];
    const assets: InvestmentAllocation = {
      [TermType.LONG_TERM]: { 'assetType_1': 100 }, [TermType.MEDIUM_TERM]: {}, [TermType.SHORT_TERM]:
        { 'assetType_3': 100 },
    };
    const plannerData: PlannerData = new PlannerData(financialGoals, assets);

    // Act
    const { calculateInvestment } = useCalculateInvestment();
    const result = calculateInvestment(plannerData);


    // Assert
    assertInvestmentValue(result, 'goal1', 'assetType_1', 945);
    assertInvestmentValue(result, 'goal2', 'assetType_3', 3912);

  });

  it('should calculate investment breakdown given planner data with multiple goals and multiple assets', () => {
    // Arrange
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 1000000),
      new FinancialGoal('goal2', 2024, 2028, 100000),
      new FinancialGoal('goal3', 2024, 2026, 100000),
    ];
    const assets: InvestmentAllocation = {
      [TermType.LONG_TERM]: { 'assetType_1': 80, 'assetType_2': 20 },
      [TermType.MEDIUM_TERM]: { 'assetType_2': 50, 'assetType_3': 50 },
      [TermType.SHORT_TERM]:
        { 'assetType_3': 100 },
    };
    const plannerData: PlannerData = new PlannerData(financialGoals, assets);

    // Act
    const { calculateInvestment } = useCalculateInvestment();
    const result = calculateInvestment(plannerData);

    // Assert
    assertInvestmentValue(result, 'goal1', 'assetType_1', 7663);
    assertInvestmentValue(result, 'goal1', 'assetType_2', 1915);
    assertInvestmentValue(result, 'goal2', 'assetType_2', 880);
    assertInvestmentValue(result, 'goal2', 'assetType_3', 880);
    assertInvestmentValue(result, 'goal3', 'assetType_3', 3912);


  });
});