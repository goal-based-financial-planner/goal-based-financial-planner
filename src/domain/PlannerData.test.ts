import { PlannerData } from './PlannerData';
import { FinancialGoal } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';

describe('PlannerData', () => {
  describe('Goal Summary', () => {
    it('should return empty summary for no goals', () => {
      const planner = new PlannerData([], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const summary = planner.getFinancialGoalSummary();
      
      expect(summary).toHaveLength(3);
      expect(summary.every((s) => s.numberOfGoals === 0)).toBe(true);
    });

    it('should count goals by term type', () => {
      const goals = [
        new FinancialGoal('Goal 1', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 100000), // Short
        new FinancialGoal('Goal 2', GoalType.ONE_TIME, '2024-01-01', '2026-06-01', 100000), // Short
        new FinancialGoal('Goal 3', GoalType.ONE_TIME, '2024-01-01', '2028-01-01', 200000), // Medium
        new FinancialGoal('Goal 4', GoalType.ONE_TIME, '2024-01-01', '2035-01-01', 500000), // Long
        new FinancialGoal('Goal 5', GoalType.ONE_TIME, '2024-01-01', '2040-01-01', 1000000), // Long
      ];

      const planner = new PlannerData(goals, {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const summary = planner.getFinancialGoalSummary();
      
      const shortTerm = summary.find((s) => s.termType === TermType.SHORT_TERM);
      const mediumTerm = summary.find((s) => s.termType === TermType.MEDIUM_TERM);
      const longTerm = summary.find((s) => s.termType === TermType.LONG_TERM);

      expect(shortTerm?.numberOfGoals).toBe(2);
      expect(mediumTerm?.numberOfGoals).toBe(1);
      expect(longTerm?.numberOfGoals).toBe(2);
    });

    it('should include all term types in summary even if count is 0', () => {
      const goals = [
        new FinancialGoal('Goal', GoalType.ONE_TIME, '2024-01-01', '2025-01-01', 100000), // Short only
      ];

      const planner = new PlannerData(goals, {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const summary = planner.getFinancialGoalSummary();
      
      expect(summary).toHaveLength(3);
      expect(summary.map((s) => s.termType)).toContain(TermType.SHORT_TERM);
      expect(summary.map((s) => s.termType)).toContain(TermType.MEDIUM_TERM);
      expect(summary.map((s) => s.termType)).toContain(TermType.LONG_TERM);
    });
  });

  describe('Goal Summary Text', () => {
    it('should return empty string for no goals', () => {
      const planner = new PlannerData([], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      expect(planner.getGoalSummaryAsText()).toBe('');
    });

    it('should format single term type correctly', () => {
      const goals = [
        new FinancialGoal('Goal 1', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 100000),
        new FinancialGoal('Goal 2', GoalType.ONE_TIME, '2024-01-01', '2026-06-01', 100000),
      ];

      const planner = new PlannerData(goals, {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      expect(planner.getGoalSummaryAsText()).toBe('2 Short Term');
    });

    it('should format two term types with "and"', () => {
      const goals = [
        new FinancialGoal('Goal 1', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 100000), // Short
        new FinancialGoal('Goal 2', GoalType.ONE_TIME, '2024-01-01', '2035-01-01', 500000), // Long
      ];

      const planner = new PlannerData(goals, {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      expect(planner.getGoalSummaryAsText()).toBe('1 Short Term and  1 Long Term');
    });

    it('should format three term types with comma and "and"', () => {
      const goals = [
        new FinancialGoal('Goal 1', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 100000), // Short
        new FinancialGoal('Goal 2', GoalType.ONE_TIME, '2024-01-01', '2028-01-01', 200000), // Medium
        new FinancialGoal('Goal 3', GoalType.ONE_TIME, '2024-01-01', '2035-01-01', 500000), // Long
        new FinancialGoal('Goal 4', GoalType.ONE_TIME, '2024-01-01', '2040-01-01', 1000000), // Long
      ];

      const planner = new PlannerData(goals, {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const text = planner.getGoalSummaryAsText();
      
      expect(text).toContain('1 Short Term');
      expect(text).toContain('1 Medium Term');
      expect(text).toContain('2 Long Term');
      expect(text).toContain(' and ');
      expect(text).toMatch(/,.*and/); // Contains comma before "and"
    });

    it('should skip term types with zero goals', () => {
      const goals = [
        new FinancialGoal('Goal 1', GoalType.ONE_TIME, '2024-01-01', '2026-01-01', 100000), // Short
        new FinancialGoal('Goal 2', GoalType.ONE_TIME, '2024-01-01', '2026-06-01', 100000), // Short
        // No medium or long term goals
      ];

      const planner = new PlannerData(goals, {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const text = planner.getGoalSummaryAsText();
      
      expect(text).toBe('2 Short Term');
      expect(text).not.toContain('Medium Term');
      expect(text).not.toContain('Long Term');
    });
  });

  describe('Construction', () => {
    it('should initialize with empty goals and allocations', () => {
      const planner = new PlannerData();
      
      expect(planner.financialGoals).toEqual([]);
      expect(planner.investmentAllocations).toEqual({
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });
    });

    it('should initialize with provided goals and allocations', () => {
      const goals = [
        new FinancialGoal('Goal', GoalType.ONE_TIME, '2024-01-01', '2030-01-01', 500000),
      ];
      const allocations = {
        [TermType.SHORT_TERM]: [{ investmentName: 'FD', investmentPercentage: 100, expectedReturnPercentage: 6 }],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      };

      const planner = new PlannerData(goals, allocations);
      
      expect(planner.financialGoals).toHaveLength(1);
      expect(planner.investmentAllocations[TermType.SHORT_TERM]).toHaveLength(1);
    });
  });
});
