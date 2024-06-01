import { InvestmentOptionType } from './InvestmentOptions';

export const INFLATION_PERCENTAGE = 5;

export const DEFAULT_INVESTMENT_OPTIONS: InvestmentOptionType[] = [
  {
    id: 'largecap',
    investmentName: 'Large Cap Equity Mutual Funds',
    expectedReturnPercentage: 11,
  },
  {
    id: 'midcap',
    investmentName: 'Mid Cap Equity Mutual Funds',
    expectedReturnPercentage: 13.5,
  },
  {
    id: 'smallcap',
    investmentName: 'Small Cap Equity Mutual Funds',
    expectedReturnPercentage: 16.5,
  },
  {
    id: 'multicap',
    investmentName: 'Multi-Cap Equity Mutual Funds',
    expectedReturnPercentage: 13.5,
  },
  {
    id: 'sectoralthematic',
    investmentName: 'Sectoral/Thematic Equity Mutual Funds',
    expectedReturnPercentage: 15,
  },
  {
    id: 'dividendyield',
    investmentName: 'Dividend Yield Equity Mutual Funds',
    expectedReturnPercentage: 11,
  },
  {
    id: 'ppf',
    investmentName: 'Public Provident Fund (PPF)',
    expectedReturnPercentage: 7.1,
  },
  {
    id: 'nps',
    investmentName: 'National Pension System (NPS)',
    expectedReturnPercentage: 9,
  },
  {
    id: 'rd',
    investmentName: 'Bank Recurring Deposits (FD)',
    expectedReturnPercentage: 6,
  },
  {
    id: 'fd',
    investmentName: 'Bank Fixed Deposits (FD)',
    expectedReturnPercentage: 6,
  },
  {
    id: 'realestate',
    investmentName: 'Real Estate',
    expectedReturnPercentage: 9.5,
  },
  {
    id: 'gold',
    investmentName: 'Gold',
    expectedReturnPercentage: 7.5,
  },
  {
    id: 'corporatebonds',
    investmentName: 'Corporate Bonds',
    expectedReturnPercentage: 8.5,
  },
  {
    id: 'sgbs',
    investmentName: 'Sovereign Gold Bonds (SGBs)',
    expectedReturnPercentage: 2.5,
  },
  {
    id: 'gsecs',
    investmentName: 'Government Securities (G-Secs)',
    expectedReturnPercentage: 7,
  },
];
