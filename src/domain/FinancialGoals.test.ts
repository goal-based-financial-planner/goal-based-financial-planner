import { FinancialGoal } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import dayjs from 'dayjs';
import { mockTodayDate } from '../testUtils/mockDayjs';

describe('FinancialGoal', () => {
  describe('Date and Term Logic', () => {
    it('should calculate correct term in years for one-time goals', () => {
      const goal = new FinancialGoal(
        'Retirement',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2044-01-01',
        1000000
      );

      expect(goal.getTerm()).toBe(20);
    });

    it('should calculate correct term in months for one-time goals', () => {
      const goal = new FinancialGoal(
        'Car',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        500000
      );

      expect(goal.getMonthTerm()).toBe(24);
    });

    it('should return 1 year term for recurring goals', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getTerm()).toBe(1);
    });

    it('should return 12 month term for recurring goals', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getMonthTerm()).toBe(12);
    });

    it('should classify goals as SHORT_TERM (≤36 months)', () => {
      const goal = new FinancialGoal(
        'Emergency Fund',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-12-31',
        200000
      );

      expect(goal.getTermType()).toBe(TermType.SHORT_TERM);
    });

    it('should classify goals as MEDIUM_TERM (36-60 months)', () => {
      const goal = new FinancialGoal(
        'House Down Payment',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2028-01-01',
        1000000
      );

      expect(goal.getMonthTerm()).toBe(48);
      expect(goal.getTermType()).toBe(TermType.MEDIUM_TERM);
    });

    it('should classify goals as LONG_TERM (>60 months)', () => {
      const goal = new FinancialGoal(
        'Retirement',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2035-01-01',
        5000000
      );

      expect(goal.getMonthTerm()).toBe(132);
      expect(goal.getTermType()).toBe(TermType.LONG_TERM);
    });

    it('should return investment start date for one-time goals', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-06-15',
        '2030-06-15',
        500000
      );

      expect(goal.getInvestmentStartDate()).toBe('2024-06-15');
    });

    it('should return today for recurring goal investment start date', () => {
      const cleanup = mockTodayDate('2024-03-15');

      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getInvestmentStartDate()).toBe('2024-03-15');

      cleanup();
    });

    it('should calculate elapsed months for goals that have started', () => {
      const cleanup = mockTodayDate('2024-07-01');

      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      expect(goal.getElapsedMonths()).toBe(6);

      cleanup();
    });

    it('should return 0 elapsed months for goals that have not started', () => {
      const cleanup = mockTodayDate('2023-12-01');

      const goal = new FinancialGoal(
        'Future Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      expect(goal.getElapsedMonths()).toBe(0);

      cleanup();
    });

    it('should return 0 elapsed months for recurring goals', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getElapsedMonths()).toBe(0);
    });
  });

  describe('Inflation Adjustment and Rounding', () => {
    it('should apply inflation adjustment to one-time goals', () => {
      // 5% inflation over 10 years
      const goal = new FinancialGoal(
        'Retirement',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2034-01-01',
        1000000
      );

      const inflatedAmount = goal.getInflationAdjustedTargetAmount();
      
      // Expected: 1000000 * (1.05)^10 ≈ 1628894.63
      expect(inflatedAmount).toBeCloseTo(1628894.63, 0);
    });

    it('should NOT apply inflation to recurring goals', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getInflationAdjustedTargetAmount()).toBe(100000);
    });

    it('should round inflated amounts correctly', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2029-01-01',
        100000
      );

      const inflatedAmount = goal.getInflationAdjustedTargetAmount();
      
      // Should be rounded to 2 decimal places
      expect(inflatedAmount).toBe(Math.round((inflatedAmount + Number.EPSILON) * 100) / 100);
    });

    it('should handle zero-year goals (no inflation)', () => {
      const goal = new FinancialGoal(
        'Immediate Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2024-01-01',
        100000
      );

      // 0 years → no inflation
      expect(goal.getInflationAdjustedTargetAmount()).toBe(100000);
    });

    it('should handle long-term goals with compounding inflation', () => {
      // 25 years at 5% inflation
      const goal = new FinancialGoal(
        'Retirement',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2049-01-01',
        1000000
      );

      const inflatedAmount = goal.getInflationAdjustedTargetAmount();
      
      // Expected: 1000000 * (1.05)^25 ≈ 3386355.08
      expect(inflatedAmount).toBeCloseTo(3386355.08, 0);
    });
  });

  describe('Getters', () => {
    it('should return correct goal name', () => {
      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      expect(goal.getGoalName()).toBe('Test Goal');
    });

    it('should return correct target date', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-06-15',
        500000
      );

      expect(goal.getTargetDate()).toBe('2030-06-15');
    });

    it('should return correct target amount', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      expect(goal.getTargetAmount()).toBe(500000);
    });

    it('should have unique IDs for different goals', () => {
      const goal1 = new FinancialGoal(
        'Goal 1',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );
      const goal2 = new FinancialGoal(
        'Goal 2',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      expect(goal1.id).not.toBe(goal2.id);
    });
  });
});