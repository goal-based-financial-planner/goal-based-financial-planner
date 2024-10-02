import React, { Dispatch } from 'react';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step from '../../molecules/Step';
import { TermType } from '../../../types/enums';
import { PlannerData } from '../../../domain/PlannerData';
import InvestmentAllocation from '../../molecules/InvestmentAllocation/InvesmentAllocation';
import { Grid } from '@mui/material';

type InvestmentAllocationProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

export interface ToolTipVisibilityState {
  [TermType.SHORT_TERM]?: boolean;
  [TermType.MEDIUM_TERM]?: boolean;
  [TermType.LONG_TERM]?: boolean;
}

const InvestmentAllocationStep: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
}) => {
  return (
    <Step title={'Investment Allocation'}>
      <Grid container>
        <Grid xs={4}>
          <InvestmentAllocation />
        </Grid>
        <Grid xs={4}>
          <InvestmentAllocation />
        </Grid>
        <Grid xs={4}>
          <InvestmentAllocation />
        </Grid>
      </Grid>
    </Step>
  );
};

export default InvestmentAllocationStep;
