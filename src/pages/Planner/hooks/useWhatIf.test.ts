import { act, renderHook } from '@testing-library/react';
import useWhatIf from './useWhatIf';
import { PlannerData } from '../../../domain/PlannerData';
import { FinancialGoal } from '../../../domain/FinancialGoals';
import { GoalType, TermType } from '../../../types/enums';
import { SIPEntry } from '../../../types/investmentLog';

function longTermAllocations() {
  return {
    [TermType.SHORT_TERM]: [],
    [TermType.MEDIUM_TERM]: [],
    [TermType.LONG_TERM]: [
      { investmentName: 'Equity', investmentPercentage: 100, expectedReturnPercentage: 12 },
    ],
  };
}

function makeGoal(): FinancialGoal {
  const targetYear = new Date().getFullYear() + 10;
  return new FinancialGoal('House', GoalType.ONE_TIME, `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 1_000_000);
}

function makeSips(startDate: string): SIPEntry[] {
  return [{ id: 'sip-1', name: 'Equity SIP', type: 'Equity', monthlyAmount: 5000, startDate }];
}

describe('useWhatIf', () => {
  it('starts with baseline and adjusted results equal (no adjustments yet)', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), makeSips(goal.getInvestmentStartDate()));
    const { result } = renderHook(() => useWhatIf(plannerData));

    expect(result.current.baseline.totalTargetAmount).toBe(result.current.adjusted.totalTargetAmount);
    expect(result.current.baseline.totalInvestedValue).toBe(result.current.adjusted.totalInvestedValue);
    expect(result.current.oneTimeGoals).toHaveLength(1);
    expect(result.current.investmentBaselines).toEqual([{ investmentName: 'Equity', expectedReturnPercentage: 12 }]);
  });

  it('setGoalInflationRate raises the adjusted target, which deepens the shortfall at that goal', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), makeSips(goal.getInvestmentStartDate()));
    const { result } = renderHook(() => useWhatIf(plannerData));

    act(() => result.current.setGoalInflationRate(goal.id, 15));

    expect(result.current.adjusted.totalTargetAmount).toBeGreaterThan(result.current.baseline.totalTargetAmount);
    // A bigger target means a bigger withdrawal at the goal's due date, so the dip goes deeper.
    expect(result.current.adjusted.totalShortfall).toBeGreaterThan(result.current.baseline.totalShortfall);
  });

  it('setInvestmentReturnRate lowers the adjusted invested value without changing the target', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), makeSips(goal.getInvestmentStartDate()));
    const { result } = renderHook(() => useWhatIf(plannerData));

    act(() => result.current.setInvestmentReturnRate('Equity', 2));

    expect(result.current.adjusted.totalInvestedValue).toBeLessThan(result.current.baseline.totalInvestedValue);
    expect(result.current.adjusted.totalTargetAmount).toBe(result.current.baseline.totalTargetAmount);
  });

  it('resetAdjustments clears all adjustments back to baseline', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), makeSips(goal.getInvestmentStartDate()));
    const { result } = renderHook(() => useWhatIf(plannerData));

    act(() => result.current.setGoalInflationRate(goal.id, 15));
    act(() => result.current.resetAdjustments());

    expect(result.current.adjustments.goalInflationRates).toEqual({});
    expect(result.current.adjusted.totalTargetAmount).toBe(result.current.baseline.totalTargetAmount);
  });
});
