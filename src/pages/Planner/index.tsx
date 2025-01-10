import React, { useEffect, useReducer, useState } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import {
  Box,
  Button,
  Divider,
  Grid2 as Grid,
  styled,
  Typography,
} from '@mui/material';
import FinancialGoalForm from './components/FinancialGoalForm';
import InvestmentSuggestions from './new_components/investmentSuggestions';
import TermwiseProgress from './new_components/TermwiseProgress';
import GoalCard from './new_components/goalCard';
import LiveCounter from '../../components/LiveNumberCounter';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { TermType } from '../../types/enums';
import useInvestmentCalculator from './hooks/useInvestmentCalculator';
import LandingPage from '../LandingPage';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

export const StyledBox = styled(Box)(({ theme }) => ({
  border: '1px solid #F0F0F0',
  backgroundColor: 'white',
  borderRadius: '10px',
  padding: '16px',
}));

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  const [selectedDate, setSelectedDate] = React.useState<string>(
    dayjs().toString(),
  );

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

  const sortedGoals = plannerData.financialGoals.sort((goal1, goal2) => {
    const diffA = dayjs(goal1.getTargetDate()).diff(dayjs(), 'days');
    const diffB = dayjs(goal2.getTargetDate()).diff(dayjs(), 'days');
    return diffA - diffB;
  });

  const pendingGoals = sortedGoals.filter((goal) => {
    return dayjs(selectedDate).isBefore(goal.getTargetDate());
  });

  const completedGoals = sortedGoals.filter((goal) => {
    return dayjs(selectedDate).isAfter(goal.getTargetDate());
  });
  const [isTourTaken, setIsTourTaken] = useState(
    JSON.parse(localStorage.getItem('isTourTaken') || 'false'),
  );
  const [runTour, setRunTour] = useState<boolean>(!isTourTaken);

  useEffect(() => {
    if (isTourTaken) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 5000);

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [isTourTaken]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('isTourTaken', JSON.stringify(true));
      setIsTourTaken(true);
      setRunTour(false);
    }
  };

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

  return plannerData.financialGoals?.length > 0 ? (
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
          <StyledBox
            sx={{
              display: 'flex',
              flexDirection: 'column',
              ml: 2,
              my: 2,
            }}
            height={'250px'}
            className="target-box"
          >
            <Typography variant="h6" fontWeight="bold">
              Your Target
            </Typography>
            <LiveCounter value={targetAmount} duration={500} />
            <Button
              className="add-goals-button"
              variant="outlined"
              sx={{
                width: '120px',
                mt: 4,
                color: 'green',
                border: '1px solid green',
              }}
              onClick={handleAdd}
            >
              Add Goals
            </Button>
          </StyledBox>
        </Grid>
        <Grid size={8}>
          <StyledBox
            height={'250px'}
            sx={{ mx: 2, my: 2 }}
            className="financial-progress-box"
          >
            <TermwiseProgress
              plannerData={plannerData}
              investmentBreakdownBasedOnTermType={
                investmentBreakdownBasedOnTermType
              }
            />
          </StyledBox>
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
          <Grid container>
            {pendingGoals.length > 0 ? (
              <Grid size={12} sx={{ mx: 2, mb: 2 }}>
                <StyledBox
                  className="financial-goals-box"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    '& .divider': {
                      display: 'block',
                    },
                    '& .divider:last-child': {
                      display: 'none',
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Financial Goals
                  </Typography>

                  {pendingGoals.map((goal) => {
                    return (
                      <>
                        <GoalCard
                          goal={goal}
                          dispatch={dispatch}
                          currentValue={
                            investmentBreakdownForAllGoals.find(
                              (ib) => ib.goalName === goal.getGoalName(),
                            )?.currentValue!
                          }
                        />
                        <Divider className="divider" />
                      </>
                    );
                  })}
                </StyledBox>
              </Grid>
            ) : null}

            {completedGoals.length > 0 ? (
              <Grid size={12} sx={{ mx: 2 }}>
                <StyledBox
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    '& .divider': {
                      display: 'block',
                    },
                    '& .divider:last-child': {
                      display: 'none',
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Completed Goals
                  </Typography>
                  {completedGoals.map((goal) => {
                    return (
                      <>
                        <GoalCard
                          goal={goal}
                          dispatch={dispatch}
                          currentValue={
                            investmentBreakdownForAllGoals.find(
                              (ib) => ib.goalName === goal.getGoalName(),
                            )?.currentValue!
                          }
                        />
                        <Divider className="divider" />
                      </>
                    );
                  })}
                </StyledBox>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
      {isFormOpen ? (
        <FinancialGoalForm
          plannerData={plannerData}
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </>
  ) : (
    <LandingPage
      isFormOpen={isFormOpen}
      plannerData={plannerData}
      dispatch={dispatch}
      setIsFormOpen={setIsFormOpen}
      handlAdd={handleAdd}
    />
  );
};

export default Planner;
