/**
 * Pure investment calculation functions
 *
 * This module contains business logic for financial calculations including
 * SIP (Systematic Investment Plan) calculations using the Annuity Due formula.
 * These functions are pure (no side effects) and React-independent.
 */

import { InvestmentChoiceType } from './InvestmentOptions';
import { FinancialGoal } from './FinancialGoals';

/**
 * Calculates the SIP factor for a given allocation.
 * This is based on the Annuity Due formula (payments at beginning of period):
 * FV = P × [(1+r)^n - 1] / r × (1+r)
 *
 * So to find P: P = FV / {[(1+r)^n - 1] × (1+r) / r}
 *
 * This function returns: [(1+r)^n - 1] × (1+r) / r × (percentage/100)
 *
 * @param monthlyRate - Monthly interest rate (annual rate / 12 / 100)
 * @param months - Number of months
 * @param allocationPercentage - Percentage allocated to this investment (0-100)
 */
export const calculateSIPFactor = (
  monthlyRate: number,
  months: number,
  allocationPercentage: number,
): number => {
  if (monthlyRate === 0) {
    // If no return, just simple addition of monthly investments
    return months * (allocationPercentage / 100);
  }

  const powerComponent = Math.pow(1 + monthlyRate, months);
  const sipFactor = ((powerComponent - 1) * (1 + monthlyRate)) / monthlyRate;

  return (sipFactor * allocationPercentage) / 100;
};

/**
 * Calculates the total monthly SIP needed to reach a target amount.
 *
 * @param investmentAllocations - Array of investment choices with percentages and expected returns
 * @param targetAmount - The future value target
 * @param monthTerm - Number of months to invest
 */
export const calculateTotalMonthlySIP = (
  investmentAllocations: InvestmentChoiceType[],
  targetAmount: number,
  monthTerm: number,
): number => {
  if (monthTerm <= 0) {
    return 0;
  }

  const combinedFactor = investmentAllocations.reduce((sum, allocation) => {
    const monthlyRate = allocation.expectedReturnPercentage / 100 / 12;
    return (
      sum +
      calculateSIPFactor(monthlyRate, monthTerm, allocation.investmentPercentage)
    );
  }, 0);

  if (combinedFactor === 0) {
    return 0;
  }

  return targetAmount / combinedFactor;
};

/**
 * Calculates the future value of a SIP investment (Annuity Due formula).
 * FV = P × [(1+r)^n - 1] / r × (1+r)
 *
 * @param monthlyInvestment - Monthly SIP amount
 * @param termInMonths - Number of months
 * @param yearlyReturnPercentage - Expected annual return (e.g., 12 for 12%)
 */
export const calculateFutureValue = (
  monthlyInvestment: number,
  termInMonths: number,
  yearlyReturnPercentage: number,
): number => {
  if (termInMonths <= 0 || monthlyInvestment <= 0) {
    return 0;
  }

  const monthlyRate = yearlyReturnPercentage / 100 / 12;

  if (monthlyRate === 0) {
    return monthlyInvestment * termInMonths;
  }

  const powerComponent = Math.pow(1 + monthlyRate, termInMonths);
  return (
    monthlyInvestment * ((powerComponent - 1) / monthlyRate) * (1 + monthlyRate)
  );
};

/**
 * Verifies SIP calculation by computing future value and comparing with target.
 * Useful for testing and validation.
 */
export const verifySIPCalculation = (
  monthlySIP: number,
  investmentAllocations: InvestmentChoiceType[],
  monthTerm: number,
): number => {
  return investmentAllocations.reduce((total, allocation) => {
    const allocationAmount =
      (monthlySIP * allocation.investmentPercentage) / 100;
    return (
      total +
      calculateFutureValue(
        allocationAmount,
        monthTerm,
        allocation.expectedReturnPercentage,
      )
    );
  }, 0);
};

/**
 * Calculates the current portfolio value for a goal based on investment suggestions.
 * This represents the accumulated value if the suggested investments were followed from the start.
 *
 * @param investmentSuggestions - Array of investment suggestions with monthly amounts
 * @param goal - The financial goal
 * @returns Current portfolio value
 */
export const calculateCurrentPortfolioValue = (
  investmentSuggestions: Array<{
    amount: number;
    expectedReturnPercentage: number;
  }>,
  goal: FinancialGoal,
): number => {
  const elapsedMonths = goal.getElapsedMonths();

  return investmentSuggestions
    .map((suggestion) => {
      return calculateFutureValue(
        suggestion.amount,
        Math.min(elapsedMonths, goal.getMonthTerm()),
        suggestion.expectedReturnPercentage,
      );
    })
    .reduce((acc, cv) => acc + cv, 0);
};
