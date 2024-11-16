import { TermType } from '../types/enums';
import {
  InvestmentAllocationsType,
  InvestmentOptionType,
} from './InvestmentOptions';

export const INFLATION_PERCENTAGE = 5;

export const DEFAULT_INVESTMENT_OPTIONS: InvestmentOptionType[] = [
  {
    id: 'largecap',
    investmentName: 'Large Cap Equity Mutual Funds',
    expectedReturnPercentage: 11,
    materialIconName: 'trending_up',
  },
  {
    id: 'midcap',
    investmentName: 'Mid Cap Equity Mutual Funds',
    expectedReturnPercentage: 13.5,
    materialIconName: 'trending_up',
  },
  {
    id: 'smallcap',
    investmentName: 'Small Cap Equity Mutual Funds',
    expectedReturnPercentage: 16.5,
    materialIconName: 'trending_up',
  },
  {
    id: 'multicap',
    investmentName: 'Multi-Cap Equity Mutual Funds',
    expectedReturnPercentage: 13.5,
    materialIconName: 'trending_up',
  },
  {
    id: 'sectoralthematic',
    investmentName: 'Sectoral/Thematic Equity Mutual Funds',
    expectedReturnPercentage: 15,
    materialIconName: 'trending_up',
  },
  {
    id: 'dividendyield',
    investmentName: 'Dividend Yield Equity Mutual Funds',
    expectedReturnPercentage: 11,
    materialIconName: 'trending_up',
  },
  {
    id: 'ppf',
    investmentName: 'Public Provident Fund (PPF)',
    expectedReturnPercentage: 7.1,
    materialIconName: 'account_balance',
  },
  {
    id: 'nps',
    investmentName: 'National Pension System (NPS)',
    expectedReturnPercentage: 9,
    materialIconName: 'account_balance',
  },
  {
    id: 'rd',
    investmentName: 'Bank Recurring Deposits (FD)',
    expectedReturnPercentage: 6,
    materialIconName: 'account_balance',
  },
  {
    id: 'fd',
    investmentName: 'Bank Fixed Deposits (FD)',
    expectedReturnPercentage: 6,
    materialIconName: 'account_balance',
  },
  {
    id: 'realestate',
    investmentName: 'Real Estate',
    expectedReturnPercentage: 9.5,
    materialIconName: 'house',
  },
  {
    id: 'gold',
    investmentName: 'Gold',
    expectedReturnPercentage: 7.5,
    materialIconName: 'account_balance',
  },
  {
    id: 'corporatebonds',
    investmentName: 'Corporate Bonds',
    expectedReturnPercentage: 8.5,
    materialIconName: 'account_balance',
  },
  {
    id: 'sgbs',
    investmentName: 'Sovereign Gold Bonds (SGBs)',
    expectedReturnPercentage: 2.5,
    materialIconName: 'account_balance',
  },
  {
    id: 'gsecs',
    investmentName: 'Government Securities (G-Secs)',
    expectedReturnPercentage: 7,
    materialIconName: 'account_balance',
  },
];

export const DEFAULT_INVESTMENT_ALLOCATIONS: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [
    { id: 'rd', investmentPercentage: 50 },
    { id: 'fd', investmentPercentage: 50 },
  ],
  [TermType.MEDIUM_TERM]: [
    { id: 'largecap', investmentPercentage: 20 },
    { id: 'midcap', investmentPercentage: 20 },
    { id: 'smallcap', investmentPercentage: 20 },
    { id: 'multicap', investmentPercentage: 20 },
    { id: 'sectoralthematic', investmentPercentage: 20 },
  ],
  [TermType.LONG_TERM]: [
    { id: 'corporatebonds', investmentPercentage: 10 },
    { id: 'sgbs', investmentPercentage: 20 },
    { id: 'gsecs', investmentPercentage: 30 },
    { id: 'gold', investmentPercentage: 10 },
    { id: 'largecap', investmentPercentage: 30 },
  ],
};
