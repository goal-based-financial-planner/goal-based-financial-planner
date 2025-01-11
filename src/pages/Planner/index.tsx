import { Grid2 as Grid, Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import InvestmentSuggestions from './components/InvestmentSuggestions';
import { Dispatch, useState } from 'react';
import { TermType } from '../../types/enums';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import { PlannerData } from '../../domain/PlannerData';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import TargetBox from './components/TargetBox';
import TermwiseProgressBox from './components/TermwiseProgressBox';
import GoalBox from './components/GoalBox';
import { StyledBox } from '../../components/StyledBox';
import Pagetour from './components/Pagetour';

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const Planner = ({ plannerData, dispatch }: PlannerProps) => {
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

  const investmentBreakdownBasedOnTermType = [
    TermType.SHORT_TERM,
    TermType.MEDIUM_TERM,
    TermType.LONG_TERM,
  ].map((termType) => {
    return {
      termType,
      investmentBreakdown: investmentBreakdownForAllGoals.filter((ib) => {
        const goalTerm = plannerData.financialGoals
          .find((goal) => goal.getGoalName() === ib.goalName)
          ?.getTermType();
        return termType === goalTerm;
      }),
    };
  });

  return (
    <>
      <Pagetour />
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
        <Grid size={4}>
          <TargetBox targetAmount={targetAmount} dispatch={dispatch} />
        </Grid>
        <Grid size={8}>
          <TermwiseProgressBox
            plannerData={plannerData}
            investmentBreakdownBasedOnTermType={
              investmentBreakdownBasedOnTermType
            }
          />
        </Grid>
        <Grid size={9}>
          <InvestmentSuggestions
            plannerData={plannerData}
            dispatch={dispatch}
            investmentBreakdownBasedOnTermType={
              investmentBreakdownBasedOnTermType
            }
          />
        </Grid>
        <Grid size={3}>
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

export default Planner;
