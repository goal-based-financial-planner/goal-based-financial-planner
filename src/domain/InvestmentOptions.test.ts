import {
  InvestmentOptionType,
  InvestmentChoiceType,
  InvestmentAllocationsType,
} from './InvestmentOptions';
import { TermType } from '../types/enums';

describe('InvestmentOptions Types', () => {
  describe('InvestmentOptionType', () => {
    it('should accept valid investment option with name only', () => {
      const option: InvestmentOptionType = {
        investmentName: 'Stocks',
      };

      expect(option.investmentName).toBe('Stocks');
      expect(option.materialIconName).toBeUndefined();
    });

    it('should accept valid investment option with name and icon', () => {
      const option: InvestmentOptionType = {
        investmentName: 'Bonds',
        materialIconName: 'account_balance',
      };

      expect(option.investmentName).toBe('Bonds');
      expect(option.materialIconName).toBe('account_balance');
    });

    it('should handle empty investment name', () => {
      const option: InvestmentOptionType = {
        investmentName: '',
      };

      expect(option.investmentName).toBe('');
    });
  });

  describe('InvestmentChoiceType', () => {
    it('should accept valid investment choice', () => {
      const choice: InvestmentChoiceType = {
        investmentName: 'Equity Mutual Funds',
        investmentPercentage: 60,
        expectedReturnPercentage: 12,
      };

      expect(choice.investmentName).toBe('Equity Mutual Funds');
      expect(choice.investmentPercentage).toBe(60);
      expect(choice.expectedReturnPercentage).toBe(12);
    });

    it('should handle zero percentages', () => {
      const choice: InvestmentChoiceType = {
        investmentName: 'Cash',
        investmentPercentage: 0,
        expectedReturnPercentage: 0,
      };

      expect(choice.investmentPercentage).toBe(0);
      expect(choice.expectedReturnPercentage).toBe(0);
    });

    it('should handle 100% allocation', () => {
      const choice: InvestmentChoiceType = {
        investmentName: 'Fixed Deposit',
        investmentPercentage: 100,
        expectedReturnPercentage: 7,
      };

      expect(choice.investmentPercentage).toBe(100);
    });

    it('should handle decimal percentages', () => {
      const choice: InvestmentChoiceType = {
        investmentName: 'Bonds',
        investmentPercentage: 33.33,
        expectedReturnPercentage: 8.5,
      };

      expect(choice.investmentPercentage).toBe(33.33);
      expect(choice.expectedReturnPercentage).toBe(8.5);
    });

    it('should handle negative returns', () => {
      const choice: InvestmentChoiceType = {
        investmentName: 'High Risk Stock',
        investmentPercentage: 10,
        expectedReturnPercentage: -5,
      };

      expect(choice.expectedReturnPercentage).toBe(-5);
    });
  });

  describe('InvestmentAllocationsType', () => {
    it('should map all term types to investment choices', () => {
      const allocations: InvestmentAllocationsType = {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'Savings Account',
            investmentPercentage: 50,
            expectedReturnPercentage: 4,
          },
          {
            investmentName: 'Liquid Funds',
            investmentPercentage: 50,
            expectedReturnPercentage: 5,
          },
        ],
        [TermType.MEDIUM_TERM]: [
          {
            investmentName: 'Bonds',
            investmentPercentage: 60,
            expectedReturnPercentage: 7,
          },
          {
            investmentName: 'Balanced Funds',
            investmentPercentage: 40,
            expectedReturnPercentage: 9,
          },
        ],
        [TermType.LONG_TERM]: [
          {
            investmentName: 'Equity Mutual Funds',
            investmentPercentage: 70,
            expectedReturnPercentage: 12,
          },
          {
            investmentName: 'Index Funds',
            investmentPercentage: 30,
            expectedReturnPercentage: 11,
          },
        ],
      };

      expect(allocations[TermType.SHORT_TERM]).toHaveLength(2);
      expect(allocations[TermType.MEDIUM_TERM]).toHaveLength(2);
      expect(allocations[TermType.LONG_TERM]).toHaveLength(2);
    });

    it('should handle empty investment choices for a term', () => {
      const allocations: InvestmentAllocationsType = {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [
          {
            investmentName: 'Stocks',
            investmentPercentage: 100,
            expectedReturnPercentage: 15,
          },
        ],
      };

      expect(allocations[TermType.SHORT_TERM]).toHaveLength(0);
      expect(allocations[TermType.MEDIUM_TERM]).toHaveLength(0);
      expect(allocations[TermType.LONG_TERM]).toHaveLength(1);
    });

    it('should handle single investment choice per term', () => {
      const allocations: InvestmentAllocationsType = {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'Fixed Deposit',
            investmentPercentage: 100,
            expectedReturnPercentage: 6,
          },
        ],
        [TermType.MEDIUM_TERM]: [
          {
            investmentName: 'Corporate Bonds',
            investmentPercentage: 100,
            expectedReturnPercentage: 8,
          },
        ],
        [TermType.LONG_TERM]: [
          {
            investmentName: 'Equity',
            investmentPercentage: 100,
            expectedReturnPercentage: 14,
          },
        ],
      };

      expect(allocations[TermType.SHORT_TERM][0].investmentPercentage).toBe(100);
      expect(allocations[TermType.MEDIUM_TERM][0].investmentPercentage).toBe(100);
      expect(allocations[TermType.LONG_TERM][0].investmentPercentage).toBe(100);
    });

    it('should handle multiple investment choices per term', () => {
      const allocations: InvestmentAllocationsType = {
        [TermType.SHORT_TERM]: [
          { investmentName: 'A', investmentPercentage: 25, expectedReturnPercentage: 4 },
          { investmentName: 'B', investmentPercentage: 25, expectedReturnPercentage: 5 },
          { investmentName: 'C', investmentPercentage: 25, expectedReturnPercentage: 4.5 },
          { investmentName: 'D', investmentPercentage: 25, expectedReturnPercentage: 5.5 },
        ],
        [TermType.MEDIUM_TERM]: [
          { investmentName: 'E', investmentPercentage: 50, expectedReturnPercentage: 8 },
          { investmentName: 'F', investmentPercentage: 50, expectedReturnPercentage: 9 },
        ],
        [TermType.LONG_TERM]: [
          { investmentName: 'G', investmentPercentage: 100, expectedReturnPercentage: 12 },
        ],
      };

      expect(allocations[TermType.SHORT_TERM]).toHaveLength(4);
      expect(allocations[TermType.MEDIUM_TERM]).toHaveLength(2);
      expect(allocations[TermType.LONG_TERM]).toHaveLength(1);
    });

    it('should allow accessing allocation by term type', () => {
      const allocations: InvestmentAllocationsType = {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'Savings',
            investmentPercentage: 100,
            expectedReturnPercentage: 3,
          },
        ],
        [TermType.MEDIUM_TERM]: [
          {
            investmentName: 'Bonds',
            investmentPercentage: 100,
            expectedReturnPercentage: 7,
          },
        ],
        [TermType.LONG_TERM]: [
          {
            investmentName: 'Stocks',
            investmentPercentage: 100,
            expectedReturnPercentage: 12,
          },
        ],
      };

      const shortTermAllocation = allocations[TermType.SHORT_TERM];
      const mediumTermAllocation = allocations[TermType.MEDIUM_TERM];
      const longTermAllocation = allocations[TermType.LONG_TERM];

      expect(shortTermAllocation[0].investmentName).toBe('Savings');
      expect(mediumTermAllocation[0].investmentName).toBe('Bonds');
      expect(longTermAllocation[0].investmentName).toBe('Stocks');
    });
  });
});
