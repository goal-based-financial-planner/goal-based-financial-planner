import {
  Box,
  Button,
  Unstable_Grid2 as Grid,
  Modal,
  Paper,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import React, { Dispatch, useState } from 'react';
import { Add, CancelRounded } from '@mui/icons-material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { addFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import CustomTextField from '../../../atoms/CustomTextField';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
  YEAR_PATTERN,
} from '../../../../types/constants';
import CustomTooltip from '../../../atoms/CustomTooltip';

interface AddFinancialGoalsProps {
  dispatch: Dispatch<PlannerDataAction>;
}

const AddFinancialGoals: React.FC<AddFinancialGoalsProps> = ({
  dispatch,
}: AddFinancialGoalsProps) => {
  const resetForm = () => {
    setValidationErrors({});
    setGoalName('');
    setStartYear('');
    setTargetYear('');
    setTargetAmount('');
    setIsTargetYearValid(false);
  };

  const [goalName, setGoalName] = useState<string>('');
  const [startYear, setStartYear] = useState<string>(
    String(new Date().getFullYear()),
  );
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

    resetForm();
  };

  return (
    <Card sx={{ borderRadius: 5, border: '1px solid #d1d9e6' }}>
      <CardContent>
        <Grid container columnGap={2} sx={{ justifyContent: 'center' }}>
          <Grid xs={2}>
            <CustomTextField
              label="Goal Name"
              placeholder='Eg: "Child Education"'
              fullWidth
              helperText="Enter valid Goal Name"
              required
              error={validationErrors.goalName}
              value={goalName}
              variant={'outlined'}
              onChange={handleGoalNameChange}
              regex={ALPHANUMERIC_PATTERN}
              InputProps={{
                endAdornment: (
                  <CustomTooltip tooltipText="Give your goal a name" />
                ),
              }}
            />
          </Grid>

          <Grid xs={2}>
            <CustomTextField
              label="Capital Needed"
              placeholder='Eg: "1000000"'
              fullWidth
              required
              helperText="Enter valid Amount"
              error={validationErrors.targetAmount}
              value={targetAmount}
              variant={'outlined'}
              onChange={handleTargetAmountChange}
              regex={NUMBER_PATTERN}
              InputProps={{
                endAdornment: (
                  <CustomTooltip tooltipText="This is the capital you think you would need as of today" />
                ),
              }}
            />
          </Grid>
          <Grid xs={2}>
            <CustomTextField
              fullWidth
              helperText="Enter valid start year"
              placeholder='Eg: "2024"'
              label="Investment Start Year"
              required
              error={validationErrors.startYear}
              value={startYear}
              variant={'outlined'}
              onChange={handleStartYearChange}
              regex={YEAR_PATTERN}
              InputProps={{
                endAdornment: (
                  <CustomTooltip tooltipText="When are you planning to start investing?" />
                ),
              }}
            />
          </Grid>
          <Grid xs={2} justifyContent={'start'}>
            <CustomTextField
              fullWidth
              helperText="Enter valid target year"
              placeholder='Eg: "2040"'
              label="Investment End Year"
              required
              value={targetYear}
              variant={'outlined'}
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

          <Grid xs={2} justifyContent={'start'}>
            <Button
              startIcon={<Add />}
              onClick={handleAdd}
              variant="contained"
              color="secondary"
              sx={{ mt: 1 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AddFinancialGoals;
