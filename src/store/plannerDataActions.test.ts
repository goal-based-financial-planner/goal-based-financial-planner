import { Dispatch } from 'react';
import {
  PlannerDataActionType,
  addFinancialGoal,
  deleteFinancialGoal,
  updateFinancialGoal,
  setShortTermInvestmentPercentage,
  setMidTermInvestmentPercentage,
  setLongTermInvestmentPercentage,
  updateInvestmentAllocation,
  addInvestmentOption,
} from './plannerDataActions';
import { PlannerDataAction } from './plannerDataReducer';
import { FinancialGoal } from '../domain/FinancialGoals';
import { GoalType, TermType } from '../types/enums';

describe('Planner Data Action Creators', () => {
  let dispatchMock: jest.MockedFunction<Dispatch<PlannerDataAction>>;

  beforeEach(() => {
    dispatchMock = jest.fn();
  });

  describe('addFinancialGoal', () => {
    it('should dispatch ADD_FINANCIAL_GOAL with goal payload', () => {
      const goal = new FinancialGoal(
        'Test Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      addFinancialGoal(dispatchMock, goal);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.ADD_FINANCIAL_GOAL,
        payload: goal,
      });
    });
  });

  describe('deleteFinancialGoal', () => {
    it('should dispatch DELETE_FINANCIAL_GOAL with goal ID', () => {
      const goalId = 'test-goal-id-123';

      deleteFinancialGoal(dispatchMock, goalId);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.DELETE_FINANCIAL_GOAL,
        payload: goalId,
      });
    });
  });

  describe('updateFinancialGoal', () => {
    it('should dispatch UPDATE_FINANCIAL_GOAL with update payload', () => {
      const updatePayload = {
        id: 'test-id',
        goalName: 'Updated Goal',
        startYear: '2024-01-01',
        targetYear: '2030-01-01',
        targetAmount: 750000,
      };

      updateFinancialGoal(dispatchMock, updatePayload);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.UPDATE_FINANCIAL_GOAL,
        payload: updatePayload,
      });
    });
  });

  describe('setShortTermInvestmentPercentage', () => {
    it('should dispatch UPDATE_SHORT_TERM_INVESTMENT with payload', () => {
      const payload = {
        investmentName: 'FD',
        investmentPercentage: 100,
        expectedReturnPercentage: 6,
      };

      setShortTermInvestmentPercentage(dispatchMock, payload);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.UPDATE_SHORT_TERM_INVESTMENT,
        payload,
      });
    });
  });

  describe('setMidTermInvestmentPercentage', () => {
    it('should dispatch UPDATE_MEDIUM_TERM_INVESTMENT with payload', () => {
      const payload = {
        investmentName: 'Balanced',
        investmentPercentage: 50,
        expectedReturnPercentage: 10,
      };

      setMidTermInvestmentPercentage(dispatchMock, payload);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.UPDATE_MEDIUM_TERM_INVESTMENT,
        payload,
      });
    });
  });

  describe('setLongTermInvestmentPercentage', () => {
    it('should dispatch UPDATE_LONG_TERM_INVESTMENT with payload', () => {
      const payload = {
        investmentName: 'Equity',
        investmentPercentage: 70,
        expectedReturnPercentage: 12,
      };

      setLongTermInvestmentPercentage(dispatchMock, payload);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.UPDATE_LONG_TERM_INVESTMENT,
        payload,
      });
    });
  });

  describe('updateInvestmentAllocation', () => {
    it('should dispatch UPDATE_INVESTMENT_ALLOCATIONS with full allocations', () => {
      const allocations = {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'FD',
            investmentPercentage: 100,
            expectedReturnPercentage: 6,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      };

      updateInvestmentAllocation(dispatchMock, allocations);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS,
        payload: allocations,
      });
    });
  });

  describe('addInvestmentOption', () => {
    it('should dispatch ADD_INVESTMENT_OPTION with option payload', () => {
      const option = {
        investmentName: 'Custom Fund',
        materialIconName: 'trending_up',
      };

      addInvestmentOption(dispatchMock, option);

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: PlannerDataActionType.ADD_INVESTMENT_OPTION,
        payload: option,
      });
    });
  });

  describe('Integration - multiple actions', () => {
    it('should dispatch multiple actions in sequence', () => {
      const goal = new FinancialGoal(
        'Goal',
        GoalType.ONE_TIME,
        '2024-01-01',
        '2030-01-01',
        500000
      );

      addFinancialGoal(dispatchMock, goal);
      deleteFinancialGoal(dispatchMock, goal.id);

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock.mock.calls[0][0].type).toBe(
        PlannerDataActionType.ADD_FINANCIAL_GOAL
      );
      expect(dispatchMock.mock.calls[1][0].type).toBe(
        PlannerDataActionType.DELETE_FINANCIAL_GOAL
      );
    });
  });
});
