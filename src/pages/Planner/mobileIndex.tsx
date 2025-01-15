import { Grid2 as Grid, Box, Typography } from '@mui/material';
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
import { TermTypeWiseProgressData } from './components/TermwiseProgressBox';
import GoalBox from './components/GoalBox';
import { StyledBox } from '../../components/StyledBox';
import PageTour from './components/Pagetour';
import TermWiseProgressMobileBox from './components/TermwiseProgressBox/mobileIndex';
import TargetMobileBox from './components/TargetBox/mobileIndex';

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const MobilePlanner = ({ plannerData, dispatch }: PlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());

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
          <StyledBox
            sx={{ width: '160px', mt: 1, mr: 2 }}
            className="calendar-button"
          >
            <DatePicker
              label={'"month" and "year"'}
              views={['month', 'year']}
              sx={{ width: '160px' }}
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

        <Grid
          size={12}
          sx={{
            overflowX: 'auto',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              minWidth: '300px',
            }}
          >
            <TargetMobileBox
              targetAmount={targetAmount}
              dispatch={dispatch}
              financialGoals={plannerData.financialGoals}
              investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
              selectedDate={selectedDate}
            />
          </Box>
          <Box
            sx={{
              minWidth: '300px',
            }}
          >
            <TermWiseProgressMobileBox data={termTypeWiseProgressData} />
          </Box>
        </Grid>

        <Grid size={12}>
          <InvestmentSuggestionsBox
            dispatch={dispatch}
            investmentAllocations={plannerData.investmentAllocations}
            investmentBreakdownBasedOnTermType={
              investmentBreakdownBasedOnTermType
            }
          />
        </Grid>
        <Grid size={12}>
          <GoalBox
            financialGoals={plannerData.financialGoals}
            investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
            selectedDate={selectedDate}
            dispatch={dispatch}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default MobilePlanner;
