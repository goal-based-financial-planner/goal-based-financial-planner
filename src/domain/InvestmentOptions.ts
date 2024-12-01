import { TermType } from '../types/enums';

export type InvestmentOptionType = {
  investmentName: string;
  materialIconName?: string;
};

export type InvestmentChoiceType = {
  investmentName: string;
  investmentPercentage: number;
  expectedReturnPercentage: number;
};

export type InvestmentAllocationsType = Record<
  TermType,
  InvestmentChoiceType[]
>;
