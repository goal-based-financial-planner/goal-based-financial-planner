import InvestmentSuggestions from '../../molecules/PortFolioSummary/InvestmentSuggestions';
import Step from '../../molecules/Step';
import React from 'react';
import { PlannerData } from '../../../domain/PlannerData';

type PortFolioSummaryProps = {
  plannerData: PlannerData;
};

const PortfolioSummaryStep: React.FC<PortFolioSummaryProps> = ({
  plannerData,
}) => {
  return (
    <Step>
      <InvestmentSuggestions plannerData={plannerData} />
    </Step>
  );
};

export default PortfolioSummaryStep;
