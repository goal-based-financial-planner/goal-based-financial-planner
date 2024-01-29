import React, { Dispatch } from 'react';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';

type InvestmentAllocationProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const InvestmentAllocation: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
}) => {
  return (
    <InvestmentAllocationTable dispatch={dispatch} plannerData={plannerData} />
  );
};

export default InvestmentAllocation;
