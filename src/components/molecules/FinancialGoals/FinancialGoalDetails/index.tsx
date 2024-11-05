import { useState } from 'react';
import { Box } from '@mui/material';
import CustomTextField from '../../../atoms/CustomTextField';
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
          backgroundColor: '#BCE6FF',
          padding: 2,
          borderRadius: 4,
        }}
      >
        <Box sx={{ textAlign: 'right' }}>
          <span className="material-symbols-rounded">close</span>{' '}
        </Box>

        <Box pb={1}>
          <CustomTextField
            fullWidth
            label="Goal Name"
            placeholder='Eg: "Child Education"'
            helperText="Enter valid Goal Name"
            required
            error={validationErrors.goalName}
            value={goalName}
            onChange={handleGoalNameChange}
            regex={ALPHANUMERIC_PATTERN}
          />
        </Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          gap={4}
        >
          <CustomTextField
            helperText="Enter valid start year"
            placeholder='Eg: "2024"'
            label="Investment Start Year"
            required
            error={validationErrors.startYear}
            value={startYear}
            onChange={handleStartYearChange}
            regex={YEAR_PATTERN}
          />

          <CustomTextField
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
          />
        </Box>
      </Box>
      <Box
        sx={{ padding: 1 }}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap={4}
        height="20px"
      >
        <CustomTextField
          label="Capital Needed"
          required
          helperText="Enter valid Amount"
          error={validationErrors.targetAmount}
          value={targetAmount}
          onChange={handleTargetAmountChange}
          regex={NUMBER_PATTERN}
          placeholder='Eg: "1000000"'
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
            backgroundColor: '#BCE6FF',
          }}
        >
          <span className="material-symbols-rounded">check</span>
        </Box>
      </Box>
    </>
  );
};

export default FinancialGoalDetails;
