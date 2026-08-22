import { useMemo, useState } from 'react';
import { PlannerData } from '../../../domain/PlannerData';
import { GoalType } from '../../../types/enums';
import {
  Adjustments,
  buildPortfolioWhatIfResult,
  calculateRequiredTopUp,
  EMPTY_ADJUSTMENTS,
  PortfolioWhatIfResult,
  WhatIfTopUpResult,
} from '../../../domain/whatIf';

export type InvestmentBaseline = {
  investmentName: string;
  expectedReturnPercentage: number;
};

export type UseWhatIfResult = {
  oneTimeGoals: PlannerData['financialGoals'];
  investmentBaselines: InvestmentBaseline[];
  adjustments: Adjustments;
  setGoalInflationRate: (goalId: string, rate: number) => void;
  setInvestmentReturnRate: (investmentName: string, rate: number) => void;
  resetAdjustments: () => void;
  baseline: PortfolioWhatIfResult;
  adjusted: PortfolioWhatIfResult;
  requiredTopUp: WhatIfTopUpResult;
};

const useWhatIf = (plannerData: PlannerData): UseWhatIfResult => {
  const [adjustments, setAdjustments] = useState<Adjustments>(EMPTY_ADJUSTMENTS);

  const oneTimeGoals = useMemo(
    () => plannerData.financialGoals.filter((g) => g.goalType === GoalType.ONE_TIME),
    [plannerData.financialGoals],
  );

  const investmentBaselines: InvestmentBaseline[] = useMemo(() => {
    const seen = new Map<string, number>();
    Object.values(plannerData.investmentAllocations).forEach((allocations) => {
      allocations.forEach((allocation) => {
        if (!seen.has(allocation.investmentName)) {
          seen.set(allocation.investmentName, allocation.expectedReturnPercentage);
        }
      });
    });
    return Array.from(seen.entries()).map(([investmentName, expectedReturnPercentage]) => ({
      investmentName,
      expectedReturnPercentage,
    }));
  }, [plannerData.investmentAllocations]);

  const baseline = useMemo(
    () => buildPortfolioWhatIfResult(oneTimeGoals, plannerData.investmentLogs, plannerData.investmentAllocations, EMPTY_ADJUSTMENTS),
    [oneTimeGoals, plannerData.investmentLogs, plannerData.investmentAllocations],
  );

  const adjusted = useMemo(
    () => buildPortfolioWhatIfResult(oneTimeGoals, plannerData.investmentLogs, plannerData.investmentAllocations, adjustments),
    [oneTimeGoals, plannerData.investmentLogs, plannerData.investmentAllocations, adjustments],
  );

  const requiredTopUp = useMemo(
    () => calculateRequiredTopUp(oneTimeGoals, plannerData.investmentLogs, plannerData.investmentAllocations, adjustments),
    [oneTimeGoals, plannerData.investmentLogs, plannerData.investmentAllocations, adjustments],
  );

  const setGoalInflationRate = (goalId: string, rate: number) => {
    setAdjustments((prev) => ({
      ...prev,
      goalInflationRates: { ...prev.goalInflationRates, [goalId]: rate },
    }));
  };

  const setInvestmentReturnRate = (investmentName: string, rate: number) => {
    setAdjustments((prev) => ({
      ...prev,
      investmentReturnRates: { ...prev.investmentReturnRates, [investmentName]: rate },
    }));
  };

  const resetAdjustments = () => setAdjustments(EMPTY_ADJUSTMENTS);

  return {
    oneTimeGoals,
    investmentBaselines,
    adjustments,
    setGoalInflationRate,
    setInvestmentReturnRate,
    resetAdjustments,
    baseline,
    adjusted,
    requiredTopUp,
  };
};

export default useWhatIf;
