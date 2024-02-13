import React, { Dispatch, useState } from 'react';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';
import { StepType } from '../../../types/types';
import Step from '../../molecules/Step';
import useInvestmentOptions from '../../../hooks/useInvestmentAssetOptions';
import { InvestmentOptionType } from '../../../domain/InvestmentOptions';

type InvestmentAllocationProps = StepType & {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

export interface ToolTipVisibilityState {
  shortTerm?: boolean;
  midTerm?: boolean;
  longTerm?: boolean;
}

const InvestmentAllocationStep: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
  isExpanded,
  onContinue,
  onEdit,
}) => {
  const investmentOptions = useInvestmentOptions();

  const [investmentOptionsData, setInvestmentOptions] =
    useState<InvestmentOptionType[]>(investmentOptions);

  const [tooltipVisibilityState, setTooltipVisiblityState] =
    useState<ToolTipVisibilityState>({
      shortTerm: false,
      midTerm: false,
      longTerm: false,
    });

  const isTooltipVisible = (termType: keyof PlannerData['assets']) => {
    const termSum = investmentOptionsData.reduce(
      (sum, row) => sum + Number(plannerData.assets[termType][row.id] || 0),
      0,
    );

    return termSum !== 100;
  };

  const handleStepContinue = () => {
    const shortTermTooltipVisible = isTooltipVisible('shortTermGoals');
    const midTermTooltipVisible = isTooltipVisible('midTermGoals');
    const longTermTooltipVisible = isTooltipVisible('longTermGoals');

    if (shortTermTooltipVisible) {
      setTooltipVisiblityState({
        shortTerm: shortTermTooltipVisible,
      });
      return;
    }
    if (midTermTooltipVisible) {
      setTooltipVisiblityState({
        midTerm: midTermTooltipVisible,
      });
      return;
    }

    if (longTermTooltipVisible) {
      setTooltipVisiblityState({
        longTerm: longTermTooltipVisible,
      });
      return;
    }

    if (
      !shortTermTooltipVisible &&
      !midTermTooltipVisible &&
      !longTermTooltipVisible
    ) {
      setTooltipVisiblityState({
        shortTerm: false,
        midTerm: false,
        longTerm: false,
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
      summaryText={''}
    >
      <InvestmentAllocationTable
        dispatch={dispatch}
        plannerData={plannerData}
        investmentOptions={investmentOptions}
        tooltipVisibilityState={tooltipVisibilityState}
        investmentOptionsData={investmentOptionsData}
        setInvestmentOptions={setInvestmentOptions}
      />
    </Step>
  );
};

export default InvestmentAllocationStep;
