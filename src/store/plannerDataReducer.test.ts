import {
  plannerDataReducer,
  getInitialData,
  persistPlannerData,
  PlannerDataAction,
} from './plannerDataReducer';
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import { PlannerDataActionType } from './plannerDataActions';

describe('plannerDataReducer', () => {
  const initialState = new PlannerData([], {
    [TermType.SHORT_TERM]: [],
    [TermType.MEDIUM_TERM]: [],
    [TermType.LONG_TERM]: [],
  });

  describe('Initialization', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should return empty PlannerData when localStorage is empty', () => {
      const data = getInitialData();

      expect(data.financialGoals).toEqual([]);
      expect(data.investmentAllocations).toEqual({
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });
    });

    it('should parse valid persisted state', () => {
      const validState = {
        financialGoals: [
          {
            id: 'test123',
            goalName: 'Test Goal',
            goalType: GoalType.ONE_TIME,
            startDate: '2024-01-01',
            targetDate: '2030-01-01',
            targetAmount: 500000,
          },
        ],
        investmentAllocations: {
          [TermType.SHORT_TERM]: [],
          [TermType.MEDIUM_TERM]: [],
          [TermType.LONG_TERM]: [
            {
              investmentName: 'Equity',
              investmentPercentage: 100,
              expectedReturnPercentage: 12,
            },
          ],
        },
      };

      localStorage.setItem('plannerData', JSON.stringify(validState));
      const data = getInitialData();

      expect(data.financialGoals).toHaveLength(1);
      expect(data.financialGoals[0]).toBeInstanceOf(FinancialGoal);
      expect(data.financialGoals[0].goalName).toBe('Test Goal');
      expect(data.investmentAllocations[TermType.LONG_TERM]).toHaveLength(1);
    });

    it('should handle malformed JSON gracefully', () => {
      localStorage.setItem('plannerData', 'invalid-json{');
      
      const data = getInitialData();

      expect(data.financialGoals).toEqual([]);
      expect(data.investmentAllocations).toEqual({
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });
    });

    it('should reconstruct FinancialGoal instances correctly', () => {
      const validState = {
        financialGoals: [
          {
            id: 'test123',
            goalName: 'Retirement',
            goalType: GoalType.ONE_TIME,
            startDate: '2024-01-01',
            targetDate: '2044-01-01',
            targetAmount: 5000000,
          },
        ],
        investmentAllocations: {
          [TermType.SHORT_TERM]: [],
          [TermType.MEDIUM_TERM]: [],
          [TermType.LONG_TERM]: [],
        },
      };

      localStorage.setItem('plannerData', JSON.stringify(validState));
      const data = getInitialData();

      // Verify methods work (proving it's a real FinancialGoal instance)
      expect(data.financialGoals[0].getTerm()).toBe(20);
      expect(data.financialGoals[0].getTermType()).toBe(TermType.LONG_TERM);
    });
  });

  describe('ADD_FINANCIAL_GOAL', () => {
    it('should add a new financial goal', () => {
      const newGoal = new FinancialGoal(
        'Vacation',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        200000
      );

      const action: PlannerDataAction = {
        type: PlannerDataActionType.ADD_FINANCIAL_GOAL,
        payload: newGoal,
      };

      const newState = plannerDataReducer(initialState, action);

      expect(newState.financialGoals).toHaveLength(1);
      expect(newState.financialGoals[0]).toBe(newGoal);
    });

    it('should add default investment allocations for new term type', () => {
      const shortTermGoal = new FinancialGoal(
        'Emergency Fund',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        200000
      );

      const action: PlannerDataAction = {
        type: PlannerDataActionType.ADD_FINANCIAL_GOAL,
        payload: shortTermGoal,
      };

      const newState = plannerDataReducer(initialState, action);

      expect(newState.investmentAllocations[TermType.SHORT_TERM].length).toBeGreaterThan(0);
    });

    it('should not duplicate allocations if term type already has them', () => {
      const stateWithAllocations = new PlannerData([], {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'Custom',
            investmentPercentage: 100,
            expectedReturnPercentage: 8,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const newGoal = new FinancialGoal(
        'Another Short Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        100000
      );

      const action: PlannerDataAction = {
        type: PlannerDataActionType.ADD_FINANCIAL_GOAL,
        payload: newGoal,
      };

      const newState = plannerDataReducer(stateWithAllocations, action);

      // Should still have just the custom allocation, not duplicated
      expect(newState.investmentAllocations[TermType.SHORT_TERM]).toHaveLength(1);
      expect(newState.investmentAllocations[TermType.SHORT_TERM][0].investmentName).toBe('Custom');
    });
  });

  describe('DELETE_FINANCIAL_GOAL', () => {
    it('should remove the specified goal', () => {
      const goal1 = new FinancialGoal(
        'Goal 1',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        100000
      );
      const goal2 = new FinancialGoal(
        'Goal 2',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2028-01-01',
        200000
      );

      const state = new PlannerData([goal1, goal2], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.DELETE_FINANCIAL_GOAL,
        payload: goal1.id,
      };

      const newState = plannerDataReducer(state, action);

      expect(newState.financialGoals).toHaveLength(1);
      expect(newState.financialGoals[0].id).toBe(goal2.id);
    });

    it('should clear allocations when last goal of term type is deleted', () => {
      const goal = new FinancialGoal(
        'Only Short Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        100000
      );

      const state = new PlannerData([goal], {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'FD',
            investmentPercentage: 100,
            expectedReturnPercentage: 6,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.DELETE_FINANCIAL_GOAL,
        payload: goal.id,
      };

      const newState = plannerDataReducer(state, action);

      expect(newState.financialGoals).toHaveLength(0);
      expect(newState.investmentAllocations[TermType.SHORT_TERM]).toEqual([]);
    });

    it('should preserve allocations when other goals of same term type remain', () => {
      const goal1 = new FinancialGoal(
        'Goal 1',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-01-01',
        100000
      );
      const goal2 = new FinancialGoal(
        'Goal 2',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2026-06-01',
        150000
      );

      const state = new PlannerData([goal1, goal2], {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'FD',
            investmentPercentage: 100,
            expectedReturnPercentage: 6,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.DELETE_FINANCIAL_GOAL,
        payload: goal1.id,
      };

      const newState = plannerDataReducer(state, action);

      expect(newState.financialGoals).toHaveLength(1);
      expect(newState.investmentAllocations[TermType.SHORT_TERM]).toHaveLength(1);
    });
  });

  describe('UPDATE_FINANCIAL_GOAL', () => {
    it('should update goal fields correctly', () => {
      const goal = new FinancialGoal(
        'Original Name',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );
      goal.id = 'test-id-123';

      const state = new PlannerData([goal], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.UPDATE_FINANCIAL_GOAL,
        payload: {
          id: 'test-id-123',
          goalName: 'Updated Name',
          startYear: '2024-06-01',
          targetYear: '2032-01-01',
          targetAmount: 750000,
        },
      };

      const newState = plannerDataReducer(state, action);

      expect(newState.financialGoals[0].goalName).toBe('Updated Name');
      expect(newState.financialGoals[0].startDate).toBe('2024-06-01');
      expect(newState.financialGoals[0].targetDate).toBe('2032-01-01');
      expect(newState.financialGoals[0].targetAmount).toBe(750000);
    });

    it('should not update if goal ID not found', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );
      goal.id = 'test-id-123';

      const state = new PlannerData([goal], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.UPDATE_FINANCIAL_GOAL,
        payload: {
          id: 'non-existent-id',
          goalName: 'Updated',
          startYear: '2024-01-01',
          targetYear: '2030-01-01',
          targetAmount: 999999,
        },
      };

      const newState = plannerDataReducer(state, action);

      // Original goal should remain unchanged
      expect(newState.financialGoals[0].goalName).toBe('Goal');
      expect(newState.financialGoals[0].targetAmount).toBe(500000);
    });

    it('should preserve investment allocations on update', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );
      goal.id = 'test-id';

      const state = new PlannerData([goal], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [
          {
            investmentName: 'Equity',
            investmentPercentage: 100,
            expectedReturnPercentage: 12,
          },
        ],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.UPDATE_FINANCIAL_GOAL,
        payload: {
          id: 'test-id',
          goalName: 'Updated Goal',
          startYear: '2024-01-01',
          targetYear: '2030-01-01',
          targetAmount: 600000,
        },
      };

      const newState = plannerDataReducer(state, action);

      expect(newState.investmentAllocations[TermType.LONG_TERM]).toHaveLength(1);
    });
  });

  describe('UPDATE_INVESTMENT_ALLOCATIONS', () => {
    it('should replace investment allocations', () => {
      const newAllocations = {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'New FD',
            investmentPercentage: 100,
            expectedReturnPercentage: 7,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      };

      const action: PlannerDataAction = {
        type: PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS,
        payload: newAllocations,
      };

      const newState = plannerDataReducer(initialState, action);

      expect(newState.investmentAllocations).toEqual(newAllocations);
      expect(newState.investmentAllocations[TermType.SHORT_TERM][0].investmentName).toBe('New FD');
    });

    it('should preserve financial goals when updating allocations', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      const state = new PlannerData([goal], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      const action: PlannerDataAction = {
        type: PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS,
        payload: {
          [TermType.SHORT_TERM]: [],
          [TermType.MEDIUM_TERM]: [
            {
              investmentName: 'Balanced',
              investmentPercentage: 100,
              expectedReturnPercentage: 10,
            },
          ],
          [TermType.LONG_TERM]: [],
        },
      };

      const newState = plannerDataReducer(state, action);

      expect(newState.financialGoals).toHaveLength(1);
      expect(newState.financialGoals[0].goalName).toBe('Goal');
    });
  });

  describe('Default case', () => {
    it('should return current state for unknown action type', () => {
      const action: PlannerDataAction = {
        type: 'UNKNOWN_ACTION' as any,
        payload: null,
      };

      const newState = plannerDataReducer(initialState, action);

      expect(newState).toBe(initialState);
    });
  });

  describe('persistPlannerData', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store planner data in localStorage', () => {
      const plannerData = new PlannerData([], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      persistPlannerData(plannerData);

      const stored = localStorage.getItem('plannerData');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.financialGoals).toEqual([]);
    });

    it('should update existing data', () => {
      const data1 = new PlannerData([], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });
      const goal = new FinancialGoal(
        'New Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );
      const data2 = new PlannerData([goal], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      persistPlannerData(data1);
      persistPlannerData(data2);

      const stored = JSON.parse(localStorage.getItem('plannerData')!);
      expect(stored.financialGoals).toHaveLength(1);
    });
  });
});
