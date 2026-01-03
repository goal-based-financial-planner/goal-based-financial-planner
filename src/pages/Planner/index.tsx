import {
  Grid2 as Grid,
  Box,
  Typography,
  Drawer,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import { CalendarIcon, MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import InvestmentSuggestionsBox, {
  InvestmentBreakdownBasedOnTermType,
} from './components/InvestmentSuggestions';
import { Dispatch, useRef, useState } from 'react';
import { TermType } from '../../types/enums';
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
};

const Planner = ({ plannerData, dispatch }: PlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());
  const [showDrawer, setShowDrawer] = useState(false);

  const handleChange = (value: Dayjs | null) => {
    setSelectedDate(value!.toString());
  };

  const targetAmount = plannerData.financialGoals.reduce(
    (sum, goal) => sum + goal.getInflationAdjustedTargetAmount(),
    0,
  );

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  const investmentBreakdownForAllGoals = calculateInvestmentNeededForGoals(
    plannerData,
    selectedDate,
  );

  const investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[] =
    [];
  const termTypeWiseProgressData: TermTypeWiseProgressData[] = [];

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

        investmentBreakdownBasedOnTermType.push({
          termType,
          investmentBreakdown: investmentBreakDownPerTerm,
        });
        termTypeWiseProgressData.push({
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

  const completedGoals = plannerData.financialGoals.filter((goal) => {
    return dayjs(selectedDate).isAfter(goal.getTargetDate());
  });

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
          <Box>
            <Typography
              className="navbar-home"
              variant="h4"
              fontWeight="bold"
              color="primary"
            >
              Goal Based Financial Planner
            </Typography>
          </Box>
          <StyledBox className="calendar-button">
            <MobileDatePicker
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
            <Grid container size={12} spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                  md: 3,
                  lg: 3,
                }}
                sx={{ display: 'flex', flexGrow: 1 }}
              >
                <TargetBox
                  targetAmount={targetAmount}
                  dispatch={dispatch}
                  setShowDrawer={setShowDrawer}
                  termTypeWiseProgressData={termTypeWiseProgressData}
                />
              </Grid>
              <Grid
                size={{ xs: 0, sm: 0, md: 9, lg: 9 }}
                sx={{
                  display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' },
                }}
              >
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
        onClose={() => setShowDrawer(false)}
        anchor="right"
      >
        <Box sx={{ p: 2 }}>
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
