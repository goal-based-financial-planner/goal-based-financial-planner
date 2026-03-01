/**
 * Investment Tracking — TypeScript Contract Definitions
 * Feature: 005-investment-tracking
 *
 * These are the canonical type contracts for this feature.
 * Actual implementation files live under src/types/investmentLog.ts
 * and src/domain/investmentLog.ts.
 */

// ---------------------------------------------------------------------------
// Core entity
// ---------------------------------------------------------------------------

/**
 * A single recorded actual investment made by the user.
 * One entry represents one investment instrument for one month.
 */
export type InvestmentLogEntry = {
  /** UUID generated via crypto.randomUUID() at creation time. Immutable. */
  id: string;
  /** Foreign key to FinancialGoal.id. */
  goalId: string;
  /** Investment instrument name. Matched by string equality to suggestion names. */
  investmentName: string;
  /** Actual amount invested in Indian Rupees. Must be > 0. */
  amount: number;
  /** Calendar month (1 = January … 12 = December). */
  month: number;
  /** Calendar year (e.g. 2026). Must not precede goal start year or exceed current year. */
  year: number;
};

// ---------------------------------------------------------------------------
// Derived / view types (never persisted)
// ---------------------------------------------------------------------------

/**
 * One row in the actual-vs-suggested comparison view for a given month.
 */
export type MonthlyInvestmentSummary = {
  investmentName: string;
  /** Current suggestion amount (from InvestmentSuggestion.amount). Retroactively applied. */
  suggestedAmount: number;
  /** Sum of all log entries for this investmentName in the selected month/year. 0 if none. */
  actualAmount: number;
  /** actualAmount − suggestedAmount. Negative = shortfall; positive = surplus. */
  difference: number;
};

/**
 * Entries for a goal grouped by month, used in the history view.
 */
export type MonthGroup = {
  /** Human-readable label, e.g. "February 2026". */
  label: string;
  /** Entries belonging to this month, sorted by investmentName. */
  entries: InvestmentLogEntry[];
};

// ---------------------------------------------------------------------------
// Reducer action payloads
// ---------------------------------------------------------------------------

export type AddInvestmentLogEntryPayload = {
  goalId: string;
  entry: InvestmentLogEntry;
};

export type EditInvestmentLogEntryPayload = {
  goalId: string;
  entryId: string;
  amount: number;
};

export type DeleteInvestmentLogEntryPayload = {
  goalId: string;
  entryId: string;
};

// ---------------------------------------------------------------------------
// PlannerData extension (new field added to existing class)
// ---------------------------------------------------------------------------

/**
 * The investmentLogs field added to PlannerData.
 * Key = goalId, Value = all log entries for that goal (unordered array).
 */
export type InvestmentLogsMap = Record<string, InvestmentLogEntry[]>;

// ---------------------------------------------------------------------------
// Domain function signatures (reference only)
// ---------------------------------------------------------------------------

// import { InvestmentSuggestion } from 'src/types/planner';
//
// getGoalLogs(logs: InvestmentLogsMap, goalId: string): InvestmentLogEntry[]
// calculateCumulativeActual(entries: InvestmentLogEntry[]): number
// calculateCumulativeSuggested(suggestions: InvestmentSuggestion[], elapsedMonths: number): number
// buildMonthlyComparison(entries, suggestions, month, year): MonthlyInvestmentSummary[]
// groupLogsByMonth(entries: InvestmentLogEntry[]): MonthGroup[]
