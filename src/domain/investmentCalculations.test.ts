import {
  calculateSIPFactor,
  calculateTotalMonthlySIP,
  calculateFutureValue,
  verifySIPCalculation,
  calculateCurrentPortfolioValue,
} from './investmentCalculations';
import { InvestmentChoiceType } from './InvestmentOptions';
import { FinancialGoal } from './FinancialGoals';
import { GoalType } from '../types/enums';
import dayjs from 'dayjs';

describe('Investment Calculations Domain Logic', () => {
  describe('calculateSIPFactor', () => {
    it('should calculate correct SIP factor for 12% annual return over 12 months', () => {
      const monthlyRate = 0.12 / 12; // 1% monthly
      const months = 12;
      const percentage = 100;

      const factor = calculateSIPFactor(monthlyRate, months, percentage);

      // Expected: [(1.01)^12 - 1] × 1.01 / 0.01 = 12.809
      expect(factor).toBeCloseTo(12.809, 2);
    });

    it('should scale factor by allocation percentage', () => {
      const monthlyRate = 0.12 / 12;
      const months = 12;

      const factor100 = calculateSIPFactor(monthlyRate, months, 100);
      const factor50 = calculateSIPFactor(monthlyRate, months, 50);

      expect(factor50).toBeCloseTo(factor100 / 2, 2);
    });

    it('should handle 0% return (simple accumulation)', () => {
      const monthlyRate = 0;
      const months = 12;
      const percentage = 100;

      const factor = calculateSIPFactor(monthlyRate, months, percentage);

      // With 0% return, factor should just be the number of months
      expect(factor).toBe(12);
    });

    it('should handle partial allocation with 0% return', () => {
      const monthlyRate = 0;
      const months = 12;
      const percentage = 50;

      const factor = calculateSIPFactor(monthlyRate, months, percentage);

      expect(factor).toBe(6); // 12 months × 50%
    });
  });

  describe('calculateTotalMonthlySIP', () => {
    it('should calculate correct SIP for single investment', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 100,
        },
      ];
      const targetAmount = 100000;
      const months = 12;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      // Expected: 100000 / 12.809 ≈ 7806.71
      expect(monthlySIP).toBeCloseTo(7806.71, 0);
    });

    it('should calculate correct SIP for multiple investments', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 60,
        },
        {
          investmentName: 'Debt',
          expectedReturnPercentage: 6,
          investmentPercentage: 40,
        },
      ];
      const targetAmount = 100000;
      const months = 24;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      // Verify by calculating future value
      const futureValue = verifySIPCalculation(monthlySIP, allocations, months);
      expect(futureValue).toBeCloseTo(targetAmount, 0);
    });

    it('should handle 0 month term', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 100,
        },
      ];

      const monthlySIP = calculateTotalMonthlySIP(allocations, 100000, 0);
      expect(monthlySIP).toBe(0);
    });

    it('should handle negative month term', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 100,
        },
      ];

      const monthlySIP = calculateTotalMonthlySIP(allocations, 100000, -5);
      expect(monthlySIP).toBe(0);
    });
  });

  describe('calculateFutureValue', () => {
    it('should calculate correct future value for SIP', () => {
      const monthlyInvestment = 10000;
      const months = 12;
      const annualReturn = 12;

      const futureValue = calculateFutureValue(
        monthlyInvestment,
        months,
        annualReturn,
      );

      // Expected: 10000 × 12.809 ≈ 128,093
      expect(futureValue).toBeCloseTo(128093, 0);
    });

    it('should handle 0% return', () => {
      const monthlyInvestment = 10000;
      const months = 12;
      const annualReturn = 0;

      const futureValue = calculateFutureValue(
        monthlyInvestment,
        months,
        annualReturn,
      );

      // With 0% return, FV = principal only
      expect(futureValue).toBe(120000);
    });

    it('should return 0 for 0 months', () => {
      const futureValue = calculateFutureValue(10000, 0, 12);
      expect(futureValue).toBe(0);
    });

    it('should return 0 for 0 investment', () => {
      const futureValue = calculateFutureValue(0, 12, 12);
      expect(futureValue).toBe(0);
    });
  });

  describe('verifySIPCalculation (round-trip verification)', () => {
    it('should verify that calculated SIP reaches target amount', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 100,
        },
      ];
      const targetAmount = 500000;
      const months = 36;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );

      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });

    it('should verify multi-allocation SIP reaches target', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Large Cap',
          expectedReturnPercentage: 10,
          investmentPercentage: 30,
        },
        {
          investmentName: 'Mid Cap',
          expectedReturnPercentage: 12,
          investmentPercentage: 40,
        },
        {
          investmentName: 'Small Cap',
          expectedReturnPercentage: 15,
          investmentPercentage: 30,
        },
      ];
      const targetAmount = 1000000;
      const months = 60;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );

      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });

    it('should work with long-term goals (10+ years)', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 70,
        },
        {
          investmentName: 'Debt',
          expectedReturnPercentage: 7,
          investmentPercentage: 30,
        },
      ];
      const targetAmount = 10000000; // 1 crore
      const months = 180; // 15 years

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );

      expect(achievedAmount).toBeCloseTo(targetAmount, -1); // Allow larger margin for big numbers
      expect(monthlySIP).toBeGreaterThan(0);
      expect(monthlySIP).toBeLessThan(targetAmount / months); // SIP should be less than simple division
    });
  });

  describe('calculateCurrentPortfolioValue', () => {
    it('should calculate current value for a goal with elapsed time', () => {
      const startDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
      const targetDate = dayjs().add(18, 'month').format('YYYY-MM-DD');

      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        startDate,
        targetDate,
        100000,
      );

      const investmentSuggestions = [
        {
          amount: 5000,
          expectedReturnPercentage: 12,
        },
      ];

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      // After 6 months of 5000/month at 12% annual return
      const expectedValue = calculateFutureValue(5000, 6, 12);
      expect(currentValue).toBeCloseTo(expectedValue, 0);
    });

    it('should return 0 for goals that have not started', () => {
      const startDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
      const targetDate = dayjs().add(25, 'month').format('YYYY-MM-DD');

      const goal = new FinancialGoal(
        'Future Goal',
        GoalType.ONE_TIME,
        startDate,
        targetDate,
        100000,
      );

      const investmentSuggestions = [
        {
          amount: 5000,
          expectedReturnPercentage: 12,
        },
      ];

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      expect(currentValue).toBe(0);
    });

    it('should calculate value for multiple investment suggestions', () => {
      const startDate = dayjs().subtract(12, 'month').format('YYYY-MM-DD');
      const targetDate = dayjs().add(12, 'month').format('YYYY-MM-DD');

      const goal = new FinancialGoal(
        'Mixed Goal',
        GoalType.ONE_TIME,
        startDate,
        targetDate,
        200000,
      );

      const investmentSuggestions = [
        {
          amount: 3000,
          expectedReturnPercentage: 12,
        },
        {
          amount: 2000,
          expectedReturnPercentage: 8,
        },
      ];

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      const expectedValue1 = calculateFutureValue(3000, 12, 12);
      const expectedValue2 = calculateFutureValue(2000, 12, 8);
      const expectedTotal = expectedValue1 + expectedValue2;

      expect(currentValue).toBeCloseTo(expectedTotal, 0);
    });

    it('should cap elapsed months at goal term', () => {
      // Goal that has already ended
      const startDate = dayjs().subtract(30, 'month').format('YYYY-MM-DD');
      const targetDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');

      const goal = new FinancialGoal(
        'Ended Goal',
        GoalType.ONE_TIME,
        startDate,
        targetDate,
        100000,
      );

      const investmentSuggestions = [
        {
          amount: 5000,
          expectedReturnPercentage: 12,
        },
      ];

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      // Should cap at 24 months (goal term), not 30 months (actual elapsed)
      const expectedValue = calculateFutureValue(5000, 24, 12);
      expect(currentValue).toBeCloseTo(expectedValue, 0);
    });

    it('should return 0 for recurring goals (0 elapsed months)', () => {
      const targetDate = dayjs().add(12, 'month').format('YYYY-MM-DD');

      const goal = new FinancialGoal(
        'Recurring Goal',
        GoalType.RECURRING,
        '', // Recurring goals don't use start date
        targetDate,
        50000,
      );

      const investmentSuggestions = [
        {
          amount: 5000,
          expectedReturnPercentage: 12,
        },
      ];

      const currentValue = calculateCurrentPortfolioValue(
        investmentSuggestions,
        goal,
      );

      expect(currentValue).toBe(0); // Recurring goals have 0 elapsed months
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate retirement corpus SIP correctly', () => {
      // Goal: ₹5 crore in 25 years with 70:30 equity:debt split
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Equity',
          expectedReturnPercentage: 12,
          investmentPercentage: 70,
        },
        {
          investmentName: 'Debt',
          expectedReturnPercentage: 7,
          investmentPercentage: 30,
        },
      ];
      const targetAmount = 50000000;
      const months = 300;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      // Verify
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );
      expect(achievedAmount).toBeCloseTo(targetAmount, -2);

      // Sanity check: SIP should be reasonable
      expect(monthlySIP).toBeGreaterThan(10000);
      expect(monthlySIP).toBeLessThan(100000);
    });

    it('should calculate short-term goal SIP correctly', () => {
      // Goal: ₹5 lakh for vacation in 2 years with conservative allocation
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Liquid Fund',
          expectedReturnPercentage: 6,
          investmentPercentage: 100,
        },
      ];
      const targetAmount = 500000;
      const months = 24;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      // Verify
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );
      expect(achievedAmount).toBeCloseTo(targetAmount, 0);

      // With 6% return, SIP should be slightly less than simple division
      const simpleDivision = targetAmount / months;
      expect(monthlySIP).toBeLessThan(simpleDivision);
      expect(monthlySIP).toBeCloseTo(19562, -1);
    });

    it('should handle medium-term education goal', () => {
      // Goal: ₹20 lakh for education in 5 years
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Balanced Fund',
          expectedReturnPercentage: 10,
          investmentPercentage: 60,
        },
        {
          investmentName: 'Debt Fund',
          expectedReturnPercentage: 7,
          investmentPercentage: 40,
        },
      ];
      const targetAmount = 2000000;
      const months = 60;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );
      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });
  });

  describe('Edge cases', () => {
    it('should handle very small returns', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'Savings',
          expectedReturnPercentage: 0.5,
          investmentPercentage: 100,
        },
      ];
      const targetAmount = 100000;
      const months = 12;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      expect(monthlySIP).toBeGreaterThan(0);
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );
      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });

    it('should handle very high returns', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'High Risk',
          expectedReturnPercentage: 25,
          investmentPercentage: 100,
        },
      ];
      const targetAmount = 100000;
      const months = 12;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      expect(monthlySIP).toBeGreaterThan(0);
      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );
      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });

    it('should handle uneven allocation percentages', () => {
      const allocations: InvestmentChoiceType[] = [
        {
          investmentName: 'A',
          expectedReturnPercentage: 12,
          investmentPercentage: 33,
        },
        {
          investmentName: 'B',
          expectedReturnPercentage: 8,
          investmentPercentage: 33,
        },
        {
          investmentName: 'C',
          expectedReturnPercentage: 6,
          investmentPercentage: 34,
        },
      ];
      const targetAmount = 100000;
      const months = 36;

      const monthlySIP = calculateTotalMonthlySIP(
        allocations,
        targetAmount,
        months,
      );

      const achievedAmount = verifySIPCalculation(
        monthlySIP,
        allocations,
        months,
      );
      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });

    it('should handle empty investment suggestions for portfolio value', () => {
      const startDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
      const targetDate = dayjs().add(18, 'month').format('YYYY-MM-DD');

      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        startDate,
        targetDate,
        100000,
      );

      const currentValue = calculateCurrentPortfolioValue([], goal);

      expect(currentValue).toBe(0);
    });
  });
});
