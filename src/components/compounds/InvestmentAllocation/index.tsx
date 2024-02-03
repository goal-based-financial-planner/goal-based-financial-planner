import React, { Dispatch } from 'react';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';
import { StepType } from '../../../types/types';
import CustomPaper from '../../atoms/CustomPaper';
import { Button, Grid } from '@mui/material';

type InvestmentAllocationProps = StepType & {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const InvestmentAllocation: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
  isExpanded,
  onContinue,
  onEdit,
}) => {
  return isExpanded ? (
    <CustomPaper sx={{ height: '100vh' }}>
      <h2>Assets Planner </h2>

      <InvestmentAllocationTable
        dispatch={dispatch}
        plannerData={plannerData}
        onAssetsPlannerContinue={onContinue}
      />
    </CustomPaper>
  ) : (
    <CustomPaper>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={11}>
          <h2>Assets Planner</h2>
        </Grid>
        <Grid item xs={1} textAlign="right">
          <Button onClick={onEdit} variant="contained" color="secondary">
            Edit
          </Button>
        </Grid>
      </Grid>
    </CustomPaper>
  );
};

export default InvestmentAllocation;
