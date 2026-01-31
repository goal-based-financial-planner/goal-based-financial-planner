import { PlannerData } from '../../../domain/PlannerData';
import { FinancialGoal, isGoalActive } from '../../../domain/FinancialGoals';
import { InvestmentAllocationsType } from '../../../domain/InvestmentOptions';
import {
  calculateTotalMonthlySIP,
  calculateCurrentPortfolioValue,
} from '../../../domain/investmentCalculations';
import { InvestmentSuggestion } from '../../../types/planner';

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

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      return {
        goalName: goal.getGoalName(),
        investmentSuggestions: isGoalActive(goal, selectedDate)
          ? investmentSuggestions
          : [],
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

// Re-export types for backward compatibility
export type { InvestmentSuggestion };

export default useInvestmentCalculator;
