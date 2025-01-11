import { Grid2 as Grid, Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import InvestmentSuggestions from './components/InvestmentSuggestions';
import { Dispatch, useEffect, useState } from 'react';
import { TermType } from '../../types/enums';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import { PlannerData } from '../../domain/PlannerData';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import TargetBox from './components/TargetBox';
import TermwiseProgressBox from './components/TermwiseProgressBox';
import GoalBox from './components/GoalBox';
import { StyledBox } from '../../components/StyledBox';

const steps = [
  {
    target: '.target-box',
    disableBeacon: true,
    content:
      'This is your total financial target. The amount is automatically adjusted for inflation to ensure accuracy.',
  },
  {
    target: '.add-goals-button',
    disableBeacon: true,

    content:
      'Click here to add new financial goals to your target and start planning.',
  },
  {
    target: '.financial-goals-box',
    disableBeacon: true,
    content:
      'Here, you can see all the financial goals you’ve already added, along with their progress.',
  },
  {
    target: '.financial-progress-box',
    disableBeacon: true,

    content:
      'This section provides a detailed breakdown of your financial goals by term.',
  },
  {
    target: '.investment-plan-box',
    disableBeacon: true,

    content:
      'These are tailored investment suggestions to help you achieve your financial goals efficiently.',
  },
  {
    target: '.customize-button',
    disableBeacon: true,
    content:
      'Click this button to personalize the investment suggestions according to your preferences.',
  },
  {
    target: '.calendar-button',
    disableBeacon: true,
    content:
      'This calendar is set to the current month by default. You can change the date to view your progress at any point in time.',
  },
];

type PlannerProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const Planner = ({ plannerData, dispatch }: PlannerProps) => {
  const [isTourTaken, setIsTourTaken] = useState(
    JSON.parse(localStorage.getItem('isTourTaken') || 'false'),
  );
  const [runTour, setRunTour] = useState<boolean>(!isTourTaken);

  const [selectedDate, setSelectedDate] = useState<string>(dayjs().toString());

  useEffect(() => {
    if (isTourTaken) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 5000);

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [isTourTaken]);

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

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('isTourTaken', JSON.stringify(true));
      setIsTourTaken(true);
      setRunTour(false);
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        callback={handleJoyrideCallback}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            arrowColor: '#f5f5f5',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            primaryColor: '#4CAF50',
            textColor: '#333',
            zIndex: 1000,
          },
          buttonClose: {
            color: '#ff1744',
          },
          buttonBack: {
            color: '#9E9E9E',
          },
          buttonNext: {
            backgroundColor: '#1976D2',
            color: '#ffffff',
          },
          buttonSkip: {
            color: '#F44336',
          },
        }}
      />
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
