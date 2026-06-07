import { FinancialGoal, isGoalActive } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';
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

    it('should return 1 year term for recurring goals with no duration set', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getTerm()).toBe(1);
    });

    it('should return 12 month term for recurring goals with no duration set', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      expect(goal.getMonthTerm()).toBe(12);
    });

    it('should return recurringDurationYears as the term for recurring goals', () => {
      const goal2 = new FinancialGoal('Expenses', GoalType.RECURRING, '', '', 120000, 2);
      const goal3 = new FinancialGoal('Expenses', GoalType.RECURRING, '', '', 120000, 3);

      expect(goal2.getTerm()).toBe(2);
      expect(goal3.getTerm()).toBe(3);
    });

    it('should return recurringDurationYears * 12 as month term for recurring goals', () => {
      const goal2 = new FinancialGoal('Expenses', GoalType.RECURRING, '', '', 120000, 2);
      const goal3 = new FinancialGoal('Expenses', GoalType.RECURRING, '', '', 120000, 3);

      expect(goal2.getMonthTerm()).toBe(24);
      expect(goal3.getMonthTerm()).toBe(36);
    });

    it('should default to 1 year / 12 months when recurringDurationYears is undefined', () => {
      const goal = new FinancialGoal('Legacy', GoalType.RECURRING, '', '', 60000, undefined);

      expect(goal.getTerm()).toBe(1);
      expect(goal.getMonthTerm()).toBe(12);
    });

    it('should not affect term calculation for one-time goals regardless of recurringDurationYears', () => {
      const goal = new FinancialGoal('Car', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 500000, 2);

      expect(goal.getTerm()).toBe(2); // dayjs diff, not duration
      expect(goal.getMonthTerm()).toBe(24);
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

    it('should apply inflation to recurring goals using recurringDurationYears', () => {
      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000,
        1,
        5,
      );

      // 5% over 1 year: 100000 * 1.05 = 105000
      expect(goal.getInflationAdjustedTargetAmount()).toBe(105000);
    });

    it('should apply inflation to recurring goal with 3-year duration', () => {
      const goal = new FinancialGoal(
        'Vacation Fund',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000,
        3,
        5,
      );

      // 5% over 3 years: 100000 * (1.05)^3 ≈ 115762.5
      expect(goal.getInflationAdjustedTargetAmount()).toBeCloseTo(115762.5, 0);
    });

    it('should default to 1-year term for legacy recurring goal with no duration', () => {
      const goal = new FinancialGoal(
        'Legacy Recurring',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000,
        undefined,
        5,
      );

      // No recurringDurationYears → defaults to 1: 100000 * 1.05 = 105000
      expect(goal.getInflationAdjustedTargetAmount()).toBe(105000);
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

    it('should use a custom inflation rate for one-time goals', () => {
      const goal = new FinancialGoal(
        'House',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2029-01-01',
        1000000,
        undefined,
        8,
      );

      // 8% over 5 years: 1000000 * (1.08)^5 ≈ 1469328
      expect(goal.getInflationAdjustedTargetAmount()).toBeCloseTo(1469328, 0);
    });

    it('should return nominal amount when inflation rate is 0', () => {
      const goal = new FinancialGoal(
        'Car',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000,
        undefined,
        0,
      );

      expect(goal.getInflationAdjustedTargetAmount()).toBe(500000);
    });

    it('should treat 0% inflation as returning the nominal amount for both goal types', () => {
      const oneTime = new FinancialGoal('House', GoalType.ONE_TIME, '2024-01-01', '2034-01-01', 1000000, undefined, 0);
      const recurring = new FinancialGoal('Vacation', GoalType.RECURRING, '2024-01-01', '2024-12-31', 200000, 3, 0);

      expect(oneTime.getInflationAdjustedTargetAmount()).toBe(1000000);
      expect(recurring.getInflationAdjustedTargetAmount()).toBe(200000);
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

  describe('isGoalActive', () => {
    it('should return true when selected date is within goal period', () => {
      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-12-31',
        100000
      );

      const selectedDate = '2025-06-15';
      expect(isGoalActive(goal, selectedDate)).toBe(true);
    });

    it('should return true when selected date equals start date', () => {
      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-12-31',
        100000
      );

      const selectedDate = '2024-01-01';
      expect(isGoalActive(goal, selectedDate)).toBe(true);
    });

    it('should return true when selected date equals target date', () => {
      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-12-31',
        100000
      );

      const selectedDate = '2026-12-31';
      expect(isGoalActive(goal, selectedDate)).toBe(true);
    });

    it('should return false when selected date is before start date', () => {
      const goal = new FinancialGoal(
        'Future Goal',
        GoalType.ONE_TIME,
        '2025-01-01',
        '2027-12-31',
        100000
      );

      const selectedDate = '2024-12-31';
      expect(isGoalActive(goal, selectedDate)).toBe(false);
    });

    it('should return false when selected date is after target date', () => {
      const goal = new FinancialGoal(
        'Ended Goal',
        GoalType.ONE_TIME,
        '2020-01-01',
        '2023-12-31',
        100000
      );

      const selectedDate = '2024-01-01';
      expect(isGoalActive(goal, selectedDate)).toBe(false);
    });

    it('should work correctly with recurring goals', () => {
      const cleanup = mockTodayDate('2024-06-15');

      const goal = new FinancialGoal(
        'Annual Vacation',
        GoalType.RECURRING,
        '2024-01-01',
        '2024-12-31',
        100000
      );

      // Today's date (for recurring goals, investment starts today)
      expect(isGoalActive(goal, '2024-06-15')).toBe(true);

      // Before today (should be inactive)
      expect(isGoalActive(goal, '2024-01-01')).toBe(false);

      // After target date
      expect(isGoalActive(goal, '2025-01-01')).toBe(false);

      cleanup();
    });

    it('should handle edge case with same start and target date', () => {
      const goal = new FinancialGoal(
        'Immediate Goal',
        GoalType.ONE_TIME,
        '2024-06-15',
        '2024-06-15',
        50000
      );

      expect(isGoalActive(goal, '2024-06-15')).toBe(true);
      expect(isGoalActive(goal, '2024-06-14')).toBe(false);
      expect(isGoalActive(goal, '2024-06-16')).toBe(false);
    });

    it('should work with dates in different formats', () => {
      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-12-31',
        100000
      );

      // dayjs should parse these correctly
      expect(isGoalActive(goal, '2025-06-15')).toBe(true);
      expect(isGoalActive(goal, '2024-01-01')).toBe(true);
      expect(isGoalActive(goal, '2026-12-31')).toBe(true);
    });
  });
});