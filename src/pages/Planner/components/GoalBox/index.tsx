import { Grid2 as Grid, Typography, Divider } from '@mui/material';

import GoalCard from '../GoalCard';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { StyledBox } from '../../../../components/StyledBox';

type GoalBoxProps = {
  financialGoals: FinancialGoal[];
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
};
const GoalBox = ({
  financialGoals,
  selectedDate,
  investmentBreakdownForAllGoals,
  dispatch,
}: GoalBoxProps) => {
  const sortedGoals = financialGoals.sort((goal1, goal2) => {
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

  return (
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
  );
};
export default GoalBox;
