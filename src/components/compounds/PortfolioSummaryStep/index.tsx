import { StepType } from '../../../types/types';
import PortfolioSummary from '../../molecules/PortFolioSummary/AllocationDetails';
import Step from '../../molecules/Step';

type PortFolioSummaryProps = StepType;

const PortfolioSummaryStep: React.FC<PortFolioSummaryProps> = ({
  isExpanded,
}) => {
  return (
    <Step
      isExpanded={isExpanded}
      onContinue={() => {}}
      onEdit={() => {}}
      title={'Asset Allocation'}
      subtext="Alright! Based on the goals you have added and your preferences, we have created an asset allocation for you. "
      isContinueDisabled={false}
      summaryText={`You have added some assets here`}
      hideContinue={true}
    >
      <PortfolioSummary />
    </Step>
  );
};

export default PortfolioSummaryStep;
