import { PlannerData } from '../domain/PlannerData';
import { PlannerDataActionType } from './plannerDataActions';

export type PlannerDataAction = {
  payload: any;
  type: PlannerDataActionType;
};

export const initialPlannerData: PlannerData = {
  financialGoals: [],
};

export function plannerDataReducer(
  state = initialPlannerData,
  action: PlannerDataAction,
) {
  switch (action.type) {
    case PlannerDataActionType.ADD_FINANCIAL_GOAL:
      return {
        ...state,
        financialGoals: [...state.financialGoals, action.payload],
      };
    default:
      return state;
  }
}
