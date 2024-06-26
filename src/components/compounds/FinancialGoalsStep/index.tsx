import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from '../../molecules/FinancialGoals/FinancialGoalsTable';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from '../../molecules/FinancialGoals/AddFinancialGoals';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step, { StepProps } from '../../molecules/Step';
import { PlannerData } from '../../../domain/PlannerData';

type FinancialGoalsProps = Pick<
  StepProps,
  'isExpanded' | 'onContinue' | 'onEdit'
> & {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
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
          You don't have any goals added. Click on Add Goal to start adding your
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
      subtext="Let's start by adding your financial goals. A financial goal is inthe
            most cases an event for which you have to flush out a lumpsum of
            money..."
      isContinueDisabled={plannerData.financialGoals.length === 0}
      summaryText={`You have added ${plannerData.getGoalSummaryAsText()} goals`}
    >
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {plannerData.financialGoals.length > 0 ? (
            <Box>{getAddGoalButton()}</Box>
          ) : null}
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
