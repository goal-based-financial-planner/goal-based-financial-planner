/**
 * Chart-specific type definitions
 *
 * This file contains type definitions used across chart visualizations
 * to ensure consistent data structures.
 */

/**
 * Generic data point for chart visualizations
 */
export type ChartDataPoint = {
  /** Label for this data point */
  label: string;
  /** Numeric value */
  value: number;
};

/**
 * Mapping of investment names to total amounts
 */
export type InvestmentAmountMap = Record<string, number>;
