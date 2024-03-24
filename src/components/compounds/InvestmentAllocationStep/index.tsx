import React, { Dispatch, useState } from 'react';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { StepType } from '../../../types/types';
import Step from '../../molecules/Step';
import useInvestmentOptions from '../../../hooks/useInvestmentOptions';
import { TermType } from '../../../types/enums';

type InvestmentAllocationProps = StepType & {
  dispatch: Dispatch<PlannerDataAction>;
};

export interface ToolTipVisibilityState {
  [TermType.SHORT_TERM]?: boolean;
  [TermType.MEDIUM_TERM]?: boolean;
  [TermType.LONG_TERM]?: boolean;
}

const InvestmentAllocationStep: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
  isExpanded,
  onContinue,
  onEdit,
}) => {
  const investmentOptions = useInvestmentOptions();

  const [tooltipVisibilityState, setTooltipVisibilityState] =
    useState<ToolTipVisibilityState>({
      [TermType.SHORT_TERM]: false,
      [TermType.MEDIUM_TERM]: false,
      [TermType.LONG_TERM]: false,
    });
  const areGoalsPresentOfType = (column: string) => {
    return plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);
  };
  const isAssetAllocationInvalid = (termType: TermType) => {
    if (areGoalsPresentOfType(termType)) {
      const termSum = investmentOptions.reduce(
        (sum, row) => sum + Number(plannerData.investmentAllocations[termType].filter(e => e.id === row.id)[0]?.investmentPercentage || 0),
        0,
      );

      return termSum !== 100;
    } else return false;
  };

  const handleStepContinue = () => {
    const isShortTermAssetAllocationInvalid = isAssetAllocationInvalid(
      TermType.SHORT_TERM,
    );
    const isMidTermAssetAllocationInvalid = isAssetAllocationInvalid(
      TermType.MEDIUM_TERM,
    );
    const isLongTermAssetAllocationInvalid = isAssetAllocationInvalid(
      TermType.LONG_TERM,
    );

    if (isShortTermAssetAllocationInvalid) {
      setTooltipVisibilityState({
        [TermType.SHORT_TERM]: isShortTermAssetAllocationInvalid,
      });
      return;
    }
    if (isMidTermAssetAllocationInvalid) {
      setTooltipVisibilityState({
        [TermType.MEDIUM_TERM]: isMidTermAssetAllocationInvalid,
      });
      return;
    }

    if (isLongTermAssetAllocationInvalid) {
      setTooltipVisibilityState({
        [TermType.LONG_TERM]: isLongTermAssetAllocationInvalid,
      });
      return;
    }
    if (
      !isShortTermAssetAllocationInvalid &&
      !isMidTermAssetAllocationInvalid &&
      !isLongTermAssetAllocationInvalid
    ) {
      setTooltipVisibilityState({
        [TermType.SHORT_TERM]: false,
        [TermType.MEDIUM_TERM]: false,
        [TermType.LONG_TERM]: false,
      });
      onContinue();
    }
  };
  return (
    <Step
      isExpanded={isExpanded}
      onContinue={handleStepContinue}
      onEdit={onEdit}
      title={'Asset Allocation'}
      subtext="Now that you have added your financial goals, let's add the assets that
        you are interested to invest in."
      isContinueDisabled={false}
      summaryText={`You have added some assets here`}
    >
      <InvestmentAllocationTable
        dispatch={dispatch}
        plannerData={plannerData}
        investmentOptions={investmentOptions}
        tooltipVisibilityState={tooltipVisibilityState}
      />
    </Step>
  );
};

export default InvestmentAllocationStep;
