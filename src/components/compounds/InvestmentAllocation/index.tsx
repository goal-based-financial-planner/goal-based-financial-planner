import React, { Dispatch, useState } from 'react';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';
import { StepType } from '../../../types/types';
import Step from '../../molecules/Step';
import useInvestmentOptions from '../../../hooks/useInvestmentAssetOptions';

type InvestmentAllocationProps = StepType & {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

export interface Terms {
  shortTerm?: boolean;
  midTerm?: boolean;
  longTerm?: boolean;
}

const InvestmentAllocation: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
  isExpanded,
  onContinue,
  onEdit,
}) => {
  const tableData = useInvestmentOptions();

  const [termTooltipVisible, setTermTooltipVisible] = useState<Terms>({
    shortTerm: false,
    midTerm: false,
    longTerm: false,
  });

  const isTooltipVisible = (termType: keyof PlannerData['assets']) => {
    const termSum = tableData.reduce(
      (sum, row) => sum + Number(plannerData.assets[termType][row.id] || 0),
      0,
    );

    return termSum !== 100;
  };

  const handleClick = () => {
    debugger;
    const shortTermTooltipVisible = isTooltipVisible('shortTermGoals');
    const midTermTooltipVisible = isTooltipVisible('midTermGoals');
    const longTermTooltipVisible = isTooltipVisible('longTermGoals');

    if (shortTermTooltipVisible) {
      setTermTooltipVisible({
        shortTerm: shortTermTooltipVisible,
      });
      return;
    }
    if (midTermTooltipVisible) {
      setTermTooltipVisible({
        midTerm: midTermTooltipVisible,
      });
      return;
    }

    if (longTermTooltipVisible) {
      setTermTooltipVisible({
        longTerm: longTermTooltipVisible,
      });
      return;
    }

    if (
      !shortTermTooltipVisible &&
      !midTermTooltipVisible &&
      !longTermTooltipVisible
    ) {
      setTermTooltipVisible({
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
      onContinue={handleClick}
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
        tableData={tableData}
        termTooltipVisible={termTooltipVisible}
      />
    </Step>
  );
};

export default InvestmentAllocation;
