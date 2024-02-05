import { FinancialGoal } from '../domain/FinancialGoals';
import { PlannerData } from '../domain/PlannerData';
import { TermType } from '../types/enums';
import { PlannerDataActionType } from './plannerDataActions';

const LOCAL_STORAGE_KEY = 'plannerData';

export type PlannerDataAction = {
  payload: any;
  type: PlannerDataActionType;
};

export const initialPlannerData: PlannerData = getInitialData();

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

    case PlannerDataActionType.UPDATE_SHORT_TERM_ASSET:
      return new PlannerData(state.financialGoals, {
        ...state.assets,
        shortTermGoals: {
          ...state.assets.shortTermGoals,
          ...action.payload,
        },
      });

    case PlannerDataActionType.UPDATE_MID_TERM_ASSET:
      return new PlannerData(state.financialGoals, {
        ...state.assets,
        midTermGoals: {
          ...state.assets.midTermGoals,
          ...action.payload,
        },
      });
    case PlannerDataActionType.UPDATE_LONG_TERM_ASSET:
      return new PlannerData(state.financialGoals, {
        ...state.assets,
        longTermGoals: {
          ...state.assets.longTermGoals,
          ...action.payload,
        },
      });

    case PlannerDataActionType.DELETE_FINANCIAL_GOAL:
      const financialGoals = [...state.financialGoals];
      const assets = state.assets;
      financialGoals.splice(action.payload, 1);

      const allSelecteTermTypes = new Set(
        financialGoals.map((g) => g.getTermType()),
      );

      if (!allSelecteTermTypes.has(TermType.SHORT_TERM)) {
        assets.shortTermGoals = {};
      }

      if (!allSelecteTermTypes.has(TermType.MEDIUM_TERM)) {
        assets.midTermGoals = {};
      }

      if (!allSelecteTermTypes.has(TermType.LONG_TERM)) {
        assets.longTermGoals = {};
      }

      return new PlannerData(financialGoals, assets);

    default:
      return state;
  }
}

export function getInitialData() {
  const localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY) as string;

  if (localStorageData) {
    try {
      const parsedState = JSON.parse(localStorageData) as PlannerData;
      const financialGoals = parsedState.financialGoals.map(
        (e: FinancialGoal) =>
          new FinancialGoal(
            e.goalName,
            e.startYear,
            e.targetYear,
            e.targetAmount,
          ),
      );
      return new PlannerData(financialGoals, parsedState.assets);
    } catch {}
  }
  return new PlannerData();
}

export function persistPlannerData(plannerData: PlannerData) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannerData));
}
