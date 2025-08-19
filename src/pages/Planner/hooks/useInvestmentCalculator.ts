import { PlannerData } from '../../../domain/PlannerData';
import { FinancialGoal } from '../../../domain/FinancialGoals';
import {
  InvestmentAllocationsType,
  InvestmentChoiceType,
} from '../../../domain/InvestmentOptions';
import dayjs from 'dayjs';

export type InvestmentSuggestion = {
  investmentName: string;
  amount: number;
  expectedReturnPercentage: number;
};

export type GoalWiseInvestmentSuggestions = {
  goalName: string;
  investmentSuggestions: InvestmentSuggestion[];
  currentValue: number;
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
    selectedDate: string,
  ): GoalWiseInvestmentSuggestions[] => {
    return plannerData.financialGoals.map((goal) => {
      const investmentSuggestions = calculateInvestmentPerGoal(
        goal,
        plannerData.investmentAllocations,
      );

      const elapsedMonths = goal.getElapsedMonths();
      const currentValue = investmentSuggestions
        .map((suggestion) => {
          return calculateReturnOnInvestment(
            suggestion.amount,
            Math.min(elapsedMonths, goal.getMonthTerm()),
            suggestion.expectedReturnPercentage,
          );
        })
        .reduce((acc, cv) => acc + cv, 0);

      return {
        goalName: goal.getGoalName(),
        investmentSuggestions:
          dayjs(selectedDate).isBefore(dayjs(goal.getInvestmentStartDate())) ||
          dayjs(selectedDate).isAfter(dayjs(goal.getTargetDate()))
            ? []
            : investmentSuggestions,
        currentValue,
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
      goal.getMonthTerm(),
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
    monthTerm: number,
  ) => {
    const x = investmentAllocations.map((a) => {
      return calculateX(
        a.expectedReturnPercentage / 100 / 12,
        monthTerm,
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

  const calculateReturnOnInvestment = (
    monthlyInvestment: number,
    termInMonths: number,
    yearlyReturnPercentage: number,
  ) => {
    const i = yearlyReturnPercentage / 100 / 12;
    return (
      monthlyInvestment * ((Math.pow(1 + i, termInMonths) - 1) / i) * (1 + i)
    );
  };

  return {
    calculateInvestmentNeededForGoals,
  };
};

export default useInvestmentCalculator;
