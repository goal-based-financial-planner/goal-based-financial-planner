import React from 'react';
import PortfolioSummaryStep from '../PortfolioSummaryStep';
import AccordionStep from './AccordionStep';

interface PortfolioSummaryAccordionProps {
  isExpanded: boolean;
  isVisible: boolean;
  onAccordionClick: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => void;
  onDialogOpen: () => void;
  isIconDisabled: boolean;
  plannerData: any;
}

const PortfolioSummaryAccordion: React.FC<PortfolioSummaryAccordionProps> = ({
  isExpanded,
  isVisible,
  onAccordionClick,
  onDialogOpen,
  isIconDisabled,
  plannerData,
}) => {
  return (
    <AccordionStep
      isExpanded={isExpanded}
      isVisible={isVisible}
      title="Portfolio Summary"
      onAccordionClick={onAccordionClick}
      onDialogOpen={onDialogOpen}
      isIconDisabled={isIconDisabled}
    >
      <PortfolioSummaryStep isExpanded={isExpanded} plannerData={plannerData} />
    </AccordionStep>
  );
};

export default PortfolioSummaryAccordion;
