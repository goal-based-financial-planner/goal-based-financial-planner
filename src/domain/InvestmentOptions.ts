import { InvestmentOptionRiskType, TermType } from '../types/enums';

export type InvestmentOptionType = {
  id: string;
  investmentName: string;
  expectedReturnPercentage: number;
  riskType: InvestmentOptionRiskType;
};

export type InvestmentChoiceType = { investmentPercentage: number } & Pick<InvestmentOptionType, 'id'>

export type InvestmentAllocationsType = Record<TermType, InvestmentChoiceType[]>;
