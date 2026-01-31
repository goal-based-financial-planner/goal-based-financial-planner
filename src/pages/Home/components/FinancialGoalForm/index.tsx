import { keyframes, styled } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { Dispatch, useRef, useState } from 'react';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { addFinancialGoal } from '../../../../store/plannerDataActions';
import { CalendarIcon } from '@mui/x-date-pickers';
import DatePicker from '../../../../components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
} from '../../../../types/constants';
import { GoalType } from '../../../../types/enums';

const StyledBackdrop = styled('div')(({ theme }) => ({
  zIndex: theme.zIndex.modal + 1,
  color: '#fff',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}));

const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FinancialGoalForm = ({
  sx,
  dispatch,
  close,
}: {
  sx?: SxProps<Theme>;
  dispatch: Dispatch<PlannerDataAction>;
  close: () => void;
}) => {
  const handleAddGoal = (financialGoal: FinancialGoal) => {
    addFinancialGoal(dispatch, financialGoal);
    close();
  };

  const resetForm = () => {
    setValidationErrors({});
    setGoalName('');
    setGoalType(GoalType.ONE_TIME);
    setStartDate('');
    setTargetDate('');
    setTargetAmount('');
  };

  const [goalName, setGoalName] = useState<string>('');
  const [goalType, setGoalType] = useState<GoalType>(GoalType.ONE_TIME);
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

  const handleGoalTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalType(e.target.value as GoalType);
    // Clear date validation errors when switching goal types
    setValidationErrors({
      ...validationErrors,
      startDate: false,
      targetDate: false,
    });
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

    // Only validate dates for one-time goals
    if (goalType === GoalType.ONE_TIME) {
      if (!startDate) {
        errors.startDate = true;
      }

      if (!targetDate || dayjs(targetDate).isBefore(dayjs(startDate))) {
        errors.targetDate = true;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    handleAddGoal(
      new FinancialGoal(
        goalName,
        goalType,
        startDate,
        targetDate,
        Number(targetAmount),
      ),
    );

    resetForm();
  };

  const startDatePickerRef = useRef<HTMLDivElement | null>(null);
  const endDatePickerRef = useRef<HTMLDivElement | null>(null);

  return (
    <StyledBackdrop sx={sx} onClick={close}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            animation: `${fadeInAnimation} 0.5s ease-out`,
            width: '500px',
          }}
        >
          <CardContent
            sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}
          >
            <Box
              sx={{
                animation: `${fadeInAnimation} 0.5s ease-out`,
              }}
            >
              <Box
                sx={{
                  height: '150px',
                  backgroundColor: '#c1e8c6',
                  padding: 3,
                  borderRadius: 4,
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                >
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Goal Name"
                    placeholder="Child Education"
                    required
                    sx={{ mt: -2 }}
                    error={validationErrors.goalName}
                    value={goalName}
                    onChange={handleGoalNameChange}
                  />
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <Typography variant="body2">Goal Type</Typography>
                    <RadioGroup
                      value={goalType}
                      onChange={handleGoalTypeChange}
                      row
                    >
                      <FormControlLabel
                        value={GoalType.ONE_TIME}
                        control={<Radio />}
                        label="One Time"
                      />
                      <FormControlLabel
                        value={GoalType.RECURRING}
                        control={<Radio />}
                        label="Recurring"
                      />
                    </RadioGroup>
                  </FormControl>
                  {goalType === GoalType.ONE_TIME && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <DatePicker
                        label={'"month" and "year"'}
                        views={['month', 'year']}
                        onChange={handleStartYearChange}
                        ref={startDatePickerRef}
                        slotProps={{
                          textField: {
                            variant: 'standard',
                            label: 'Start Date',
                            size: 'small',
                            error: validationErrors.startDate,
                            sx: { flex: 1 },
                            InputProps: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      startDatePickerRef.current?.click()
                                    }
                                  >
                                    <CalendarIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                      <DatePicker
                        label={'"month" and "year"'}
                        views={['month', 'year']}
                        onChange={handleTargetYearChange}
                        ref={endDatePickerRef}
                        slotProps={{
                          textField: {
                            variant: 'standard',
                            label: 'Target Date',
                            error: validationErrors.targetDate,
                            sx: { flex: 1 },
                            InputProps: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      endDatePickerRef.current?.click()
                                    }
                                  >
                                    <CalendarIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
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
                  size="medium"
                  label="Target Amount"
                  required
                  sx={{ mt: -1, flex: 1, minWidth: '200px' }}
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
                    backgroundColor: '#c1e8c6',
                  }}
                >
                  <span className="material-symbols-rounded">check</span>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </StyledBackdrop>
  );
};

export default FinancialGoalForm;

FinancialGoalForm.defaultProps = {
  sx: {},
};
