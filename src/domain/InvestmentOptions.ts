import { TermType } from '../types/enums';

export type InvestmentOptionType = {
  id: string;
  investmentName: string;
  expectedReturnPercentage: number;
};

export type InvestmentChoiceType = { investmentPercentage: number } & Pick<
  InvestmentOptionType,
  'id'
>;

export type InvestmentAllocationsType = Record<
  TermType,
  InvestmentChoiceType[]
>;
