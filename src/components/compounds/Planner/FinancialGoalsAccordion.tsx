import React from 'react';
import FinancialGoalsStep from '../FinancialGoalsStep';
import { PlannerState } from '../../../types/enums';
import AccordionStep from './AccordionStep';

interface FinancialGoalsAccordionProps {
  isExpanded: boolean;
  onAccordionClick: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => void;
  onDialogOpen: () => void;
  isIconDisabled: boolean;
  plannerData: any;
  dispatch: React.Dispatch<any>;
  goToStep: (step: PlannerState) => void;
}

const FinancialGoalsAccordion: React.FC<FinancialGoalsAccordionProps> = ({
  isExpanded,
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
      isVisible={true}
      title="Financial Goals"
      onAccordionClick={onAccordionClick}
      onDialogOpen={onDialogOpen}
      isIconDisabled={isIconDisabled}
    >
      <FinancialGoalsStep
        isExpanded={isExpanded}
        onContinue={() => goToStep(PlannerState.INVESTMENT_ALLOCATION)}
        onEdit={() => goToStep(PlannerState.GOALS)}
        plannerData={plannerData}
        dispatch={dispatch}
      />
    </AccordionStep>
  );
};

export default FinancialGoalsAccordion;
