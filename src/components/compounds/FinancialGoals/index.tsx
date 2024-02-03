import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from '../../molecules/FinancialGoals/AddFinancialGoals';
import { PlannerData } from '../../../domain/PlannerData';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import CustomPaper from '../../atoms/CustomPaper';
import { StepType } from '../../../types/types';

type FinancialGoalsProps = StepType & {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoals: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
  isExpanded,
  onContinue,
  onEdit,
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

  const getGoalSummaryAsText = () => {
    const goalSummary = plannerData
      .getFinancialGoalSummary()
      .filter((e) => e.numberOfGoals > 0)
      .map((e) => `${e.numberOfGoals} ${e.termType}`);

    const summaryText = goalSummary.join(', ');
    const lastIndex = summaryText.lastIndexOf(',');
    if (lastIndex !== -1) {
      const updatedSummaryText =
        summaryText.substring(0, lastIndex) +
        ' and ' +
        summaryText.substring(lastIndex + 1);
      return updatedSummaryText;
    }

    return summaryText;
  };

  return isExpanded ? (
    <CustomPaper>
      {/* TODO: Pass only necessary data, don't pass entire planner data */}
      <Grid container spacing={2} justifyContent="flex-end">
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
      <Stack alignItems="flex-end">
        <Button
          disabled={plannerData.financialGoals.length === 0}
          sx={{ fontSize: '1.2rem' }}
          onClick={onContinue}
          variant="contained"
          color="primary"
        >
          Continue
        </Button>
      </Stack>
    </CustomPaper>
  ) : (
    <CustomPaper>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={11}>
          <h2>Financial Goals</h2>
          <Typography>
            {`You have added ${getGoalSummaryAsText()} goals`}
          </Typography>
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

export default FinancialGoals;
