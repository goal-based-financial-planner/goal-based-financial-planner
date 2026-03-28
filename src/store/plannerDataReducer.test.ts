import {
  plannerDataReducer,
  getInitialData,
  PlannerDataAction,
} from './plannerDataReducer';
import { PlannerData } from '../domain/PlannerData';
import { FinancialGoal } from '../domain/FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import { PlannerDataActionType } from './plannerDataActions';
import { SIPEntry } from '../types/investmentLog';

describe('plannerDataReducer', () => {
  const initialState = new PlannerData([], {
    [TermType.SHORT_TERM]: [],
    [TermType.MEDIUM_TERM]: [],
    [TermType.LONG_TERM]: [],
  });

  describe('Initialization', () => {
    it('should return empty PlannerData', () => {
      const data = getInitialData();
      expect(data.financialGoals).toEqual([]);
      expect(data.investmentAllocations).toEqual({
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });
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

  describe('ADD_INVESTMENT_LOG_ENTRY', () => {
    it('should append a SIP entry to investmentLogs', () => {
      const entry: SIPEntry = { id: 'sip-1', name: 'Axis Liquid', type: 'Liquid Funds', monthlyAmount: 20000 };
      const action: PlannerDataAction = {
        type: PlannerDataActionType.ADD_INVESTMENT_LOG_ENTRY,
        payload: { entry },
      };

      const newState = plannerDataReducer(initialState, action);

      expect(newState.investmentLogs).toHaveLength(1);
      expect(newState.investmentLogs[0]).toEqual(entry);
    });

    it('should preserve existing SIP entries when adding a new one', () => {
      const existing: SIPEntry = { id: 'sip-1', name: 'Existing', type: 'Index Funds', monthlyAmount: 10000 };
      const stateWithSIP = new PlannerData([], { [TermType.SHORT_TERM]: [], [TermType.MEDIUM_TERM]: [], [TermType.LONG_TERM]: [] }, [existing]);
      const newEntry: SIPEntry = { id: 'sip-2', name: 'New Fund', type: 'Liquid Funds', monthlyAmount: 5000 };

      const action: PlannerDataAction = {
        type: PlannerDataActionType.ADD_INVESTMENT_LOG_ENTRY,
        payload: { entry: newEntry },
      };

      const newState = plannerDataReducer(stateWithSIP, action);

      expect(newState.investmentLogs).toHaveLength(2);
    });
  });

  describe('EDIT_INVESTMENT_LOG_ENTRY', () => {
    it('should update name, type, and monthlyAmount of matching entry', () => {
      const entry: SIPEntry = { id: 'sip-1', name: 'Old Name', type: 'Liquid Funds', monthlyAmount: 10000 };
      const stateWithSIP = new PlannerData([], { [TermType.SHORT_TERM]: [], [TermType.MEDIUM_TERM]: [], [TermType.LONG_TERM]: [] }, [entry]);

      const action: PlannerDataAction = {
        type: PlannerDataActionType.EDIT_INVESTMENT_LOG_ENTRY,
        payload: { entryId: 'sip-1', name: 'New Name', type: 'Index Funds', monthlyAmount: 25000 },
      };

      const newState = plannerDataReducer(stateWithSIP, action);

      expect(newState.investmentLogs[0].name).toBe('New Name');
      expect(newState.investmentLogs[0].type).toBe('Index Funds');
      expect(newState.investmentLogs[0].monthlyAmount).toBe(25000);
    });

    it('should store expectedReturnPct for custom type edits', () => {
      const entry: SIPEntry = { id: 'sip-1', name: 'PPF', type: 'PPF', monthlyAmount: 12500 };
      const stateWithSIP = new PlannerData([], { [TermType.SHORT_TERM]: [], [TermType.MEDIUM_TERM]: [], [TermType.LONG_TERM]: [] }, [entry]);

      const action: PlannerDataAction = {
        type: PlannerDataActionType.EDIT_INVESTMENT_LOG_ENTRY,
        payload: { entryId: 'sip-1', name: 'PPF', type: 'PPF', monthlyAmount: 12500, expectedReturnPct: 7.1 },
      };

      const newState = plannerDataReducer(stateWithSIP, action);

      expect(newState.investmentLogs[0].expectedReturnPct).toBe(7.1);
    });

    it('should not modify other entries', () => {
      const e1: SIPEntry = { id: 'sip-1', name: 'Fund A', type: 'Liquid Funds', monthlyAmount: 10000 };
      const e2: SIPEntry = { id: 'sip-2', name: 'Fund B', type: 'Index Funds', monthlyAmount: 20000 };
      const stateWithSIPs = new PlannerData([], { [TermType.SHORT_TERM]: [], [TermType.MEDIUM_TERM]: [], [TermType.LONG_TERM]: [] }, [e1, e2]);

      const action: PlannerDataAction = {
        type: PlannerDataActionType.EDIT_INVESTMENT_LOG_ENTRY,
        payload: { entryId: 'sip-1', name: 'Updated', type: 'Liquid Funds', monthlyAmount: 15000 },
      };

      const newState = plannerDataReducer(stateWithSIPs, action);

      expect(newState.investmentLogs[1]).toEqual(e2);
    });
  });

  describe('DELETE_INVESTMENT_LOG_ENTRY', () => {
    it('should remove the SIP entry with the matching ID', () => {
      const e1: SIPEntry = { id: 'sip-1', name: 'Fund A', type: 'Liquid Funds', monthlyAmount: 10000 };
      const e2: SIPEntry = { id: 'sip-2', name: 'Fund B', type: 'Index Funds', monthlyAmount: 20000 };
      const stateWithSIPs = new PlannerData([], { [TermType.SHORT_TERM]: [], [TermType.MEDIUM_TERM]: [], [TermType.LONG_TERM]: [] }, [e1, e2]);

      const action: PlannerDataAction = {
        type: PlannerDataActionType.DELETE_INVESTMENT_LOG_ENTRY,
        payload: { entryId: 'sip-1' },
      };

      const newState = plannerDataReducer(stateWithSIPs, action);

      expect(newState.investmentLogs).toHaveLength(1);
      expect(newState.investmentLogs[0].id).toBe('sip-2');
    });
  });

  describe('Default case', () => {
    it('should return current state for unknown action type', () => {
      const action: PlannerDataAction = {
        type: 'UNKNOWN_ACTION' as any,
        payload: '' as any, // Using empty string as a valid payload type
      };

      const newState = plannerDataReducer(initialState, action);

      expect(newState).toBe(initialState);
    });
  });

});

