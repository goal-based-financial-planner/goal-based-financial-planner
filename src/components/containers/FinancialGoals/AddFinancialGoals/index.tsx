import {
  Button,
  Unstable_Grid2 as Grid,
  Modal,
  Paper,
  Stack,
} from '@mui/material';
import React, { Dispatch, useState } from 'react';
import { Add, CancelRounded } from '@mui/icons-material';
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
              placeholder='Eg: "Child Education"'
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid Goal Name"
              required
              error={validationErrors.goalName}
              value={goalName}
              onChange={handleGoalNameChange}
              regex={ALPHANUMERIC_PATTERN}
              InputProps={{
                endAdornment: (
                  <CustomTooltip tooltipText="Give your goal a name" />
                ),
              }}
            />
          </Grid>

          <Grid xs={6}>
            <CustomTextField
              label="Capital Needed"
              placeholder='Eg: "1000000"'
              sx={{ minWidth: '270px', minHeight: 80 }}
              required
              helperText="Enter valid Amount"
              error={validationErrors.targetAmount}
              value={targetAmount}
              onChange={handleTargetAmountChange}
              regex={NUMBER_PATTERN}
              InputProps={{
                endAdornment: (
                  <CustomTooltip tooltipText="This is the capital you think you would need as of today" />
                ),
              }}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid start year"
              placeholder='Eg: "2024"'
              label="Investment Start Year"
              required
              error={validationErrors.startYear}
              value={startYear}
              onChange={handleStartYearChange}
              regex={YEAR_PATTERN}
              InputProps={{
                endAdornment: (
                  <CustomTooltip tooltipText="When are you planning to start investing?" />
                ),
              }}
            />
          </Grid>
          <Grid xs={6}>
            <CustomTextField
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid target year"
              placeholder='Eg: "2040"'
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
                endAdornment: (
                  <CustomTooltip tooltipText="When do you want to meet this goal by? " />
                ),
              }}
            />
          </Grid>
          <Grid xs={6}>
            <Button
              startIcon={<CancelRounded />}
              variant="outlined"
              color="secondary"
              onClick={handleCloseAndReset}
            >
              Cancel
            </Button>
          </Grid>
          <Grid
            xs={6}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <Button
              startIcon={<Add />}
              onClick={handleAdd}
              variant="contained"
              color="secondary"
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default AddFinancialGoals;
