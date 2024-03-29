import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocationsType } from '../domain/InvestmentOptions';
import useInvestmentOptions from './useInvestmentOptions';

// TODO: This code is duplicated, need to move it to a common place


export type InvestmentSuggestion = {
  investmentOptionId: string;
  amount: number;
}

export type GoalWiseInvestmentSuggestions = {
  goalName: string;
  investmentSuggestions: InvestmentSuggestion[]
};


const useCalculateInvestment = () => {
  const investmentOptions = useInvestmentOptions();

  const calculateInvestment = (plannerData: PlannerData): GoalWiseInvestmentSuggestions[] => {

    return plannerData.financialGoals.map(goal => ({
      goalName: goal.getGoalName(),
      investmentSuggestions: calculateInvestmentPerGoal(goal, plannerData.investmentAllocations),
    }));
  };

  const calculateInvestmentPerGoal = (goal: FinancialGoal, investmentAllocations: InvestmentAllocationsType): InvestmentSuggestion[] => {

    // Get the investment allocations for the term type of the goal
    const investmentAllocationsForType = investmentAllocations[goal.getTermType()];

    const assetDetails = investmentAllocationsForType.map(entry => {
      const { id, investmentPercentage } = entry;
      const { expectedReturnPercentage } = investmentOptions.filter(e => e.id === id)[0];
      return {
        id,
        expectedReturnPercentage,
        investmentPercentage,
      };
    });


    const totalMonthlyInvestmentNeeded = calculateTotalMonthlyInvestmentNeeded(assetDetails, goal.getInflationAdjustedTargetAmount(), goal.getTerm());
    return assetDetails.map(e => ({
      investmentOptionId: e.id,
      amount: totalMonthlyInvestmentNeeded * e.investmentPercentage / 100,
    }));

  };

  const calculateTotalMonthlyInvestmentNeeded = (assetDetails: {
    id: string,
    expectedReturnPercentage: number,
    investmentPercentage: number
  }[], targetAmount: number, term: number) => {
    const x = assetDetails.map(a => calculateX(a.expectedReturnPercentage / 100 / 12, term * 12, a.investmentPercentage));
    const combinedX = x.reduce((a, b) => a + b, 0);
    return targetAmount / combinedX;
  };

  const calculateX = (i: number, n: number, p: number) => {
    const powerComponent = Math.pow(1 + i, n);
    const x = (powerComponent - 1) * ((1 + i) / i);

    return x * p / 100;
  };

  return { calculateInvestment };
};


export default useCalculateInvestment;