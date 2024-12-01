import { PlannerData } from '../../../domain/PlannerData';
import { FinancialGoal } from '../../../domain/FinancialGoals';
import {
  InvestmentAllocationsType,
  InvestmentChoiceType,
} from '../../../domain/InvestmentOptions';

export type InvestmentSuggestion = {
  investmentName: string;
  amount: number;
  expectedReturnPercentage: number;
};

export type GoalWiseInvestmentSuggestions = {
  goalName: string;
  investmentSuggestions: InvestmentSuggestion[];
};

type ReturnsByYear = { year: number; return: number };

type ReturnsPerInvestment = {
  investmentOptionId: string;
  returnsByYear: ReturnsByYear[];
};

export type GoalWiseReturn = {
  goalName: string;
  investmentSuggestions: InvestmentSuggestion[];
  returnsPerInvestment: ReturnsPerInvestment[];
};

const useInvestmentCalculator = (plannerData: PlannerData) => {
  const calculateInvestmentNeededForGoals = (
    plannerData: PlannerData,
    selectedYear: number,
  ): GoalWiseInvestmentSuggestions[] => {
    return plannerData.financialGoals.map((goal) => {
      // Check if selected year falls under the term of the goal
      if (
        selectedYear < goal.getInvestmentStartYear() ||
        selectedYear > goal.getTargetYear()
      ) {
        return {
          goalName: goal.getGoalName(),
          investmentSuggestions: [],
        };
      }

      return {
        goalName: goal.getGoalName(),
        investmentSuggestions: calculateInvestmentPerGoal(
          goal,
          plannerData.investmentAllocations,
        ),
      };
    });
  };

  /**
   * Calculates regardless of the year the goal starts
   * @param goal
   * @param investmentAllocations
   */
  const calculateInvestmentPerGoal = (
    goal: FinancialGoal,
    investmentAllocations: InvestmentAllocationsType,
  ): InvestmentSuggestion[] => {
    // Get the investment allocations for the term type of the goal
    const investmentAllocationsForType =
      investmentAllocations[goal.getTermType()];

    const totalMonthlyInvestmentNeeded = calculateTotalMonthlyInvestmentNeeded(
      investmentAllocationsForType,
      goal.getInflationAdjustedTargetAmount(),
      goal.getTerm(),
    );

    return investmentAllocationsForType.map((e) => ({
      investmentName: e.investmentName,
      amount: (totalMonthlyInvestmentNeeded * e.investmentPercentage) / 100,
      expectedReturnPercentage: e.expectedReturnPercentage,
    }));
  };

  const calculateTotalMonthlyInvestmentNeeded = (
    investmentAllocations: InvestmentChoiceType[],
    targetAmount: number,
    term: number,
  ) => {
    const x = investmentAllocations.map((a) => {
      return calculateX(
        a.expectedReturnPercentage / 100 / 12,
        term * 12,
        a.investmentPercentage,
      );
    });
    const combinedX = x.reduce((a, b) => a + b, 0);

    return targetAmount / combinedX;
  };

  const calculateX = (i: number, n: number, p: number) => {
    const powerComponent = Math.pow(1 + i, n);
    const x = (powerComponent - 1) * ((1 + i) / i);

    return (x * p) / 100;
  };

  // const calculateReturnOnInvestment = (
  //   monthlyInvestment: number,
  //   termInMonths: number,
  //   yearlyReturnPercentage: number,
  // ) => {
  //   const i = yearlyReturnPercentage / 100 / 12;
  //   return (
  //     monthlyInvestment * ((Math.pow(1 + i, termInMonths) - 1) / i) * (1 + i)
  //   );
  // };

  // function calculateYearWiseReturnsForSuggestion(
  //   startYear: number,
  //   endYear: number,
  //   investmentSuggestion: InvestmentSuggestion,
  // ) {
  //   const returnsByYear: ReturnsByYear[] = [];

  //   for (let i = startYear + 1; i <= endYear; i++) {
  //     const termInMonths = (i - startYear) * 12;
  //     const expectedReturnPercentage = plannerData.investmentOptions.filter(
  //       (e) => e.id === investmentSuggestion.investmentOptionId,
  //     )[0].expectedReturnPercentage;
  //     const returnOfTheYear = calculateReturnOnInvestment(
  //       investmentSuggestion.amount,
  //       termInMonths,
  //       expectedReturnPercentage,
  //     );
  //     returnsByYear.push({ year: i, return: returnOfTheYear });
  //   }

  //   return returnsByYear;
  // }

  // function calculateYearWiseReturnForGoal(
  //   goal: FinancialGoal,
  //   goalWiseSuggestion: GoalWiseInvestmentSuggestions,
  // ) {
  //   const returnsByInvestment: ReturnsPerInvestment[] = [];
  //   const startYear = goal.getInvestmentStartYear();
  //   const endYear = goal.getTargetYear();

  //   goalWiseSuggestion.investmentSuggestions.forEach((investmentSuggestion) => {
  //     const returnsByYear = calculateYearWiseReturnsForSuggestion(
  //       startYear,
  //       endYear,
  //       investmentSuggestion,
  //     );
  //     returnsByInvestment.push({
  //       investmentOptionId: investmentSuggestion.investmentOptionId,
  //       returnsByYear,
  //     });
  //   });
  //   return returnsByInvestment;
  // }

  // const calculateYearlyReturnValueBySuggestions = (
  //   financialGoals: FinancialGoal[],
  // ): GoalWiseReturn[] => {
  //   const goalWiseReturns: GoalWiseReturn[] = [];
  //   const goalWiseInvestmentSuggestions = financialGoals.map((goal) => ({
  //     goalName: goal.getGoalName(),
  //     investmentSuggestions: calculateInvestmentPerGoal(
  //       goal,
  //       plannerData.investmentAllocations,
  //     ),
  //   }));
  //   goalWiseInvestmentSuggestions.forEach((goalWiseSuggestion) => {
  //     const goal = financialGoals.filter(
  //       (e) => e.getGoalName() === goalWiseSuggestion.goalName,
  //     )[0];
  //     const returnsPerInvestment = calculateYearWiseReturnForGoal(
  //       goal,
  //       goalWiseSuggestion,
  //     );

  //     goalWiseReturns.push({
  //       goalName: goal.getGoalName(),
  //       investmentSuggestions: goalWiseSuggestion.investmentSuggestions,
  //       returnsPerInvestment,
  //     });
  //   });

  //   return goalWiseReturns;
  // };

  return {
    calculateInvestmentNeededForGoals,
    calculateInvestmentPerGoal,
  };
};

export default useInvestmentCalculator;
