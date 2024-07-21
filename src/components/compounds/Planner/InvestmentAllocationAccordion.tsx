import React from 'react';
import InvestmentAllocationStep from '../InvestmentAllocationStep';
import AccordionStep from './AccordionStep';
import { PlannerState } from '../../../types/enums';

interface InvestmentAllocationAccordionProps {
  isExpanded: boolean;
  isVisible: boolean;
  onAccordionClick: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => void;
  onDialogOpen: () => void;
  isIconDisabled: boolean;
  plannerData: any;
  dispatch: React.Dispatch<any>;
  goToStep: (step: PlannerState) => void;
}

const InvestmentAllocationAccordion: React.FC<
  InvestmentAllocationAccordionProps
> = ({
  isExpanded,
  isVisible,
  onAccordionClick,
  onDialogOpen,
  isIconDisabled,
  plannerData,
  dispatch,
  goToStep,
}) => {
  return (
    <AccordionStep
      isExpanded={isExpanded}
      isVisible={isVisible}
      title="Investment Allocation"
      onAccordionClick={onAccordionClick}
      onDialogOpen={onDialogOpen}
      isIconDisabled={isIconDisabled}
    >
      <InvestmentAllocationStep
        isExpanded={isExpanded}
        onContinue={() => goToStep(PlannerState.PORTFOLIO_SUMMARY)}
        onEdit={() => goToStep(PlannerState.INVESTMENT_ALLOCATION)}
        plannerData={plannerData}
        dispatch={dispatch}
      />
    </AccordionStep>
  );
};

export default InvestmentAllocationAccordion;
