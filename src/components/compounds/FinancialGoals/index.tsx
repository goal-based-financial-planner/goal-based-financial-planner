import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Button, Unstable_Grid2 as Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from '../../molecules/FinancialGoals/AddFinancialGoals';
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
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        color="secondary"
        onClick={() => {
          setShowAddGoalsModal(true);
        }}
      >
        Add Goal
      </Button>
    );
  };

  const prepareEmptyBodyPlaceholder = () => {
    return (
      <>
        <p>
          Yon't have any goals added. Click on Add Goal to start adding your
          goals...
        </p>
        {getAddGoalButton()}
      </>
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
            emptyBodyPlaceholder={prepareEmptyBodyPlaceholder()}
            dispatch={dispatch}
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
