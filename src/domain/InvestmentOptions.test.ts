import type {
  InvestmentOptionType,
  InvestmentChoiceType,
  InvestmentAllocationsType,
} from './InvestmentOptions';
import { TermType } from '../types/enums';

describe('InvestmentOptions types', () => {
  it('should accept valid InvestmentOptionType', () => {
    const option: InvestmentOptionType = {
      investmentName: 'Gold',
      materialIconName: 'currency_rupee',
    };
    expect(option.investmentName).toBe('Gold');
    expect(option.materialIconName).toBe('currency_rupee');
  });

  it('should accept InvestmentOptionType without icon', () => {
    const option: InvestmentOptionType = {
      investmentName: 'PPF',
    };
    expect(option.investmentName).toBe('PPF');
    expect(option.materialIconName).toBeUndefined();
  });

  it('should accept valid InvestmentChoiceType', () => {
    const choice: InvestmentChoiceType = {
      investmentName: 'Large Cap Equity',
      investmentPercentage: 60,
      expectedReturnPercentage: 12,
    };
    expect(choice.investmentName).toBe('Large Cap Equity');
    expect(choice.investmentPercentage).toBe(60);
    expect(choice.expectedReturnPercentage).toBe(12);
  });

  it('should accept valid InvestmentAllocationsType', () => {
    const allocations: InvestmentAllocationsType = {
      [TermType.SHORT_TERM]: [
        {
          investmentName: 'FD',
          investmentPercentage: 100,
          expectedReturnPercentage: 7,
        },
      ],
      [TermType.MEDIUM_TERM]: [
        {
          investmentName: 'Balanced Fund',
          investmentPercentage: 100,
          expectedReturnPercentage: 10,
        },
      ],
      [TermType.LONG_TERM]: [
        {
          investmentName: 'Equity',
          investmentPercentage: 100,
          expectedReturnPercentage: 12,
        },
      ],
    };
    expect(allocations[TermType.SHORT_TERM]).toHaveLength(1);
    expect(allocations[TermType.MEDIUM_TERM][0].investmentName).toBe(
      'Balanced Fund',
    );
  });
});
