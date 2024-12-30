import { useState } from 'react';
import { Box, TextField, useTheme } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
} from '../../../../types/constants';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

interface AddFinancialGoalsProps {
  onAddGoal: (financialGoal: FinancialGoal) => void;
}

const FinancialGoalDetails = ({ onAddGoal }: AddFinancialGoalsProps) => {
  const theme = useTheme();
  const resetForm = () => {
    setValidationErrors({});
    setGoalName('');
    setStartDate('');
    setTargetDate('');
    setTargetAmount('');
  };

  const [goalName, setGoalName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  const handleGoalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors({ ...validationErrors, goalName: false });
    setGoalName(e.target.value);
  };

  const handleStartYearChange = (e: Dayjs | null) => {
    setValidationErrors({ ...validationErrors, startDate: false });
    setStartDate(e!.toString());
  };

  const handleTargetYearChange = (e: Dayjs | null) => {
    setValidationErrors({ ...validationErrors, targetDate: false });
    setTargetDate(e!.toString());
  };

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors({ ...validationErrors, targetAmount: false });
    setTargetAmount(e.target.value);
  };

  const handleAdd = () => {
    const errors: Record<string, boolean> = {};

    if (!goalName || !ALPHANUMERIC_PATTERN.test(goalName)) {
      errors.goalName = true;
    }

    if (!targetAmount || !NUMBER_PATTERN.test(targetAmount)) {
      errors.targetAmount = true;
    }

    console.log(startDate);
    if (!startDate) {
      errors.startDate = true;
    }

    if (!targetDate || dayjs(targetDate).isBefore(dayjs(startDate))) {
      errors.targetDate = true;
    }

    if (Object.keys(errors).length > 0) {
      console.log(errors);
      setValidationErrors(errors);
      return;
    }

    onAddGoal(
      new FinancialGoal(goalName, startDate, targetDate, Number(targetAmount)),
    );

    resetForm();
  };

  return (
    <>
      <Box
        sx={{
          height: '150px',
          backgroundColor: theme.palette.cardBackGround.main,
          padding: 3,
          borderRadius: 4,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <TextField
            fullWidth
            variant="standard"
            label="Goal name"
            placeholder="Child Education"
            required
            sx={{ mt: -2 }}
            error={validationErrors.goalName}
            value={goalName}
            onChange={handleGoalNameChange}
          />
          <DatePicker
            label={'"month" and "year"'}
            views={['month', 'year']}
            onChange={handleStartYearChange}
            slotProps={{
              textField: {
                variant: 'standard',
                label: 'Start Date',
                size: 'small',
                error: validationErrors.startDate,
              },
              popper: {
                disablePortal: true,
                sx: {
                  transformOrigin: 'top',
                },
              },
            }}
          />
          <DatePicker
            label={'"month" and "year"'}
            views={['month', 'year']}
            onChange={handleTargetYearChange}
            slotProps={{
              textField: {
                variant: 'standard',
                label: 'Target Date',
                error: validationErrors.targetDate,
              },

              popper: {
                disablePortal: true,
                sx: {
                  transformOrigin: 'top',
                },
              },
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{ padding: 2 }}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap={4}
        height="35px"
      >
        <TextField
          variant="standard"
          size="small"
          label="Target Amount"
          required
          sx={{ mt: -1 }}
          error={validationErrors.targetAmount}
          value={targetAmount}
          onChange={handleTargetAmountChange}
          placeholder="1000000"
        />
        <Box
          onClick={handleAdd}
          sx={{
            padding: 1,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              cursor: 'pointer',
            },
            height: '18px',
            width: '18px',
            backgroundColor: theme.palette.cardBackGround.main,
          }}
        >
          <span className="material-symbols-rounded">check</span>
        </Box>
      </Box>
    </>
  );
};

export default FinancialGoalDetails;
