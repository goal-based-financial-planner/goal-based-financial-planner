import { DEFAULT_INVESTMENT_ALLOCATIONS } from '../domain/constants';
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
    case PlannerDataActionType.ADD_FINANCIAL_GOAL: {
      const updatedFinancialGoals = [...state.financialGoals, action.payload];
      const updatedInvestmentAllocations = { ...state.investmentAllocations };

      // Get all goal term types from the updated financial goals. If invetment allocation is not present for that type add an empty array
      const allSelectedTermTypes = new Set(
        updatedFinancialGoals.map((g) => g.getTermType()),
      );

      if (
        allSelectedTermTypes.has(TermType.SHORT_TERM) &&
        updatedInvestmentAllocations['Short Term'].length === 0
      ) {
        updatedInvestmentAllocations['Short Term'] = [
          ...DEFAULT_INVESTMENT_ALLOCATIONS[TermType.SHORT_TERM],
        ];
      }

      if (
        allSelectedTermTypes.has(TermType.MEDIUM_TERM) &&
        updatedInvestmentAllocations['Medium Term'].length === 0
      ) {
        updatedInvestmentAllocations['Medium Term'] = [
          ...DEFAULT_INVESTMENT_ALLOCATIONS[TermType.MEDIUM_TERM],
        ];
      }

      if (
        allSelectedTermTypes.has(TermType.LONG_TERM) &&
        updatedInvestmentAllocations['Long Term'].length === 0
      ) {
        updatedInvestmentAllocations['Long Term'] = [
          ...DEFAULT_INVESTMENT_ALLOCATIONS[TermType.LONG_TERM],
        ];
      }

      return new PlannerData(
        updatedFinancialGoals,
        updatedInvestmentAllocations,
      );
    }

    case PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS:
      return new PlannerData(state.financialGoals, action.payload);

    case PlannerDataActionType.DELETE_FINANCIAL_GOAL: {
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
    }

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

      return new PlannerData(financialGoals, parsedState.investmentAllocations);
    } catch {}
  }
  return new PlannerData();
}

export function persistPlannerData(plannerData: PlannerData) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannerData));
}
