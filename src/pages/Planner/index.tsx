import React from 'react';
import {
  Grid2 as Grid,
  Box,
  Typography,
  Drawer,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CalendarIcon } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import DatePicker from '../../components/DatePicker';
import InvestmentSuggestionsBox, {
  InvestmentBreakdownBasedOnTermType,
} from './components/InvestmentSuggestions';
import { Dispatch, useRef, useState, useMemo, useCallback } from 'react';
import { GoalType, TermType } from '../../types/enums';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import { PlannerData } from '../../domain/PlannerData';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import TermWiseProgressBox, {
  TermTypeWiseProgressData,
} from './components/TermwiseProgressBox';
import GoalBox from './components/GoalBox';
import { StyledBox } from '../../components/StyledBox';
import PageTour from './components/Pagetour';
import TargetBox from './components/TargetBox';
import CongratulationsPage from '../CongratulationsPage';

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
  headerRight?: React.ReactNode;
};

const Planner = ({ plannerData, dispatch, headerRight }: PlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());
  const [showDrawer, setShowDrawer] = useState(false);

  const handleChange = useCallback((value: Dayjs | null) => {
    setSelectedDate(value!.toString());
  }, []);

  const targetAmount = useMemo(
    () =>
      plannerData.financialGoals.reduce(
        (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
        0,
      ),
    [plannerData.financialGoals],
  );

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  
  const investmentBreakdownForAllGoals = useMemo(
    () => calculateInvestmentNeededForGoals(plannerData, selectedDate),
    [calculateInvestmentNeededForGoals, plannerData, selectedDate],
  );

  const investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[] =
    useMemo(() => {
      const result: InvestmentBreakdownBasedOnTermType[] = [];
      
      [TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].forEach(
        (termType) => {
          const goalsForTerm = plannerData.financialGoals.filter(
            (goal) => goal.getTermType() === termType,
          );

          if (goalsForTerm.length > 0) {
            const goalNames = goalsForTerm.map((goal) => goal.goalName);

            const investmentBreakDownPerTerm =
              investmentBreakdownForAllGoals.filter((ib) =>
                goalNames.includes(ib.goalName),
              );

            result.push({
              termType,
              investmentBreakdown: investmentBreakDownPerTerm,
            });
          }
        },
      );
      
      return result;
    }, [plannerData.financialGoals, investmentBreakdownForAllGoals]);

  const termTypeWiseProgressData: TermTypeWiseProgressData[] = useMemo(() => {
    const result: TermTypeWiseProgressData[] = [];

    [TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].forEach(
      (termType) => {
        const goalsForTerm = plannerData.financialGoals.filter(
          (goal) => goal.getTermType() === termType,
        );

        if (goalsForTerm.length > 0) {
          const goalNames = goalsForTerm.map((goal) => goal.goalName);

          const investmentBreakDownPerTerm =
            investmentBreakdownForAllGoals.filter((ib) =>
              goalNames.includes(ib.goalName),
            );

          const termTypeSum = Math.round(
            goalsForTerm.reduce(
              (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
              0,
            ),
          );

          const progressPercent = Math.round(
            (investmentBreakDownPerTerm.reduce(
              (acc, val) => acc + val.currentValue,
              0,
            )! /
              termTypeSum) *
              100,
          );

          result.push({
            termType,
            termTypeWiseData: {
              goalNames,
              termTypeSum,
              progressPercent,
            },
          });
        }
      },
    );

    return result;
  }, [plannerData.financialGoals, investmentBreakdownForAllGoals]);

  const projectionYears = useMemo(() => {
    const oneTimeGoals = plannerData.financialGoals.filter(
      (g) => g.goalType !== GoalType.RECURRING,
    );
    if (oneTimeGoals.length === 0) return 10;
    const maxYears = Math.max(
      ...oneTimeGoals.map((g) => Math.ceil(dayjs(g.getTargetDate()).diff(dayjs(), 'months') / 12)),
    );
    return Math.max(maxYears, 1);
  }, [plannerData.financialGoals]);

  const completedGoals = useMemo(
    () =>
      plannerData.financialGoals.filter((goal) => {
        return dayjs(selectedDate).isAfter(goal.getTargetDate());
      }),
    [plannerData.financialGoals, selectedDate],
  );

  const setShowDrawerCallback = useCallback((value: boolean) => {
    setShowDrawer(value);
  }, []);

  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const areAllGoalsCompleted =
    completedGoals.length === plannerData.financialGoals.length;
  return (
    <>
      <PageTour />

      <Grid container padding={2} spacing={2} height="100%">
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Left: title + date picker inline */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
              className="navbar-home"
              variant="h4"
              fontWeight="bold"
              color="primary"
            >
              Goal Based Financial Planner
            </Typography>
            <StyledBox className="calendar-button">
              <DatePicker
                label={'"month" and "year"'}
                views={['month', 'year']}
                defaultValue={dayjs()}
                onChange={handleChange}
                ref={datePickerRef}
                format={isSmallScreen ? 'MM/YYYY' : 'MMMM YYYY'}
                slotProps={{
                  textField: {
                    variant: 'standard',
                    size: 'small',
                    label: '',
                    sx: {
                      width: {
                        xs: '120px',
                        sm: '120px',
                        md: 'auto',
                      },
                    },
                    InputProps: {
                      disableUnderline: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => datePickerRef.current?.click()}
                          >
                            <CalendarIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </StyledBox>
          </Box>

          {/* Right: save controls / action buttons */}
          {headerRight && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {headerRight}
            </Box>
          )}
        </Grid>
        {areAllGoalsCompleted ? (
          <Box
            sx={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              mt: 5,
            }}
          >
            <CongratulationsPage
              targetAmount={targetAmount}
              goals={plannerData.financialGoals.map((goal) => ({
                name: goal.getGoalName(),
                amount: goal.getInflationAdjustedTargetAmount(),
              }))}
            />
          </Box>
        ) : (
          <>
            <Grid container size={12} spacing={2} sx={{ alignItems: 'stretch', mb: 4 }}>
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                sx={{ display: 'flex' }}
              >
                <TargetBox
                  targetAmount={targetAmount}
                  dispatch={dispatch}
                  setShowDrawer={setShowDrawerCallback}
                  termTypeWiseProgressData={termTypeWiseProgressData}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 9 }} sx={{ display: 'flex', flexGrow: 1 }}>
                <TermWiseProgressBox data={termTypeWiseProgressData} />
              </Grid>
            </Grid>
            <Grid container size={12} spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 8, lg: 9 }}>
                <InvestmentSuggestionsBox
                  dispatch={dispatch}
                  investmentAllocations={plannerData.investmentAllocations}
                  investmentBreakdownBasedOnTermType={
                    investmentBreakdownBasedOnTermType
                  }
                  investmentLogs={plannerData.investmentLogs}
                  projectionYears={projectionYears}
                />
              </Grid>
              <Grid
                size={{ xs: 12, sm: 12, md: 4, lg: 3 }}
                sx={{
                  display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' },
                }}
              >
                <GoalBox
                  financialGoals={plannerData.financialGoals}
                  investmentBreakdownForAllGoals={
                    investmentBreakdownForAllGoals
                  }
                  selectedDate={selectedDate}
                  dispatch={dispatch}
                  useStyledBox={true}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Grid>

      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawerCallback(false)}
        anchor="right"
        PaperProps={{ sx: { width: { xs: '85vw', sm: 360 }, maxWidth: 400 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Goals</Typography>
          <IconButton size="small" onClick={() => setShowDrawerCallback(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, pb: 2, overflowY: 'auto' }}>
          <GoalBox
            financialGoals={plannerData.financialGoals}
            investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
            selectedDate={selectedDate}
            dispatch={dispatch}
            useStyledBox={false}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default Planner;
