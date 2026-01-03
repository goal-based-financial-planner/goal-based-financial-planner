import {
  calculateSIPFactor,
  calculateTotalMonthlySIP,
  calculateFutureValue,
  verifySIPCalculation,
} from './investmentCalculator.utils';
import { InvestmentChoiceType } from '../../../domain/InvestmentOptions';

describe('Investment Calculator Utils', () => {
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
  });
});

