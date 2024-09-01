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
    <Step
      title={'Summary'}
      subtext="Alright! Based on the goals you have added and your choice of investments, we calculated how much you should invest into each of the investment options. Here is a summary of the investments you have added."
    >
      <InvestmentSuggestions plannerData={plannerData} />
    </Step>
  );
};

export default PortfolioSummaryStep;
