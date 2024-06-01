import { Dispatch } from 'react';
import { FinancialGoal } from '../domain/FinancialGoals';
import { PlannerDataAction } from './plannerDataReducer';
import {
  InvestmentChoiceType,
  InvestmentOptionType,
} from '../domain/InvestmentOptions';

export enum PlannerDataActionType {
  ADD_FINANCIAL_GOAL = 'ADD_FINANCIAL_GOAL',
  UPDATE_ASSETS = 'UPDATE_ASSETS',
  DELETE_FINANCIAL_GOAL = 'DELETE_FINANCIAL_GOAL',
  UPDATE_SHORT_TERM_ASSET = 'UPDATE_SHORT_TERM_ASSET',
  UPDATE_MEDIUM_TERM_ASSET = 'UPDATE_MEDIUM_TERM_ASSET',
  UPDATE_LONG_TERM_ASSET = 'UPDATE_LONG_TERM_ASSET',
  ADD_INVESTMENT_OPTION = 'ADD_INVESTMENT_OPTION',
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
  financialGoal: FinancialGoal,
) {
  dispatch({
    payload: financialGoal,
    type: PlannerDataActionType.DELETE_FINANCIAL_GOAL,
  });
}

export function setShortTermInvestmentPercentage(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentChoiceType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_SHORT_TERM_ASSET,
  });
}

export function setMidTermInvestmentPercentage(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentChoiceType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_MEDIUM_TERM_ASSET,
  });
}

export function setLongTermInvestmentPercentage(
  dispatch: Dispatch<PlannerDataAction>,
  payload: InvestmentChoiceType,
) {
  dispatch({
    payload,
    type: PlannerDataActionType.UPDATE_LONG_TERM_ASSET,
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
