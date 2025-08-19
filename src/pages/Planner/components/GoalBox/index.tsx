import { Grid2 as Grid, Typography } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { StyledBox } from '../../../../components/StyledBox';
import GoalList from './goalList';
import { GoalType } from '../../../../types/enums';

type GoalBoxProps = {
  financialGoals: FinancialGoal[];
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
  useStyledBox: boolean;
};
const GoalBox = ({
  financialGoals,
  selectedDate,
  investmentBreakdownForAllGoals,
  dispatch,
  useStyledBox,
}: GoalBoxProps) => {
  const sortedGoals = financialGoals.sort((goal1, goal2) => {
    const diffA = dayjs(goal1.getTargetDate()).diff(dayjs(), 'days');
    const diffB = dayjs(goal2.getTargetDate()).diff(dayjs(), 'days');
    return diffA - diffB;
  });

  const pendingGoals = sortedGoals.filter((goal) => {
    return (
      goal.goalType === GoalType.ONE_TIME &&
      dayjs(selectedDate).isBefore(goal.getTargetDate())
    );
  });

  const completedGoals = sortedGoals.filter((goal) => {
    return (
      goal.goalType === GoalType.ONE_TIME &&
      dayjs(selectedDate).isAfter(goal.getTargetDate())
    );
  });

  const recurringGoals = sortedGoals.filter((goal) => {
    return goal.goalType === GoalType.RECURRING;
  });

  function getPendingGoals() {
    return (
      <>
        <Typography variant="h6" fontWeight="bold">
          Financial Goals
        </Typography>
        <GoalList
          investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
          goals={pendingGoals}
          dispatch={dispatch}
        ></GoalList>
      </>
    );
  }

  function getCompletedGoals() {
    return (
      <>
        <Typography variant="h6" fontWeight="bold">
          Completed Goals
        </Typography>
        <GoalList
          investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
          goals={completedGoals}
          dispatch={dispatch}
        ></GoalList>
      </>
    );
  }

  function getRecurringGoals() {
    return (
      <>
        <Typography variant="h6" fontWeight="bold">
          Recurring Goals
        </Typography>
        <GoalList
          investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
          goals={recurringGoals}
          dispatch={dispatch}
        ></GoalList>
      </>
    );
  }

  return (
    <Grid container>
      {pendingGoals.length > 0 ? (
        <Grid size={12} sx={{ mb: 2 }}>
          {useStyledBox ? (
            <StyledBox className="financial-goals-box">
              {getPendingGoals()}
            </StyledBox>
          ) : (
            getPendingGoals()
          )}
        </Grid>
      ) : null}

      {completedGoals.length > 0 ? (
        <Grid size={12}>
          {useStyledBox ? (
            <StyledBox>{getCompletedGoals()}</StyledBox>
          ) : (
            getCompletedGoals()
          )}
        </Grid>
      ) : null}

      {recurringGoals.length > 0 ? (
        <Grid size={12} sx={{ mt: 2 }}>
          {useStyledBox ? (
            <StyledBox>{getRecurringGoals()}</StyledBox>
          ) : (
            getRecurringGoals()
          )}
        </Grid>
      ) : null}
    </Grid>
  );
};
export default GoalBox;
