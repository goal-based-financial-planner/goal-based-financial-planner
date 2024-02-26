import { StepType } from '../../../types/types';
import TabsWrappedLabel from '../../molecules/PortFolioSummary/summaryTabs';
import Step from '../../molecules/Step';

type PortFolioSummaryProps = StepType;

const PortFolioSummaryStep: React.FC<PortFolioSummaryProps> = ({
  isExpanded,
}) => {
  return (
    <Step
      isExpanded={isExpanded}
      onContinue={() => {}}
      onEdit={() => {}}
      title={'Asset Allocation'}
      subtext="You have assets with amount you need to invest here "
      isContinueDisabled={false}
      summaryText={`You have added some assets here`}
    >
      <TabsWrappedLabel />
    </Step>
  );
};

export default PortFolioSummaryStep;
