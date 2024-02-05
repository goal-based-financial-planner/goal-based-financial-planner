import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Button, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from '../../molecules/FinancialGoals/AddFinancialGoals';
import { PlannerData } from '../../../domain/PlannerData';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { StepType } from '../../../types/types';
import Step from '../../molecules/Step';

type FinancialGoalsProps = StepType & {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoalsStep: React.FC<FinancialGoalsProps> = ({
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

  return (
    <Step
      isExpanded={isExpanded}
      onContinue={onContinue}
      onEdit={onEdit}
      title={'Financial Goals'}
      subtext="Let's start by adding your financial goals. A financial goal is in
            most cases an event for which you have to flush out a lumpsum of
            money..."
      isContinueDisabled={plannerData.getFinancialGoalSummary().length === 0}
      summaryText={`You have added ${plannerData.getGoalSummaryAsText()} goals`}
    >
      <>
        <Grid
          xs={12}
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

        <FinancialGoalsTable
          goals={plannerData.financialGoals}
          emptyBodyPlaceholder={prepareEmptyBodyPlaceholder()}
          dispatch={dispatch}
        />

        <AddFinancialGoals
          handleClose={handleClose}
          showAddGoalsModal={showAddGoalsModal}
          dispatch={dispatch}
        />
      </>
    </Step>
  );
};

export default FinancialGoalsStep;
