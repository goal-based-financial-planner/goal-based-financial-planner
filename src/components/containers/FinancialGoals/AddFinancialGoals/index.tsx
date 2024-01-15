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
import CustomTooltip from '../../../common/CustomTooltip';

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
    setValidationErrors({});
    setGoalName('');
    setStartYear('');
    setTargetYear('');
    setTargetAmount('');
    setIsTargetYearValid(false);
    handleClose();
  };

  const [goalName, setGoalName] = useState<string>('');
  const [startYear, setStartYear] = useState<string>('');
  const [targetYear, setTargetYear] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [isTargetYearValid, setIsTargetYearValid] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  const handleGoalNameChange = (value: string) => {
    setValidationErrors({ ...validationErrors, goalName: false });
    setGoalName(value);
  };

  const handleStartYearChange = (value: any) => {
    setValidationErrors({ ...validationErrors, startYear: false });
    setStartYear(value);
  };

  const handleTargetYearChange = (value: any) => {
    setValidationErrors({ ...validationErrors, targetYear: false });
    setTargetYear(value);
  };

  const handleTargetAmountChange = (value: any) => {
    setValidationErrors({ ...validationErrors, targetAmount: false });
    setTargetAmount(value);
  };

  const handleTargetYearBlur = () => {
    setIsTargetYearValid(true);
  };

  const handleAdd = () => {
    const errors: Record<string, boolean> = {};

    if (!goalName || !ALPHANUMERIC_PATTERN.test(goalName)) {
      errors.goalName = true;
    }

    if (!targetAmount || !NUMBER_PATTERN.test(targetAmount)) {
      errors.targetAmount = true;
    }

    if (!startYear || !YEAR_PATTERN.test(startYear)) {
      errors.startYear = true;
    }

    if (
      !targetYear ||
      !YEAR_PATTERN.test(targetYear) ||
      (isTargetYearValid && Number(targetYear) < Number(startYear))
    ) {
      errors.targetYear = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

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
              error={validationErrors.goalName}
              value={goalName}
              onChange={handleGoalNameChange}
              regex={ALPHANUMERIC_PATTERN}
              InputProps={{
                endAdornment: <CustomTooltip tooltipText="Goal Name" />,
              }}
            />
          </Grid>

          <Grid xs={6}>
            <CustomTextField
              label="Amount"
              sx={{ minWidth: '270px', minHeight: 80 }}
              required
              helperText="Enter valid Amount"
              error={validationErrors.targetAmount}
              value={targetAmount}
              onChange={handleTargetAmountChange}
              regex={NUMBER_PATTERN}
              InputProps={{
                endAdornment: <CustomTooltip tooltipText="Goal Name" />,
              }}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid start year"
              label="Investment Start Year"
              required
              error={validationErrors.startYear}
              value={startYear}
              onChange={handleStartYearChange}
              regex={YEAR_PATTERN}
              InputProps={{
                endAdornment: <CustomTooltip tooltipText="Goal Name" />,
              }}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid target year"
              label="Investment End Year"
              required
              value={targetYear}
              error={
                validationErrors.targetYear ||
                (isTargetYearValid && Number(targetYear) < Number(startYear))
              }
              additionalHelperText="Target year should be greater than start year"
              onChange={handleTargetYearChange}
              onBlur={handleTargetYearBlur}
              regex={YEAR_PATTERN}
              InputProps={{
                endAdornment: <CustomTooltip tooltipText="Goal Name" />,
              }}
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
