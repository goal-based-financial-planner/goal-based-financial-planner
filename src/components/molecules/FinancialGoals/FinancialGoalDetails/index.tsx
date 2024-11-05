import { useState } from 'react';
import { Box, TextField, useTheme } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
  YEAR_PATTERN,
} from '../../../../types/constants';

interface AddFinancialGoalsProps {
  onAddGoal: (financialGoal: FinancialGoal) => void;
}

const FinancialGoalDetails = ({ onAddGoal }: AddFinancialGoalsProps) => {
  const theme = useTheme();
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

  const handleGoalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors({ ...validationErrors, goalName: false });
    setGoalName(e.target.value);
  };

  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors({ ...validationErrors, startYear: false });
    setStartYear(e.target.value);
  };

  const handleTargetYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors({ ...validationErrors, targetYear: false });
    setTargetYear(e.target.value);
  };

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors({ ...validationErrors, targetAmount: false });
    setTargetAmount(e.target.value);
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

    onAddGoal(
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
    <>
      <Box
        sx={{
          height: '180px',
          backgroundColor: theme.palette.cardBackGround.main,
          padding: 2,
          borderRadius: 4,
        }}
      >
        <Box sx={{ textAlign: 'right' }}>
          <span className="material-symbols-rounded">close</span>
        </Box>

        <Box pb={1}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Child Education"
            required
            error={validationErrors.goalName}
            value={goalName}
            onChange={handleGoalNameChange}
          />
        </Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          gap={4}
        >
          <TextField
            placeholder="2024"
            variant="standard"
            required
            error={validationErrors.startYear}
            value={startYear}
            onChange={handleStartYearChange}
          />

          <TextField
            placeholder="2040"
            variant="standard"
            required
            error={
              validationErrors.targetYear ||
              (isTargetYearValid && Number(targetYear) < Number(startYear))
            }
            value={targetYear}
            onChange={handleTargetYearChange}
            onBlur={handleTargetYearBlur}
          />
        </Box>
      </Box>
      <Box
        sx={{ padding: 1 }}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap={4}
        height="25px"
      >
        <TextField
          variant="standard"
          required
          error={validationErrors.targetAmount}
          value={targetAmount}
          onChange={handleTargetAmountChange}
          placeholder="1000000"
        />
        <Box
          onClick={handleAdd}
          sx={{
            padding: 2,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              cursor: 'pointer',
            },
            height: '3px',
            width: '3px',
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
