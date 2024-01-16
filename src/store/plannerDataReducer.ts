import { PlannerData } from '../domain/PlannerData';
import { PlannerDataActionType } from './plannerDataActions';

export type PlannerDataAction = {
  payload: any;
  type: PlannerDataActionType;
};

export const initialPlannerData: PlannerData = new PlannerData();

export function plannerDataReducer(
  state = initialPlannerData,
  action: PlannerDataAction,
): PlannerData {
  switch (action.type) {
    case PlannerDataActionType.ADD_FINANCIAL_GOAL:
      return new PlannerData(
        [...state.financialGoals, action.payload],
        state.assets,
      );

    case PlannerDataActionType.UPDATE_ASSETS:
      return new PlannerData(state.financialGoals, action.payload);

    case PlannerDataActionType.DELETE_FINANCIAL_GOAL:
      const financialGoals = [...state.financialGoals];
      financialGoals.splice(action.payload, 1);
      return new PlannerData(financialGoals, state.assets);

    default:
      return state;
  }
}
