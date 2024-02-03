import React, { Dispatch } from 'react';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';

type InvestmentAllocationProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
  onAssetsPlannerContinue: any;
};

const InvestmentAllocation: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
  onAssetsPlannerContinue,
}) => {
  return (
    <InvestmentAllocationTable
      dispatch={dispatch}
      plannerData={plannerData}
      onAssetsPlannerContinue={onAssetsPlannerContinue}
    />
  );
};

export default InvestmentAllocation;
