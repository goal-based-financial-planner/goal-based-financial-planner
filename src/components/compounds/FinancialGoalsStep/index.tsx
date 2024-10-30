import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Grid } from '@mui/material';
import AddFinancialGoals from '../../molecules/FinancialGoals/AddFinancialGoals';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step from '../../molecules/Step';
import { PlannerData } from '../../../domain/PlannerData';
import FinancialGoalsGrid from '../../molecules/FinancialGoals/FinancialGoalsGrid';

type FinancialGoalsProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

const FinancialGoalsStep: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  return (
    <Step>
      <Grid container rowGap={6}>
        <Grid container justifyContent="center" minHeight="80px">
          <Box>
            <AddFinancialGoals dispatch={dispatch} />
          </Box>
        </Grid>

        {plannerData.financialGoals.length ? (
          <FinancialGoalsGrid financialGoals={plannerData.financialGoals} />
        ) : null}
      </Grid>
    </Step>
  );
};

export default FinancialGoalsStep;
