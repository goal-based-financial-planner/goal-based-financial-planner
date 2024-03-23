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
        state.investmentAllocations,
      );

    case PlannerDataActionType.UPDATE_ASSETS:
      return new PlannerData(state.financialGoals, action.payload);

    case PlannerDataActionType.UPDATE_SHORT_TERM_ASSET:
      return new PlannerData(state.financialGoals, {
        ...state.investmentAllocations,
        [TermType.SHORT_TERM]: {
          ...state.investmentAllocations['Short Term'],
          ...action.payload,
        },
      });

    case PlannerDataActionType.UPDATE_MID_TERM_ASSET:
      return new PlannerData(state.financialGoals, {
        ...state.investmentAllocations,
        [TermType.MEDIUM_TERM]: {
          ...state.investmentAllocations['Medium Term'],
          ...action.payload,
        },
      });
    case PlannerDataActionType.UPDATE_LONG_TERM_ASSET:
      return new PlannerData(state.financialGoals, {
        ...state.investmentAllocations,
        [TermType.LONG_TERM]: {
          ...state.investmentAllocations['Long Term'],
          ...action.payload,
        },
      });

    case PlannerDataActionType.DELETE_FINANCIAL_GOAL:
      const financialGoals = [...state.financialGoals];
      const assets = state.investmentAllocations;
      financialGoals.splice(action.payload, 1);

      const allSelectedTermTypes = new Set(
        financialGoals.map((g) => g.getTermType()),
      );

      if (!allSelectedTermTypes.has(TermType.SHORT_TERM)) {
        assets['Short Term'] = [];
      }

      if (!allSelectedTermTypes.has(TermType.MEDIUM_TERM)) {
        assets['Medium Term'] = [];
      }

      if (!allSelectedTermTypes.has(TermType.LONG_TERM)) {
        assets['Long Term'] = [];
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
      return new PlannerData(financialGoals, parsedState.investmentAllocations);
    } catch {}
  }
  return new PlannerData();
}

export function persistPlannerData(plannerData: PlannerData) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannerData));
}
