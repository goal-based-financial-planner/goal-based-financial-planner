import { Dispatch } from 'react';
import { FinancialGoal } from '../domain/FinancialGoals';
import { PlannerDataAction } from './plannerDataReducer';
import { Assets } from '../domain/AssetData';

export enum PlannerDataActionType {
  ADD_FINANCIAL_GOAL = 'ADD_FINANCIAL_GOAL',
  UPDATE_ASSETS = 'UPDATE_ASSETS',
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

export function updateAssets(
  dispatch: Dispatch<PlannerDataAction>,
  assetsData: Assets,
) {
  dispatch({
    payload: assetsData,
    type: PlannerDataActionType.UPDATE_ASSETS,
  });
}
