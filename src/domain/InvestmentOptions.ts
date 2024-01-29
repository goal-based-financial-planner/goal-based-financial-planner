import { InvestmentOptionRiskType } from '../types/enums';

export type InvestmentChoice = Record<string, number>;

export interface InvestmentAllocation {
  longTermGoals: InvestmentChoice;
  midTermGoals: InvestmentChoice;
  shortTermGoals: InvestmentChoice;
}

export type InvestmentOptionType = {
  id: string;
  assetType: string;
  expectedPercentage: number;
  riskType: InvestmentOptionRiskType;
};
