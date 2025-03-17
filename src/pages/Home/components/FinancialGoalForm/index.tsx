import { keyframes, styled } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  SxProps,
  TextField,
  Theme,
} from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { Dispatch, useRef, useState } from 'react';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { addFinancialGoal } from '../../../../store/plannerDataActions';
import { CalendarIcon, MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
} from '../../../../types/constants';

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

    if (!startDate) {
      errors.startDate = true;
    }

    if (!targetDate || dayjs(targetDate).isBefore(dayjs(startDate))) {
      errors.targetDate = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    handleAddGoal(
      new FinancialGoal(goalName, startDate, targetDate, Number(targetAmount)),
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
            width: '300px',
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
                    label="Goal name"
                    placeholder="Child Education"
                    required
                    sx={{ mt: -2 }}
                    error={validationErrors.goalName}
                    value={goalName}
                    onChange={handleGoalNameChange}
                  />
                  <MobileDatePicker
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
                  <MobileDatePicker
                    label={'"month" and "year"'}
                    views={['month', 'year']}
                    onChange={handleTargetYearChange}
                    ref={endDatePickerRef}
                    slotProps={{
                      textField: {
                        variant: 'standard',
                        label: 'Target Date',
                        error: validationErrors.targetDate,
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
