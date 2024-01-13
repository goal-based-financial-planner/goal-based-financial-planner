import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from './FinancialGoalsTable';
import { Box, Unstable_Grid2 as Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from './AddFinancialGoals';
import CustomButton from '../../common/CustomButton';
import { PlannerData } from '../../../domain/PlannerData';
import { PlannerDataAction } from '../../../store/plannerDataReducer';

type FinancialGoalsProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoals: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  const [showAddGoalsModal, setShowAddGoalsModal] = useState(false);
  const handleClose = () => {
    setShowAddGoalsModal(false);
  };

  const getAddGoalButton = () => {
    return (
      <CustomButton
        text="Add Goal"
        startIcon={<AddIcon />}
        onClick={() => {
          setShowAddGoalsModal(true);
        }}
      />
    );
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={10}>
          <h2>Financial Goals</h2>
        </Grid>
        <Grid
          xs={2}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {plannerData.financialGoals.length > 0 ? (
            <Box>{getAddGoalButton()}</Box>
          ) : null}
        </Grid>
        <Grid xs={12}>
          <Box>
            Let's start by adding your financial goals. A financial goal is in
            most cases an event for which you have to flush out a lumpsum of
            money...
          </Box>
        </Grid>
        <Grid xs={12} sx={{ mb: 5, mt: 5 }}>
          <FinancialGoalsTable
            goals={plannerData.financialGoals}
            addGoalButton={getAddGoalButton()}
          />
        </Grid>
      </Grid>

      <AddFinancialGoals
        handleClose={handleClose}
        showAddGoalsModal={showAddGoalsModal}
        dispatch={dispatch}
      />
    </>
  );
};

export default FinancialGoals;
