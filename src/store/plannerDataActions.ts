import { Dispatch } from 'react';
import { FinancialGoal } from '../domain/FinancialGoals';
import { PlannerDataAction } from './plannerDataReducer';

export enum PlannerDataActionType {
  ADD_FINANCIAL_GOAL = 'ADD_FINANCIAL_GOAL',
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
