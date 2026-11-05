import { DEFAULT_INVESTMENT_ALLOCATIONS } from '../domain/constants';
import { FinancialGoal } from '../domain/FinancialGoals';
import { PlannerData } from '../domain/PlannerData';
import { TermType } from '../types/enums';
import { GoalStatusUpdate, PlannerDataActionType } from './plannerDataActions';
// getPlannerData / setPlannerData removed — storage is now handled by StorageProviderContext
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

/**
 * Union type for all possible action payloads
 */
export type PlannerDataActionPayload =
  | FinancialGoal // ADD_FINANCIAL_GOAL, UPDATE_FINANCIAL_GOAL
  | InvestmentAllocationsType // UPDATE_INVESTMENT_ALLOCATIONS
  | InvestmentChoiceType // UPDATE_*_TERM_INVESTMENT
  | InvestmentOptionType // ADD_INVESTMENT_OPTION
  | string // DELETE_FINANCIAL_GOAL (goalId)
  | { id: string; goalName: string; startYear: string; targetYear: string; targetAmount: number; recurringDurationYears?: number; inflationRate?: number } // UPDATE_FINANCIAL_GOAL (alternative form)
  | { id: string; inflationRate: number } // UPDATE_GOAL_INFLATION_RATE
  | AddSIPEntryPayload
  | EditSIPEntryPayload
  | DeleteSIPEntryPayload
  | GoalStatusUpdate // UPDATE_GOAL_STATUS
  | PlannerData; // INITIALIZE

export type PlannerDataAction = {
  payload: PlannerDataActionPayload;
  type: PlannerDataActionType;
};

/**
 * Gives every term that has goals but no allocation the default allocation for that term. The
 * allocation editor never saves an empty allocation, so empty always means "never set" — without
 * this, goals in that term get no investment suggestions at all. Returns `allocations` unchanged
 * (same reference) when nothing is missing.
 */
export function withDefaultAllocations(
  goals: FinancialGoal[],
  allocations: InvestmentAllocationsType,
): InvestmentAllocationsType {
  const termsWithGoals = new Set(goals.map((g) => g.getTermType()));
  const missing = Object.values(TermType).filter(
    (term) => termsWithGoals.has(term) && !(allocations[term]?.length > 0),
  );
  if (missing.length === 0) return allocations;
  const updated = { ...allocations };
  missing.forEach((term) => {
    updated[term] = [...DEFAULT_INVESTMENT_ALLOCATIONS[term]];
  });
  return updated;
}

export function plannerDataReducer(
  state = new PlannerData(),
  action: PlannerDataAction,
): PlannerData {
  switch (action.type) {
    case PlannerDataActionType.ADD_FINANCIAL_GOAL: {
      const financialGoal = action.payload as FinancialGoal;
      const updatedFinancialGoals = [...state.financialGoals, financialGoal];
      const updatedInvestmentAllocations = withDefaultAllocations(
        updatedFinancialGoals,
        state.investmentAllocations,
      );

      return new PlannerData(
        updatedFinancialGoals,
        updatedInvestmentAllocations,
        state.investmentLogs,
      );
    }

    case PlannerDataActionType.UPDATE_INVESTMENT_ALLOCATIONS:
      return new PlannerData(
        state.financialGoals,
        action.payload as InvestmentAllocationsType,
        state.investmentLogs,
      );

    case PlannerDataActionType.DELETE_FINANCIAL_GOAL: {
      const goalId = action.payload as string;
      const financialGoals = [...state.financialGoals];
      const investmentAllocations = { ...state.investmentAllocations };

      const index = financialGoals.findIndex((g) => g.id === goalId);
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

      return new PlannerData(financialGoals, investmentAllocations, state.investmentLogs);
    }

    case PlannerDataActionType.ADD_INVESTMENT_LOG_ENTRY: {
      const { entry } = action.payload as AddSIPEntryPayload;
      return new PlannerData(
        state.financialGoals,
        state.investmentAllocations,
        [...state.investmentLogs, entry],
      );
    }

    case PlannerDataActionType.EDIT_INVESTMENT_LOG_ENTRY: {
      const { entryId, name, type, monthlyAmount, expectedReturnPct, startDate } = action.payload as EditSIPEntryPayload;
      const entries = state.investmentLogs.map(
        (e: SIPEntry) => e.id === entryId ? { ...e, name, type, monthlyAmount, expectedReturnPct, startDate: startDate || undefined } : e,
      );
      return new PlannerData(state.financialGoals, state.investmentAllocations, entries);
    }

    case PlannerDataActionType.DELETE_INVESTMENT_LOG_ENTRY: {
      const { entryId } = action.payload as DeleteSIPEntryPayload;
      const entries = state.investmentLogs.filter(
        (e: SIPEntry) => e.id !== entryId,
      );
      return new PlannerData(state.financialGoals, state.investmentAllocations, entries);
    }

    case PlannerDataActionType.UPDATE_FINANCIAL_GOAL: {
      const financialGoals = [...state.financialGoals];
      const updatedPayload = action.payload as {
        id: string;
        goalName: string;
        startYear: string;
        targetYear: string;
        targetAmount: number;
        recurringDurationYears?: number;
        inflationRate?: number;
      };
      const goalToBeUpdated = financialGoals.find((g) => g.id === updatedPayload.id);

      if (goalToBeUpdated) {
        goalToBeUpdated.goalName = updatedPayload.goalName;
        goalToBeUpdated.startDate = updatedPayload.startYear;
        goalToBeUpdated.targetDate = updatedPayload.targetYear;
        goalToBeUpdated.targetAmount = updatedPayload.targetAmount;
        if (updatedPayload.recurringDurationYears !== undefined) {
          goalToBeUpdated.recurringDurationYears = updatedPayload.recurringDurationYears;
        }
        if (updatedPayload.inflationRate !== undefined) {
          goalToBeUpdated.inflationRate = updatedPayload.inflationRate;
        }
      }

      // Changing a goal's dates can move it into a term that has no allocation yet.
      return new PlannerData(
        financialGoals,
        withDefaultAllocations(financialGoals, state.investmentAllocations),
        state.investmentLogs,
      );
    }

    case PlannerDataActionType.UPDATE_GOAL_INFLATION_RATE: {
      const { id, inflationRate } = action.payload as { id: string; inflationRate: number };
      const financialGoals = [...state.financialGoals];
      const goal = financialGoals.find((g) => g.id === id);
      if (goal) {
        goal.inflationRate = inflationRate;
      }
      return new PlannerData(financialGoals, state.investmentAllocations, state.investmentLogs);
    }

    case PlannerDataActionType.UPDATE_GOAL_STATUS: {
      const { id, completion, reopened, archived } = action.payload as GoalStatusUpdate;
      const financialGoals = state.financialGoals.map((goal) => {
        if (goal.id !== id) return goal;
        // Copy so components holding the old goal object see a change.
        const updated = Object.assign(Object.create(Object.getPrototypeOf(goal)), goal) as FinancialGoal;
        if (completion === null) delete updated.completion;
        else if (completion) updated.completion = completion;
        if (reopened !== undefined) updated.reopened = reopened || undefined;
        if (archived !== undefined) updated.archived = archived || undefined;
        return updated;
      });
      return new PlannerData(financialGoals, state.investmentAllocations, state.investmentLogs);
    }

    case PlannerDataActionType.INITIALIZE: {
      // Repairs plans saved while a goal's term had no allocation (they'd otherwise show ₹0
      // required and an empty allocation plan forever).
      const loaded = action.payload as PlannerData;
      const allocations = withDefaultAllocations(loaded.financialGoals, loaded.investmentAllocations);
      return allocations === loaded.investmentAllocations
        ? loaded
        : new PlannerData(loaded.financialGoals, allocations, loaded.investmentLogs);
    }

    default:
      return state;
  }
}

export function getInitialData(): PlannerData {
  return new PlannerData();
}
