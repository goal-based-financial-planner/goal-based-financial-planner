import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocationsType, InvestmentOptionType } from '../domain/InvestmentOptions';
import { InvestmentOptionRiskType } from '../types/enums';

// TODO: This code is duplicated, need to move it to a common place
const investmentOptions: InvestmentOptionType[] = [
  {
    id: 'assetType_1',
    assetType: 'Small cap funds',
    expectedReturnPercentage: 12,
    riskType: InvestmentOptionRiskType.LOW,
  },
  {
    id: 'assetType_2',
    assetType: 'Large Cap funds',
    expectedReturnPercentage: 10,
    riskType: InvestmentOptionRiskType.LOW,
  },
  {
    id: 'assetType_3',
    assetType: 'Recurring deposit',
    expectedReturnPercentage: 6,
    riskType: InvestmentOptionRiskType.HIGH,
  },
];

export type AssetBreakdown = {
  assetId: string;
  amount: number;
}

export type InvestmentBreakdown = {
  goalName: string;
  assetBreakdown: AssetBreakdown[]
};
const useCalculateInvestment = () => {
  return { calculateInvestment };
};

const calculateInvestment = (plannerData: PlannerData): InvestmentBreakdown[] => {
  return plannerData.financialGoals.map(goal => ({
    goalName: goal.getGoalName(),
    assetBreakdown: calculateInvestmentPerGoal(goal, plannerData.investmentAllocations),
  }));
};

const calculateInvestmentPerGoal = (goal: FinancialGoal, investmentAllocations: InvestmentAllocationsType) => {

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


  const totalMonthlyInvestmentNeeded = calculateTotalMonthlyInvestmentNeeded(assetDetails, goal.getInfaltionAdjustedTargetAmount(), goal.getTerm());
  return assetDetails.map(e => ({
    assetId: e.id,
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
export default useCalculateInvestment;