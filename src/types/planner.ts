/**
 * Planner-specific type definitions
 *
 * This file consolidates type definitions used across the Planner page
 * and related components to ensure a single source of truth.
 */

import { TermType } from './enums';

/**
 * Aggregated data for a specific term type (short/medium/long)
 */
export type TermTypeWiseData = {
  /** Names of goals in this term category */
  goalNames: string[];
  /** Sum of target amounts for all goals in this term */
  termTypeSum: number;
  /** Progress percentage toward term target (0-100) */
  progressPercent: number;
};

/**
 * Term-based progress tracking data
 */
export type TermTypeWiseProgressData = {
  /** Term category (SHORT_TERM, MEDIUM_TERM, LONG_TERM) */
  termType: TermType;
  /** Aggregated metrics for this term */
  termTypeWiseData: TermTypeWiseData;
};

/**
 * Investment breakdown for a single goal
 */
export type GoalWiseInvestmentBreakdown = {
  /** Goal name */
  goalName: string;
  /** Target amount (inflation-adjusted) */
  targetAmount: number;
  /** Current portfolio value for this goal */
  currentValue: number;
  /** Recommended monthly investments per allocation */
  investmentSuggestions: InvestmentSuggestion[];
};

/**
 * Recommended investment allocation with amount
 */
export type InvestmentSuggestion = {
  /** Investment product name */
  investmentName: string;
  /** Recommended monthly amount */
  amount: number;
  /** Expected annual return percentage */
  expectedReturnPercentage: number;
};

/**
 * Investment breakdown grouped by term type
 */
export type InvestmentBreakdownBasedOnTermType = {
  /** Term category */
  termType: TermType;
  /** Investment breakdowns for goals in this term */
  investmentBreakdown: GoalWiseInvestmentBreakdown[];
};
