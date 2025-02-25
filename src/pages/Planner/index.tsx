import { Grid2 as Grid, Box, Typography, Drawer } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import InvestmentSuggestionsBox, {
  InvestmentBreakdownBasedOnTermType,
} from './components/InvestmentSuggestions';
import { Dispatch, useState } from 'react';
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

  return (
    <>
      <PageTour />
      <Grid container>
        <Grid size={12} display="flex" justifyContent="space-between">
          <Box sx={{ mt: 2, ml: 2 }}>
            <Typography className="navbar-home" variant="h3">
              Welcome
            </Typography>
          </Box>
          <StyledBox sx={{ mt: 1, mr: 2 }} className="calendar-button">
            <DatePicker
              label={'"month" and "year"'}
              views={['month', 'year']}
              defaultValue={dayjs()}
              onChange={handleChange}
              slotProps={{
                textField: {
                  variant: 'standard',
                  label: '',
                  InputProps: {
                    disableUnderline: true,
                  },
                },
              }}
            />
          </StyledBox>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }}>
          <TargetBox
            targetAmount={targetAmount}
            dispatch={dispatch}
            setShowDrawer={setShowDrawer}
            termTypeWiseProgressData={termTypeWiseProgressData}
          />
        </Grid>
        <Grid
          size={{ xs: 0, sm: 0, md: 9, lg: 9 }}
          sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }}
        >
          <TermWiseProgressBox data={termTypeWiseProgressData} />
        </Grid>
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
          sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' } }}
        >
          <GoalBox
            financialGoals={plannerData.financialGoals}
            investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
            selectedDate={selectedDate}
            dispatch={dispatch}
            useStyledBox={true}
          />
        </Grid>
      </Grid>
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        anchor="right"
      >
        <GoalBox
          financialGoals={plannerData.financialGoals}
          investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
          selectedDate={selectedDate}
          dispatch={dispatch}
          useStyledBox={false}
        />
      </Drawer>
    </>
  );
};

export default Planner;
