import InvestmentSuggestions from '../../molecules/PortFolioSummary/InvestmentSuggestions';
import Step, { StepProps } from '../../molecules/Step';
import React from 'react';
import { PlannerData } from '../../../domain/PlannerData';

type PortFolioSummaryProps = Pick<StepProps, "isExpanded"> & {
  plannerData: PlannerData
};

const PortfolioSummaryStep: React.FC<PortFolioSummaryProps> = ({ isExpanded, plannerData }) => {
  return (
    <Step
      isExpanded={isExpanded}
      onContinue={() => {}}
      onEdit={() => {}}
      title={'Summary'}
      subtext="Alright! Based on the goals you have added and your choice of investments, we calculated how much you should invest into each of the investment options. Here is a summary of the investments you have added."
      isContinueDisabled={false}
      summaryText={`You have added some assets here`}
      hideContinue={true}
    >
      <InvestmentSuggestions plannerData={plannerData} />
    </Step>
  );
};

export default PortfolioSummaryStep;
