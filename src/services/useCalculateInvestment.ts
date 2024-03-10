import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { InvestmentAllocation, InvestmentOptionType } from '../domain/InvestmentOptions';
import { InvestmentOptionRiskType } from '../types/enums';

// TODO: This code is duplicated, need to move it to a common place
const investmentOptions: InvestmentOptionType[] = [
  {
    id: 'assetType_1',
    assetType: 'Small cap funds',
    expectedPercentage: 12,
    riskType: InvestmentOptionRiskType.LOW,
  },
  {
    id: 'assetType_2',
    assetType: 'Large Cap funds',
    expectedPercentage: 10,
    riskType: InvestmentOptionRiskType.LOW,
  },
  {
    id: 'assetType_3',
    assetType: 'Recurring deposit',
    expectedPercentage: 6,
    riskType: InvestmentOptionRiskType.HIGH,
  },
];

type InvestmentBreakdown = {
  goalName: string;
  assetBreakdown: {
    assetId: string;
    investmentValue: number;
  }[]
}[];
const useCalculateInvestment = () => {
  return { calculateInvestment };
};

const calculateInvestment = (plannerData: PlannerData): InvestmentBreakdown => {
  return plannerData.financialGoals.map(goal => ({
    goalName: goal.getGoalName(),
    assetBreakdown: calculateInvestmentPerGoal(goal, plannerData.assets),
  }));
};

const calculateInvestmentPerGoal = (goal: FinancialGoal, assets: InvestmentAllocation) => {
  const termTypeBasedInvestmentChoice = assets[goal.getTermType()];
  const assetDetails = Object.entries(termTypeBasedInvestmentChoice).map(entry => {
    const [assetId, percentageOfInvestment] = entry;
    const investmentChoiceDetail = investmentOptions.filter(e => e.id === assetId)[0];
    return { assetId, returnPercentage: investmentChoiceDetail.expectedPercentage, percentageOfInvestment };
  });
  const totalMonthlyInvestmentNeeded = calculateTotalMonthlyInvestmentNeeded(assetDetails, goal.getTargetAmount(), goal.getTerm());
  return assetDetails.map(e => ({
    assetId: e.assetId,
    investmentValue: totalMonthlyInvestmentNeeded * e.percentageOfInvestment / 100,
  }));

};

const calculateTotalMonthlyInvestmentNeeded = (assetDetails: {
  assetId: string,
  returnPercentage: number,
  percentageOfInvestment: number
}[], targetAmount: number, term: number) => {
  const x = assetDetails.map(a => calculateX(a.returnPercentage / 100 / 12, term * 12, a.percentageOfInvestment));
  const combinedX = x.reduce((a, b) => a + b, 0);
  return targetAmount / combinedX;
};

const calculateX = (i: number, n: number, p: number) => {
  const powerComponent = Math.pow(1 + i, n);
  const x = (powerComponent - 1) * ((1 + i) / i);

  return x * p / 100;
};
export default useCalculateInvestment;