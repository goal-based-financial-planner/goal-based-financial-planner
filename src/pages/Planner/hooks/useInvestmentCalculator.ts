import { PlannerData } from '../../../domain/PlannerData';
import { FinancialGoal } from '../../../domain/FinancialGoals';
import { InvestmentAllocationsType } from '../../../domain/InvestmentOptions';
import dayjs from 'dayjs';
import {
  calculateTotalMonthlySIP,
  calculateFutureValue,
} from './investmentCalculator.utils';

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
          return calculateFutureValue(
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
   * Calculates the monthly SIP needed for each investment type to reach the goal.
   * Uses the Annuity Due formula (payments at beginning of period).
   *
   * @param goal - The financial goal
   * @param investmentAllocations - Investment allocations by term type
   */
  const calculateInvestmentPerGoal = (
    goal: FinancialGoal,
    investmentAllocations: InvestmentAllocationsType,
  ): InvestmentSuggestion[] => {
    // Get the investment allocations for the term type of the goal
    const investmentAllocationsForType =
      investmentAllocations[goal.getTermType()];

    if (!investmentAllocationsForType || investmentAllocationsForType.length === 0) {
      return [];
    }

    const totalMonthlyInvestmentNeeded = calculateTotalMonthlySIP(
      investmentAllocationsForType,
      goal.getInflationAdjustedTargetAmount(),
      goal.getMonthTerm(),
    );

    return investmentAllocationsForType.map((allocation) => ({
      investmentName: allocation.investmentName,
      amount: (totalMonthlyInvestmentNeeded * allocation.investmentPercentage) / 100,
      expectedReturnPercentage: allocation.expectedReturnPercentage,
    }));
  };

  return {
    calculateInvestmentNeededForGoals,
  };
};

export default useInvestmentCalculator;
