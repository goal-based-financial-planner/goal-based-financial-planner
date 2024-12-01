import { TermType } from '../types/enums';
import {
  InvestmentAllocationsType,
  InvestmentOptionType,
} from './InvestmentOptions';

export const INFLATION_PERCENTAGE = 5;

export const DEFAULT_INVESTMENT_OPTIONS: InvestmentOptionType[] = [
  {
    investmentName: 'Large Cap Equity Mutual Funds',
    materialIconName: 'trending_up',
  },
  {
    investmentName: 'Mid Cap Equity Mutual Funds',
    materialIconName: 'trending_up',
  },
  {
    investmentName: 'Small Cap Equity Mutual Funds',
    materialIconName: 'trending_up',
  },
  {
    investmentName: 'Multi-Cap Equity Mutual Funds',
    materialIconName: 'trending_up',
  },
  {
    investmentName: 'Sectoral/Thematic Equity Mutual Funds',
    materialIconName: 'trending_up',
  },
  {
    investmentName: 'Dividend Yield Equity Mutual Funds',
    materialIconName: 'trending_up',
  },
  {
    investmentName: 'Public Provident Fund (PPF)',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'National Pension System (NPS)',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'Bank Recurring Deposits (FD)',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'Bank Fixed Deposits (FD)',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'Real Estate',
    materialIconName: 'house',
  },
  {
    investmentName: 'Gold',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'Corporate Bonds',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'Sovereign Gold Bonds (SGBs)',
    materialIconName: 'account_balance',
  },
  {
    investmentName: 'Government Securities (G-Secs)',
    materialIconName: 'account_balance',
  },
];

export const DEFAULT_INVESTMENT_ALLOCATIONS: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [
    {
      investmentName: 'Recurring Deposit',
      expectedReturnPercentage: 10,
      investmentPercentage: 50,
    },
  ],
  [TermType.MEDIUM_TERM]: [
    {
      investmentName: 'Recurring Deposit',
      expectedReturnPercentage: 10,
      investmentPercentage: 50,
    },
  ],
  [TermType.LONG_TERM]: [],
};
