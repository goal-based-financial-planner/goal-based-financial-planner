import useInvestmentCalculator, {
  GoalWiseInvestmentSuggestions,
} from './useInvestmentCalculator';
import { TermType } from '../types/enums';
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocationsType } from '../domain/InvestmentOptions';

describe('Test useInvestmentCalculator -> calculateInvestmentNeededForGoals', () => {
  const getGoal = (
    result: GoalWiseInvestmentSuggestions[],
    goalName: string,
  ) => {
    return result.filter((e) => e.goalName === goalName)[0];
  };

  const getInvestmentSuggestion = (
    goal: GoalWiseInvestmentSuggestions,
    investmentOptionId: string,
  ) => {
    return goal.investmentSuggestions.filter(
      (b) => b.investmentOptionId === investmentOptionId,
    )[0];
  };

  const assertInvestmentValue = (
    result: GoalWiseInvestmentSuggestions[],
    goalName: string,
    investmentOptionId: string,
    expectedValue: number,
  ) => {
    const goal = getGoal(result, goalName);
    const investmentSuggestion = getInvestmentSuggestion(
      goal,
      investmentOptionId,
    );
    expect(Math.floor(investmentSuggestion.amount)).toEqual(expectedValue);
  };

  it('should calculate investment breakdown given planner data with single goal', () => {
    // Arrange

    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 100000),
    ];
    const investmentAllocation: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [{ id: 'largecap', investmentPercentage: 100 }],
      [TermType.MEDIUM_TERM]: [],
      [TermType.SHORT_TERM]: [],
    };
    const plannerData: PlannerData = new PlannerData(
      financialGoals,
      investmentAllocation,
    );

    // Act
    const { calculateInvestmentNeededForGoals } =
      useInvestmentCalculator(plannerData);
    const result = calculateInvestmentNeededForGoals(plannerData, 2024);

    // Assert
    assertInvestmentValue(result, 'goal1', 'largecap', 1310);
  });

  it('should calculate investment breakdown given planner data with multiple goals', () => {
    // Arrange
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 100000),
      new FinancialGoal('goal2', 2024, 2026, 100000),
    ];
    const investmentAllocation: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [{ id: 'largecap', investmentPercentage: 100 }],
      [TermType.MEDIUM_TERM]: [],
      [TermType.SHORT_TERM]: [{ id: 'smallcap', investmentPercentage: 100 }],
    };
    const plannerData: PlannerData = new PlannerData(
      financialGoals,
      investmentAllocation,
    );

    // Act
    const { calculateInvestmentNeededForGoals } =
      useInvestmentCalculator(plannerData);
    const result = calculateInvestmentNeededForGoals(plannerData, 2024);

    // Assert
    assertInvestmentValue(result, 'goal1', 'largecap', 1310);
    assertInvestmentValue(result, 'goal2', 'smallcap', 3855);
  });

  function getMockPlannerData() {
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 1000000),
      new FinancialGoal('goal2', 2024, 2028, 100000),
      new FinancialGoal('goal3', 2024, 2026, 100000),
    ];
    const investmentAllocation: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [
        { id: 'largecap', investmentPercentage: 80 },
        {
          id: 'midcap',
          investmentPercentage: 20,
        },
      ],
      [TermType.MEDIUM_TERM]: [
        { id: 'midcap', investmentPercentage: 50 },
        {
          id: 'smallcap',
          investmentPercentage: 50,
        },
      ],
      [TermType.SHORT_TERM]: [{ id: 'smallcap', investmentPercentage: 100 }],
    };
    return new PlannerData(financialGoals, investmentAllocation);
  }

  it('should calculate investment breakdown given planner data with multiple goals and multiple allocations', () => {
    // Arrange
    const plannerData = getMockPlannerData();

    // Act
    const { calculateInvestmentNeededForGoals } =
      useInvestmentCalculator(plannerData);
    const result = calculateInvestmentNeededForGoals(plannerData, 2024);

    // Assert
    assertInvestmentValue(result, 'goal1', 'largecap', 10301);
    assertInvestmentValue(result, 'goal1', 'midcap', 2575);
    assertInvestmentValue(result, 'goal2', 'midcap', 919);
    assertInvestmentValue(result, 'goal2', 'smallcap', 919);
    assertInvestmentValue(result, 'goal3', 'smallcap', 3855);
  });

  it('should compute return for generated investment suggestions for goals', () => {
    const plannerData: PlannerData = getMockPlannerData();
    const { calculateYearlyReturnValueBySuggestions } =
      useInvestmentCalculator(plannerData);

    // Act
    const result = calculateYearlyReturnValueBySuggestions(
      plannerData.financialGoals,
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
      'largecap',
    );
    expect(result[0].returnsPerInvestment[1].investmentOptionId).toEqual(
      'midcap',
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
      'midcap',
    );
    expect(result[1].returnsPerInvestment[1].investmentOptionId).toEqual(
      'smallcap',
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
      'smallcap',
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

describe('Test useInvestmentCalculator -> calculateYearlyReturnValueBySuggestions', () => {
  it('should return empty array if no goals are provided', () => {
    // Arrange
    const plannerData: PlannerData = new PlannerData(
      [],
      {} as InvestmentAllocationsType,
    );

    // Act
    const { calculateYearlyReturnValueBySuggestions } =
      useInvestmentCalculator(plannerData);
    const result = calculateYearlyReturnValueBySuggestions(
      plannerData.financialGoals,
    );

    // Assert
    expect(result).toEqual([]);
  });

  it('should return yearly return for each goal', () => {
    // Arrange
    const financialGoals: FinancialGoal[] = [
      new FinancialGoal('goal1', 2024, 2030, 1000000),
      new FinancialGoal('goal2', 2024, 2028, 100000),
    ];
    const investmentAllocations: InvestmentAllocationsType = {
      [TermType.LONG_TERM]: [
        { id: 'largecap', investmentPercentage: 80 },
        {
          id: 'midcap',
          investmentPercentage: 20,
        },
      ],
      [TermType.MEDIUM_TERM]: [
        { id: 'midcap', investmentPercentage: 50 },
        {
          id: 'smallcap',
          investmentPercentage: 50,
        },
      ],
      [TermType.SHORT_TERM]: [{ id: 'smallcap', investmentPercentage: 100 }],
    };
    const plannerData: PlannerData = new PlannerData(
      financialGoals,
      investmentAllocations,
    );

    // Act
    const { calculateYearlyReturnValueBySuggestions } =
      useInvestmentCalculator(plannerData);
    const result = calculateYearlyReturnValueBySuggestions(
      plannerData.financialGoals,
    );

    // Assert
    expect(result.length).toEqual(2);
    expect(result[0].goalName).toEqual('goal1');
    expect(result[0].investmentSuggestions.length).toEqual(2);
    expect(result[0].returnsPerInvestment.length).toEqual(2);
    expect(result[1].goalName).toEqual('goal2');
    expect(result[1].investmentSuggestions.length).toEqual(2);
    expect(result[1].returnsPerInvestment.length).toEqual(2);

    const goal1 = result[0];
    const goal2 = result[1];
    expect(goal1.returnsPerInvestment[0].investmentOptionId).toEqual(
      'largecap',
    );
    expect(goal1.returnsPerInvestment[1].investmentOptionId).toEqual('midcap');
    expect(goal2.returnsPerInvestment[0].investmentOptionId).toEqual('midcap');
    expect(goal2.returnsPerInvestment[1].investmentOptionId).toEqual(
      'smallcap',
    );

    const goal1Returns = goal1.returnsPerInvestment.map((e) => e.returnsByYear);
    expect(goal1Returns[0].length).toEqual(6);
    expect(goal1Returns[1].length).toEqual(6);
    const goal2Returns = goal2.returnsPerInvestment.map((e) => e.returnsByYear);
    expect(goal2Returns[0].length).toEqual(4);
    expect(goal2Returns[1].length).toEqual(4);

    //   Check last return to be equal to the target amount
    expect(
      goal1Returns[0][goal1Returns[0].length - 1].return +
        goal1Returns[1][goal1Returns[1].length - 1].return,
    ).toBeCloseTo(
      plannerData.financialGoals[0].getInflationAdjustedTargetAmount(),
      0,
    );
    expect(
      goal2Returns[0][goal2Returns[0].length - 1].return +
        goal2Returns[1][goal2Returns[1].length - 1].return,
    ).toBeCloseTo(
      plannerData.financialGoals[1].getInflationAdjustedTargetAmount(),
      0,
    );
  });
});
