import { PlannerState, TermType, GoalType } from './enums';

describe('Enums', () => {
  describe('PlannerState', () => {
    it('should have GOALS state', () => {
      expect(PlannerState.GOALS).toBe('goals');
    });

    it('should have INVESTMENT_ALLOCATION state', () => {
      expect(PlannerState.INVESTMENT_ALLOCATION).toBe('investment_allocation');
    });

    it('should have PORTFOLIO_SUMMARY state', () => {
      expect(PlannerState.PORTFOLIO_SUMMARY).toBe('portfolio_summary');
    });

    it('should contain all expected planner states', () => {
      const states = Object.values(PlannerState);
      expect(states).toHaveLength(3);
      expect(states).toContain('goals');
      expect(states).toContain('investment_allocation');
      expect(states).toContain('portfolio_summary');
    });
  });

  describe('TermType', () => {
    it('should have SHORT_TERM type', () => {
      expect(TermType.SHORT_TERM).toBe('Short Term');
    });

    it('should have MEDIUM_TERM type', () => {
      expect(TermType.MEDIUM_TERM).toBe('Medium Term');
    });

    it('should have LONG_TERM type', () => {
      expect(TermType.LONG_TERM).toBe('Long Term');
    });

    it('should contain all expected term types', () => {
      const types = Object.values(TermType);
      expect(types).toHaveLength(3);
      expect(types).toContain('Short Term');
      expect(types).toContain('Medium Term');
      expect(types).toContain('Long Term');
    });
  });

  describe('GoalType', () => {
    it('should have ONE_TIME type', () => {
      expect(GoalType.ONE_TIME).toBe('One Time');
    });

    it('should have RECURRING type', () => {
      expect(GoalType.RECURRING).toBe('Recurring');
    });

    it('should contain all expected goal types', () => {
      const types = Object.values(GoalType);
      expect(types).toHaveLength(2);
      expect(types).toContain('One Time');
      expect(types).toContain('Recurring');
    });
  });
});
