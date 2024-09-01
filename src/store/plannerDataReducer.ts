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

function updateInvestmentAllocation(
  state: PlannerData,
  action: PlannerDataAction,
  termType: TermType,
) {
  let allocations = state.investmentAllocations[termType];
  allocations = allocations.filter((e) => e.id !== action.payload.id);
  allocations.push(action.payload);

  return new PlannerData(
    state.financialGoals,
    {
      ...state.investmentAllocations,
      [termType]: allocations,
    },
    state.investmentAllocationOptions,
  );
}

export function plannerDataReducer(
  state = initialPlannerData,
  action: PlannerDataAction,
): PlannerData {
  switch (action.type) {
    case PlannerDataActionType.ADD_FINANCIAL_GOAL:
      return new PlannerData(
        [...state.financialGoals, action.payload],
        state.investmentAllocations,
        state.investmentAllocationOptions,
      );

    case PlannerDataActionType.ADD_INVESTMENT_OPTION:
      return new PlannerData(
        state.financialGoals,
        state.investmentAllocations,
        [...state.investmentAllocationOptions, action.payload],
      );

    case PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS:
      return new PlannerData(state.financialGoals, action.payload);

    case PlannerDataActionType.UPDATE_SHORT_TERM_INVESTMENT:
      return updateInvestmentAllocation(state, action, TermType.SHORT_TERM);

    case PlannerDataActionType.UPDATE_MEDIUM_TERM_INVESTMENT:
      return updateInvestmentAllocation(state, action, TermType.MEDIUM_TERM);

    case PlannerDataActionType.UPDATE_LONG_TERM_INVESTMENT:
      return updateInvestmentAllocation(state, action, TermType.LONG_TERM);

    case PlannerDataActionType.DELETE_FINANCIAL_GOAL:
      const financialGoals = [...state.financialGoals];
      const { investmentAllocations } = state;

      const index = financialGoals.findIndex((g) => g.id === action.payload);
      financialGoals.splice(index, 1);

      const allSelectedTermTypes = new Set(
        financialGoals.map((g) => g.getTermType()),
      );

      if (!allSelectedTermTypes.has(TermType.SHORT_TERM)) {
        investmentAllocations['Short Term'] = [];
      }

      if (!allSelectedTermTypes.has(TermType.MEDIUM_TERM)) {
        investmentAllocations['Medium Term'] = [];
      }

      if (!allSelectedTermTypes.has(TermType.LONG_TERM)) {
        investmentAllocations['Long Term'] = [];
      }

      return new PlannerData(financialGoals, investmentAllocations);

    case PlannerDataActionType.UPDATE_FINANCIAL_GOAL: {
      const financialGoals = [...state.financialGoals];
      const updatedPayload = action.payload;
      const goalToBeUpdated = financialGoals.find(
        (g) => g.id === action.payload.id,
      );

      if (goalToBeUpdated) {
        goalToBeUpdated.goalName = updatedPayload.goalName;
        goalToBeUpdated.startYear = updatedPayload.startYear;
        goalToBeUpdated.targetYear = updatedPayload.targetYear;
        goalToBeUpdated.targetAmount = updatedPayload.targetAmount;
      }

      return new PlannerData(financialGoals, state.investmentAllocations);
    }

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

      return new PlannerData(
        financialGoals,
        parsedState.investmentAllocations,
        parsedState.investmentAllocationOptions,
      );
    } catch {}
  }
  return new PlannerData();
}

export function persistPlannerData(plannerData: PlannerData) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannerData));
}
