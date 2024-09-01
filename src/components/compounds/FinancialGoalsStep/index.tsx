import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Button } from '@mui/material';
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

  const getAddGoalButton = () => {
    return (
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        color="secondary"
        data-testid="add-goal-button"
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
          You don't have any goals added. Click on Add Goal to start adding your
          goals...
        </p>
        {getAddGoalButton()}
      </>
    );
  };

  return (
    <Step
      title={'Financial Goals'}
      subtext="Let's start by adding your financial goals. A financial goal is inthe
            most cases an event for which you have to flush out a lumpsum of
            money..."
    >
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Box>{getAddGoalButton()}</Box>
        </Box>

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
