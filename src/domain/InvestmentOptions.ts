import { InvestmentOptionRiskType, TermType } from '../types/enums';

export type InvestmentChoice = Record<string, number>;

export interface InvestmentAllocation {
  [TermType.LONG_TERM]: InvestmentChoice;
  [TermType.MEDIUM_TERM]: InvestmentChoice;
  [TermType.SHORT_TERM]: InvestmentChoice;
}

export type InvestmentOptionType = {
  id: string;
  assetType: string;
  expectedPercentage: number;
  riskType: InvestmentOptionRiskType;
};
