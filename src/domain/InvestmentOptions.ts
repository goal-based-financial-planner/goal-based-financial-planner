import { InvestmentOptionRiskType, TermType } from '../types/enums';

export type InvestmentChoices = Record<string, number>;

export interface InvestmentAllocation {
  [TermType.LONG_TERM]: InvestmentChoices;
  [TermType.MEDIUM_TERM]: InvestmentChoices;
  [TermType.SHORT_TERM]: InvestmentChoices;
}

export type InvestmentOptionType = {
  id: string;
  assetType: string;
  expectedPercentage: number;
  riskType: InvestmentOptionRiskType;
};
