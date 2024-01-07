import { Unstable_Grid2 as Grid, Modal, Paper, Stack } from '@mui/material';
import React, { Dispatch, useState } from 'react';
import CustomButton from '../../../common/CustomButton';
import { CancelRounded, SaveAltOutlined } from '@mui/icons-material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { addFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import CustomTextField from '../../../common/CustomTextField';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
  YEAR_PATTERN,
} from '../../../../domain/constants';

interface AddFinancialGoalsProps {
  showAddGoalsModal: boolean;
  handleClose: () => void;
  dispatch: Dispatch<PlannerDataAction>;
}
const AddFinancialGoals: React.FC<AddFinancialGoalsProps> = ({
  showAddGoalsModal,
  handleClose,
  dispatch,
}: AddFinancialGoalsProps) => {
  const handleCloseAndReset = () => {
    setGoalName('');
    setStartYear('');
    setTargetYear('');
    setTargetAmount('');
    setIsTargetYearValid(false);

    handleClose();
  };

  const handleAdd = () => {
    addFinancialGoal(
      dispatch,
      new FinancialGoal(
        goalName,
        Number(startYear),
        Number(targetYear),
        Number(targetAmount),
      ),
    );
    handleCloseAndReset();
  };

  const [goalName, setGoalName] = useState<string>('');
  const [startYear, setStartYear] = useState<string>('');
  const [targetYear, setTargetYear] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [isTargetYearValid, setIsTargetYearValid] = useState<boolean>(false);

  const handleGoalNameChange = (value: string) => {
    setGoalName(value);
  };

  const handleStartYearChange = (value: any) => {
    setStartYear(value);
  };
  const handleTargetYearChange = (value: any) => {
    setTargetYear(value);
  };
  const handleTargetAmountChange = (value: any) => {
    setTargetAmount(value);
  };

  const handleTargetYearBlur = () => {
    setIsTargetYearValid(true);
  };

  return (
    <Modal
      component={Stack}
      open={showAddGoalsModal}
      alignItems="center"
      justifyContent="center"
      onClose={handleClose}
    >
      <Paper
        component={Stack}
        p={3}
        sx={{
          position: 'absolute',
          minWidth: {
            xs: '90%',
            sm: null,
            md: 600,
          },
          maxWidth: 400,
          width: {
            xs: '80%',
            md: 600,
          },
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add Goal</h2>

        <Grid container spacing={5} alignItems="center" mt={0.5}>
          <Grid xs={6}>
            <CustomTextField
              label="Goal Name"
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid Goal Name"
              required
              value={goalName}
              onChange={handleGoalNameChange}
              regex={ALPHANUMERIC_PATTERN}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              label="Amount"
              sx={{ minWidth: '270px', minHeight: 80 }}
              required
              helperText="Enter valid Amount"
              value={targetAmount}
              onChange={handleTargetAmountChange}
              regex={NUMBER_PATTERN}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid start year"
              label="Investment Start Year"
              required
              value={startYear}
              onChange={handleStartYearChange}
              regex={YEAR_PATTERN}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid start year"
              label="Investment End Year"
              required
              value={targetYear}
              regex={YEAR_PATTERN}
              error={isTargetYearValid && targetYear < startYear}
              additionalHelperText="Target year should be greater than start year"
              onChange={handleTargetYearChange}
              onBlur={handleTargetYearBlur}
            />
          </Grid>
          <Grid xs={6}>
            <CustomButton
              text="Cancel"
              startIcon={<CancelRounded />}
              variant="outlined"
              onClick={handleCloseAndReset}
            />
          </Grid>
          <Grid
            xs={6}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <CustomButton
              text="Add"
              startIcon={<SaveAltOutlined />}
              onClick={handleAdd}
            />
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default AddFinancialGoals;
