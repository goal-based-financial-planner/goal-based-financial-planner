import { PlannerData } from '../../../domain/PlannerData';
import { isGoalActive } from '../../../domain/FinancialGoals';
import {
  calculateInvestmentSuggestionsForGoal,
  calculateCurrentPortfolioValue,
} from '../../../domain/investmentCalculations';
import { InvestmentSuggestion } from '../../../types/planner';
import { GoalType } from '../../../types/enums';

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

const useInvestmentCalculator = (_plannerData: PlannerData) => {
  const calculateInvestmentNeededForGoals = (
    plannerData: PlannerData,
    selectedDate: string,
  ): GoalWiseInvestmentSuggestions[] => {
    return plannerData.financialGoals.map((goal) => {
      const investmentSuggestions = calculateInvestmentSuggestionsForGoal(
        goal,
        plannerData.investmentAllocations,
      );

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      return {
        goalName: goal.getGoalName(),
        investmentSuggestions:
          goal.goalType === GoalType.RECURRING || isGoalActive(goal, selectedDate)
            ? investmentSuggestions
            : [],
        currentValue,
      };
    });
  };

  return {
    calculateInvestmentNeededForGoals,
  };
};

// Re-export types for backward compatibility
export type { InvestmentSuggestion };

export default useInvestmentCalculator;
