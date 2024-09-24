import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Button, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from '../../molecules/FinancialGoals/AddFinancialGoals';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step from '../../molecules/Step';
import { PlannerData } from '../../../domain/PlannerData';

type FinancialGoalsProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

const FinancialGoalsStep: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  const [showAddGoalsModal, setShowAddGoalsModal] = useState(false);
  const handleClose = () => {
    setShowAddGoalsModal(false);
  };

  return (
    <Step title={'Financial Goals'}>
      <Grid container rowGap={6}>
        <Grid xs={12} minHeight="80px">
          <AddFinancialGoals
            handleClose={handleClose}
            showAddGoalsModal={showAddGoalsModal}
            dispatch={dispatch}
          />
        </Grid>
        {plannerData.financialGoals.length ? (
          <Grid xs={12}>
            <FinancialGoalsTable
              goals={plannerData.financialGoals}
              dispatch={dispatch}
            />
          </Grid>
        ) : null}
      </Grid>
    </Step>
  );
};

export default FinancialGoalsStep;
