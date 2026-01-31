import { renderHook } from '@testing-library/react';
import useInvestmentCalculator from './useInvestmentCalculator';
import { PlannerData } from '../../../domain/PlannerData';
import { FinancialGoal } from '../../../domain/FinancialGoals';
import { GoalType, TermType } from '../../../types/enums';
import { mockTodayDate } from '../../../testUtils/mockDayjs';

describe('useInvestmentCalculator', () => {
  const mockAllocations = {
    [TermType.SHORT_TERM]: [
      {
        investmentName: 'FD',
        investmentPercentage: 100,
        expectedReturnPercentage: 6,
      },
    ],
    [TermType.MEDIUM_TERM]: [
      {
        investmentName: 'Balanced',
        investmentPercentage: 60,
        expectedReturnPercentage: 10,
      },
      {
        investmentName: 'Debt',
        investmentPercentage: 40,
        expectedReturnPercentage: 7,
      },
    ],
    [TermType.LONG_TERM]: [
      {
        investmentName: 'Equity',
        investmentPercentage: 70,
        expectedReturnPercentage: 12,
      },
      {
        investmentName: 'Debt',
        investmentPercentage: 30,
        expectedReturnPercentage: 7,
      },
    ],
  };

  describe('calculateInvestmentNeededForGoals', () => {
    it('should calculate investment suggestions for a single short-term goal', () => {
      const goal = new FinancialGoal(
        'Emergency Fund',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        500000
      );

      const plannerData = new PlannerData([goal], mockAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01'
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].goalName).toBe('Emergency Fund');
      expect(suggestions[0].investmentSuggestions).toHaveLength(1);
      expect(suggestions[0].investmentSuggestions[0].investmentName).toBe('FD');
      expect(suggestions[0].investmentSuggestions[0].amount).toBeGreaterThan(0);
      expect(suggestions[0].investmentSuggestions[0].expectedReturnPercentage).toBe(6);
    });

    it('should calculate suggestions for multiple allocations', () => {
      const goal = new FinancialGoal(
        'House',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2028-01-01',
        2000000
      );

      const plannerData = new PlannerData([goal], mockAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01'
      );

      expect(suggestions[0].investmentSuggestions).toHaveLength(2);
      
      const totalInvestment = suggestions[0].investmentSuggestions.reduce(
        (sum, s) => sum + s.amount,
        0
      );
      expect(totalInvestment).toBeGreaterThan(0);

      // Verify percentages sum to investment split
      const balancedPct = (suggestions[0].investmentSuggestions[0].amount / totalInvestment) * 100;
      expect(balancedPct).toBeCloseTo(60, 0);
    });

    it('should return empty suggestions before goal start date', () => {
      const goal = new FinancialGoal(
        'Future Goal',
        GoalType.ONE_TIME,
        '2025-01-01',
        '2030-01-01',
        1000000
      );

      const plannerData = new PlannerData([goal], mockAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01' // Before goal start
      );

      expect(suggestions[0].investmentSuggestions).toEqual([]);
    });

    it('should return empty suggestions after goal target date', () => {
      const goal = new FinancialGoal(
        'Past Goal',
        GoalType.ONE_TIME,
        '2020-01-01',
        '2023-01-01',
        500000
      );

      const plannerData = new PlannerData([goal], mockAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01' // After goal target
      );

      expect(suggestions[0].investmentSuggestions).toEqual([]);
    });

    it('should calculate current value for goals in progress', () => {
      const cleanup = mockTodayDate('2025-01-01');

      const goal = new FinancialGoal(
        'In Progress',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        200000
      );

      const plannerData = new PlannerData([goal], mockAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01'
      );

      // Goal started on 2024-01-01, "today" is 2025-01-01 → 12 months elapsed
      expect(suggestions[0].currentValue).toBeGreaterThan(0);

      cleanup();
    });

    it('should handle multiple goals across different term types', () => {
      const goals = [
        new FinancialGoal('Short', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 200000),
        new FinancialGoal('Medium', GoalType.ONE_TIME, '2024-01-01', '2028-01-01', 500000),
        new FinancialGoal('Long', GoalType.ONE_TIME, '2024-01-01', '2035-01-01', 2000000),
      ];

      const plannerData = new PlannerData(goals, mockAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01'
      );

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].investmentSuggestions).toHaveLength(1); // Short → 1 allocation
      expect(suggestions[1].investmentSuggestions).toHaveLength(2); // Medium → 2 allocations
      expect(suggestions[2].investmentSuggestions).toHaveLength(2); // Long → 2 allocations
    });

    it('should return empty suggestions when allocations are not defined for term type', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      const emptyAllocations = {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      };

      const plannerData = new PlannerData([goal], emptyAllocations);
      const { result } = renderHook(() => useInvestmentCalculator(plannerData));

      const suggestions = result.current.calculateInvestmentNeededForGoals(
        plannerData,
        '2024-06-01'
      );

      expect(suggestions[0].investmentSuggestions).toEqual([]);
    });
  });
});
