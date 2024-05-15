import useInvestmentCalculator, {
  GoalWiseInvestmentSuggestions,
} from './useInvestmentCalculator';
import { TermType } from '../types/enums';
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocationsType } from '../domain/InvestmentOptions';

describe('Test useInvestmentCalculator', () => {
  const getGoal = (
    result: GoalWiseInvestmentSuggestions[],
    goalName: string,
  ) => {
    return result.filter((e) => e.goalName === goalName)[0];
  };

  const getAssetType = (
    goal: GoalWiseInvestmentSuggestions,
    assetType: string,
  ) => {
    return goal.investmentSuggestions.filter(
      (b) => b.investmentOptionId === assetType,
    )[0];
  };

  const assertInvestmentValue = (
    result: GoalWiseInvestmentSuggestions[],
    goalName: string,
    assetType: string,
    expectedValue: number,
  ) => {
    const goal = getGoal(result, goalName);
    const asset = getAssetType(goal, assetType);
    expect(Math.floor(asset.amount)).toEqual(expectedValue);
  };

  it('should calculate investment breakdown given planner data with single goal', () => {
    // Arrange

    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 100000),
    ];
    const assets: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [{ id: 'assetType_1', investmentPercentage: 100 }],
      [TermType.MEDIUM_TERM]: [],
      [TermType.SHORT_TERM]: [],
    };
    const plannerData: PlannerData = new PlannerData(financialGoals, assets);

    // Act
    const { calculateInvestmentNeededForGoals } = useInvestmentCalculator();
    const result = calculateInvestmentNeededForGoals(plannerData);

    // Assert
    assertInvestmentValue(result, 'goal1', 'assetType_1', 1267);
  });

  it('should calcualte investment breakdown given planner data with multiple goals', () => {
    // Arrange
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 100000),
      new FinancialGoal('goal2', 2024, 2026, 100000),
    ];
    const assets: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [{ id: 'assetType_1', investmentPercentage: 100 }],
      [TermType.MEDIUM_TERM]: [],
      [TermType.SHORT_TERM]: [{ id: 'assetType_3', investmentPercentage: 100 }],
    };
    const plannerData: PlannerData = new PlannerData(financialGoals, assets);

    // Act
    const { calculateInvestmentNeededForGoals } = useInvestmentCalculator();
    const result = calculateInvestmentNeededForGoals(plannerData);

    // Assert
    assertInvestmentValue(result, 'goal1', 'assetType_1', 1267);
    assertInvestmentValue(result, 'goal2', 'assetType_3', 4313);
  });

  function getMockPlannerData() {
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 1000000),
      new FinancialGoal('goal2', 2024, 2028, 100000),
      new FinancialGoal('goal3', 2024, 2026, 100000),
    ];
    const assets: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [
        { id: 'assetType_1', investmentPercentage: 80 },
        {
          id: 'assetType_2',
          investmentPercentage: 20,
        },
      ],
      [TermType.MEDIUM_TERM]: [
        { id: 'assetType_2', investmentPercentage: 50 },
        {
          id: 'assetType_3',
          investmentPercentage: 50,
        },
      ],
      [TermType.SHORT_TERM]: [{ id: 'assetType_3', investmentPercentage: 100 }],
    };
    return new PlannerData(financialGoals, assets);
  }

  it('should calculate investment breakdown given planner data with multiple goals and multiple assets', () => {
    // Arrange
    const plannerData = getMockPlannerData();

    // Act
    const { calculateInvestmentNeededForGoals } = useInvestmentCalculator();
    const result = calculateInvestmentNeededForGoals(plannerData);

    // Assert
    assertInvestmentValue(result, 'goal1', 'assetType_1', 10269);
    assertInvestmentValue(result, 'goal1', 'assetType_2', 2567);
    assertInvestmentValue(result, 'goal2', 'assetType_2', 1070);
    assertInvestmentValue(result, 'goal2', 'assetType_3', 1070);
    assertInvestmentValue(result, 'goal3', 'assetType_3', 4313);
  });

  it('should compute return for generated investment suggestions for goals', () => {
    const {
      calculateInvestmentNeededForGoals,
      calculateYearlyReturnValueBySuggestions,
    } = useInvestmentCalculator();

    const plannerData: PlannerData = getMockPlannerData();
    const investmentSuggestions =
      calculateInvestmentNeededForGoals(plannerData);

    // Act
    const result = calculateYearlyReturnValueBySuggestions(
      plannerData.financialGoals,
      investmentSuggestions,
    );

    function getReturnsByYears(resultIndex: number, investmentIndex: number) {
      return result[resultIndex].returnsPerInvestment[investmentIndex]
        .returnsByYear;
    }

    // Assert
    expect(result.length).toEqual(3);
    expect(result[0].goalName).toEqual('goal1');
    expect(result[0].returnsPerInvestment.length).toEqual(2);
    expect(result[0].returnsPerInvestment[0].investmentOptionId).toEqual(
      'assetType_1',
    );
    expect(result[0].returnsPerInvestment[1].investmentOptionId).toEqual(
      'assetType_2',
    );
    const firstInvestmentReturns = getReturnsByYears(0, 0);
    expect(firstInvestmentReturns.length).toEqual(6);
    const secondInvestmentReturns = getReturnsByYears(0, 1);
    expect(secondInvestmentReturns.length).toEqual(6);

    expect(
      firstInvestmentReturns[firstInvestmentReturns.length - 1].return +
        secondInvestmentReturns[secondInvestmentReturns.length - 1].return,
    ).toBeCloseTo(
      plannerData.financialGoals[0].getInflationAdjustedTargetAmount(),
      0,
    );

    expect(result[1].goalName).toEqual('goal2');
    expect(result[1].returnsPerInvestment.length).toEqual(2);
    expect(result[1].returnsPerInvestment[0].investmentOptionId).toEqual(
      'assetType_2',
    );
    expect(result[1].returnsPerInvestment[1].investmentOptionId).toEqual(
      'assetType_3',
    );
    const firstInvestmentReturnsGoal2 = getReturnsByYears(1, 0);
    expect(firstInvestmentReturnsGoal2.length).toEqual(4);
    const secondInvestmentReturnsGoal2 = getReturnsByYears(1, 1);
    expect(secondInvestmentReturnsGoal2.length).toEqual(4);
    expect(
      firstInvestmentReturnsGoal2[firstInvestmentReturnsGoal2.length - 1]
        .return +
        secondInvestmentReturnsGoal2[secondInvestmentReturnsGoal2.length - 1]
          .return,
    ).toBeCloseTo(
      plannerData.financialGoals[1].getInflationAdjustedTargetAmount(),
      0,
    );

    expect(result[2].goalName).toEqual('goal3');
    expect(result[2].returnsPerInvestment.length).toEqual(1);
    expect(result[2].returnsPerInvestment[0].investmentOptionId).toEqual(
      'assetType_3',
    );
    const firstInvestmentReturnsGoal3 = getReturnsByYears(2, 0);
    expect(firstInvestmentReturnsGoal3.length).toEqual(2);
    expect(
      firstInvestmentReturnsGoal3[firstInvestmentReturnsGoal3.length - 1]
        .return,
    ).toBeCloseTo(
      plannerData.financialGoals[2].getInflationAdjustedTargetAmount(),
      0,
    );
  });
});
