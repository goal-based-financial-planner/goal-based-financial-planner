import { Dispatch } from 'react';
import { FinancialGoal } from '../domain/FinancialGoals';
import { PlannerDataAction } from './plannerDataReducer';
import {
  InvestmentAllocationsType,
  InvestmentChoiceType,
  InvestmentOptionType,
} from '../domain/InvestmentOptions';
import {
  AddSIPEntryPayload,
  EditSIPEntryPayload,
  DeleteSIPEntryPayload,
  SIPEntry,
} from '../types/investmentLog';

export enum PlannerDataActionType {
  ADD_FINANCIAL_GOAL = 'ADD_FINANCIAL_GOAL',
  UPDATE_INVESTMENT_ALLOCATIONS = 'UPDATE_INVESTMENT_ALLOCATIONS',
  DELETE_FINANCIAL_GOAL = 'DELETE_FINANCIAL_GOAL',
  UPDATE_FINANCIAL_GOAL = 'UPDATE_FINANCIAL_GOAL',
  UPDATE_SHORT_TERM_INVESTMENT = 'UPDATE_SHORT_TERM_INVESTMENT',
  UPDATE_MEDIUM_TERM_INVESTMENT = 'UPDATE_MEDIUM_TERM_INVESTMENT',
  UPDATE_LONG_TERM_INVESTMENT = 'UPDATE_LONG_TERM_INVESTMENT',
  ADD_INVESTMENT_OPTION = 'ADD_INVESTMENT_OPTION',
  ADD_INVESTMENT_LOG_ENTRY = 'ADD_INVESTMENT_LOG_ENTRY',
  EDIT_INVESTMENT_LOG_ENTRY = 'EDIT_INVESTMENT_LOG_ENTRY',
  DELETE_INVESTMENT_LOG_ENTRY = 'DELETE_INVESTMENT_LOG_ENTRY',
  UPDATE_GOAL_INFLATION_RATE = 'UPDATE_GOAL_INFLATION_RATE',
  UPDATE_GOAL_STATUS = 'UPDATE_GOAL_STATUS',
  INITIALIZE = 'INITIALIZE',
}

export function addFinancialGoal(
  dispatch: Dispatch<PlannerDataAction>,
  financialGoal: FinancialGoal,
) {
  dispatch({
    payload: financialGoal,
    type: PlannerDataActionType.ADD_FINANCIAL_GOAL,
  });
}

export function deleteFinancialGoal(
  dispatch: Dispatch<PlannerDataAction>,
  financialGoalId: string,
) {
  dispatch({
    payload: financialGoalId,
    type: PlannerDataActionType.DELETE_FINANCIAL_GOAL,
  });
}

export function updateFinancialGoal(
  dispatch: Dispatch<PlannerDataAction>,
  financialGoal: FinancialGoal | { id: string; goalName: string; startYear: string; targetYear: string; targetAmount: number; recurringDurationYears?: number; inflationRate?: number },
) {
  dispatch({
    payload: financialGoal,
    type: PlannerDataActionType.UPDATE_FINANCIAL_GOAL,
  });
}

export function setShortTermInvestmentPercentage(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentChoiceType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_SHORT_TERM_INVESTMENT,
  });
}

export function setMidTermInvestmentPercentage(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentChoiceType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_MEDIUM_TERM_INVESTMENT,
  });
}

export function setLongTermInvestmentPercentage(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentChoiceType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_LONG_TERM_INVESTMENT,
  });
}

export function addInvestmentOption(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentOptionType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.ADD_INVESTMENT_OPTION,
  });
}

export function updateInvestmentAllocation(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentAllocationsType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS,
  });
}

export function addInvestmentLogEntry(
  dispatch: Dispatch<PlannerDataAction>,
  entry: SIPEntry,
) {
  const payload: AddSIPEntryPayload = { entry };
  dispatch({ payload, type: PlannerDataActionType.ADD_INVESTMENT_LOG_ENTRY });
}

export function editInvestmentLogEntry(
  dispatch: Dispatch<PlannerDataAction>,
  entryId: string,
  name: string,
  type: string,
  monthlyAmount: number,
  expectedReturnPct?: number,
  startDate?: string,
) {
  const payload: EditSIPEntryPayload = { entryId, name, type, monthlyAmount, expectedReturnPct, startDate };
  dispatch({ payload, type: PlannerDataActionType.EDIT_INVESTMENT_LOG_ENTRY });
}

export function deleteInvestmentLogEntry(
  dispatch: Dispatch<PlannerDataAction>,
  entryId: string,
) {
  const payload: DeleteSIPEntryPayload = { entryId };
  dispatch({ payload, type: PlannerDataActionType.DELETE_INVESTMENT_LOG_ENTRY });
}

export function updateGoalInflationRate(
  dispatch: Dispatch<PlannerDataAction>,
  goalId: string,
  inflationRate: number,
) {
  dispatch({ payload: { id: goalId, inflationRate }, type: PlannerDataActionType.UPDATE_GOAL_INFLATION_RATE });
}

export type GoalStatusUpdate = {
  id: string;
  /** null clears it. */
  completion?: FinancialGoal['completion'] | null;
  reopened?: boolean;
  archived?: boolean;
};

export function markGoalCompleted(dispatch: Dispatch<PlannerDataAction>, id: string, at: string, value: number) {
  dispatch({ payload: { id, completion: { at, value } }, type: PlannerDataActionType.UPDATE_GOAL_STATUS });
}

export function acknowledgeGoalCompletion(dispatch: Dispatch<PlannerDataAction>, goal: FinancialGoal) {
  if (!goal.completion) return;
  dispatch({
    payload: { id: goal.id, completion: { ...goal.completion, acknowledged: true } },
    type: PlannerDataActionType.UPDATE_GOAL_STATUS,
  });
}

export function reopenGoal(dispatch: Dispatch<PlannerDataAction>, id: string) {
  dispatch({ payload: { id, completion: null, reopened: true, archived: false }, type: PlannerDataActionType.UPDATE_GOAL_STATUS });
}

export function setGoalArchived(dispatch: Dispatch<PlannerDataAction>, id: string, archived: boolean) {
  dispatch({ payload: { id, archived }, type: PlannerDataActionType.UPDATE_GOAL_STATUS });
}
