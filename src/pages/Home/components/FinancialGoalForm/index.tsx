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
import { addFinancialGoal, updateFinancialGoal } from '../../../../store/plannerDataActions';
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
  title,
  embedded,
  initialGoal,
}: {
  sx?: SxProps<Theme>;
  dispatch: Dispatch<PlannerDataAction>;
  close: () => void;
  title?: string;
  embedded?: boolean;
  initialGoal?: FinancialGoal;
}) => {
  const isEdit = !!initialGoal;

  const resetForm = () => {
    setValidationErrors({});
    setGoalName('');
    setStartDate('');
    setTargetDate('');
    setTargetAmount('');
    setRecurringDurationYears('1');
    setInflationRate('5');
  };

  const [goalName, setGoalName] = useState<string>(initialGoal?.goalName ?? '');
  const goalType = initialGoal?.goalType ?? GoalType.ONE_TIME;
  const [startDate, setStartDate] = useState<string>(initialGoal?.startDate ?? '');
  const [targetDate, setTargetDate] = useState<string>(initialGoal?.targetDate ?? '');
  const [targetAmount, setTargetAmount] = useState<string>(
    initialGoal ? String(initialGoal.targetAmount) : '',
  );
  const [recurringDurationYears, setRecurringDurationYears] = useState<string>(
    initialGoal?.recurringDurationYears ? String(initialGoal.recurringDurationYears) : '1',
  );
  const [inflationRate, setInflationRate] = useState<string>(
    String(initialGoal?.inflationRate ?? 5),
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // For add-only mode: handles goalType toggling
  const [addGoalType, setAddGoalType] = useState<GoalType>(GoalType.ONE_TIME);
  const activeGoalType = isEdit ? goalType : addGoalType;

  const handleGoalTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddGoalType(e.target.value as GoalType);
    setValidationErrors({ ...validationErrors, startDate: false, targetDate: false });
  };

  const handleStartYearChange = (e: Dayjs | null) => {
    if (!e) return;
    setValidationErrors({ ...validationErrors, startDate: false });
    setStartDate(e.toString());
  };

  const handleTargetYearChange = (e: Dayjs | null) => {
    if (!e) return;
    setValidationErrors({ ...validationErrors, targetDate: false });
    setTargetDate(e.toString());
  };

  const handleSubmit = () => {
    const errors: Record<string, boolean> = {};

    if (!goalName || !ALPHANUMERIC_PATTERN.test(goalName)) {
      errors.goalName = true;
    }

    if (!targetAmount || !NUMBER_PATTERN.test(targetAmount)) {
      errors.targetAmount = true;
    }

    if (activeGoalType === GoalType.ONE_TIME) {
      if (!startDate) errors.startDate = true;
      if (!targetDate || dayjs(targetDate).isBefore(dayjs(startDate))) errors.targetDate = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const parsedInflationRate = parseFloat(inflationRate);
    const validInflationRate =
      !isNaN(parsedInflationRate) && parsedInflationRate >= 0 && parsedInflationRate <= 20
        ? parsedInflationRate
        : 5;

    const parsedDuration =
      activeGoalType === GoalType.RECURRING ? Number(recurringDurationYears) : undefined;

    if (isEdit) {
      updateFinancialGoal(dispatch, {
        id: initialGoal.id,
        goalName,
        startYear: startDate,
        targetYear: targetDate,
        targetAmount: Number(targetAmount),
        recurringDurationYears: parsedDuration,
        inflationRate: validInflationRate,
      });
      close();
    } else {
      addFinancialGoal(
        dispatch,
        new FinancialGoal(
          goalName,
          activeGoalType,
          startDate,
          targetDate,
          Number(targetAmount),
          parsedDuration,
          validInflationRate,
        ),
      );
      resetForm();
      close();
    }
  };

  const startDatePickerRef = useRef<HTMLDivElement | null>(null);
  const endDatePickerRef = useRef<HTMLDivElement | null>(null);

  const cardContent = (
    <Card
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        animation: `${fadeInAnimation} 0.5s ease-out`,
        width: embedded ? '100%' : { xs: 'calc(100vw - 32px)', sm: '500px' },
      }}
    >
      <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}>
        <Box sx={{ animation: `${fadeInAnimation} 0.5s ease-out` }}>
          {title && (
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your first financial goal to get started.
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              minHeight: '150px',
              backgroundColor: '#c1e8c6',
              padding: 3,
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <TextField
                fullWidth
                variant="standard"
                label="Goal Name"
                placeholder="Child Education"
                required
                sx={{ mt: -2 }}
                error={validationErrors.goalName}
                value={goalName}
                onChange={(e) => {
                  setValidationErrors({ ...validationErrors, goalName: false });
                  setGoalName(e.target.value);
                }}
              />
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <Typography variant="body2">Goal Type</Typography>
                <RadioGroup value={activeGoalType} onChange={handleGoalTypeChange} row>
                  <FormControlLabel
                    value={GoalType.ONE_TIME}
                    control={<Radio disabled={isEdit} />}
                    label="One Time"
                  />
                  <FormControlLabel
                    value={GoalType.RECURRING}
                    control={<Radio disabled={isEdit} />}
                    label="Recurring"
                  />
                </RadioGroup>
              </FormControl>
              {activeGoalType === GoalType.RECURRING && (
                <FormControl component="fieldset" sx={{ mt: 0.5 }}>
                  <Typography variant="body2">Duration</Typography>
                  <RadioGroup
                    value={recurringDurationYears}
                    onChange={(e) => setRecurringDurationYears(e.target.value)}
                    row
                  >
                    <FormControlLabel value="1" control={<Radio size="small" />} label="1 year" />
                    <FormControlLabel value="2" control={<Radio size="small" />} label="2 years" />
                    <FormControlLabel value="3" control={<Radio size="small" />} label="3 years" />
                  </RadioGroup>
                </FormControl>
              )}
              {activeGoalType === GoalType.ONE_TIME && (
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <DatePicker
                    label={'"month" and "year"'}
                    views={['month', 'year']}
                    defaultValue={initialGoal?.startDate ? dayjs(initialGoal.startDate) : undefined}
                    onChange={handleStartYearChange}
                    ref={startDatePickerRef}
                    slotProps={{
                      actionBar: { actions: ['accept'] },
                      dialog: { disableEscapeKeyDown: true, onClose: () => {} },
                      textField: {
                        variant: 'standard',
                        label: 'Start Date',
                        size: 'small',
                        error: validationErrors.startDate,
                        sx: { flex: 1 },
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => startDatePickerRef.current?.click()}>
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
                    defaultValue={initialGoal?.targetDate ? dayjs(initialGoal.targetDate) : undefined}
                    onChange={handleTargetYearChange}
                    ref={endDatePickerRef}
                    slotProps={{
                      actionBar: { actions: ['accept'] },
                      dialog: { disableEscapeKeyDown: true, onClose: () => {} },
                      textField: {
                        variant: 'standard',
                        label: 'Target Date',
                        error: validationErrors.targetDate,
                        sx: { flex: 1 },
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => endDatePickerRef.current?.click()}>
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
              sx={{ mt: -1, flex: 1, minWidth: '120px' }}
              error={validationErrors.targetAmount}
              value={targetAmount}
              onChange={(e) => {
                setValidationErrors({ ...validationErrors, targetAmount: false });
                setTargetAmount(e.target.value);
              }}
              placeholder="1000000"
            />
            <TextField
              variant="standard"
              size="medium"
              type="number"
              label="Inflation"
              sx={{ mt: -1, width: '80px' }}
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              inputProps={{ min: 0, max: 20, step: 0.5 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            <Box
              onClick={handleSubmit}
              sx={{
                padding: 1,
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { cursor: 'pointer' },
                height: '18px',
                width: '18px',
                backgroundColor: '#c1e8c6',
              }}
            >
              <span className="material-symbols-rounded">
                {isEdit ? 'save' : 'check'}
              </span>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (embedded) {
    return cardContent;
  }

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
        {cardContent}
      </Box>
    </StyledBackdrop>
  );
};

export default FinancialGoalForm;

FinancialGoalForm.defaultProps = {
  sx: {},
};
