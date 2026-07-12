import GoalCard from '../GoalCard';
import { Grid2 as Grid } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { Dispatch } from 'react';

type GoalListProps = {
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  goals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};

const GoalList = ({
  investmentBreakdownForAllGoals,
  goals,
  dispatch,
}: GoalListProps) => {
  return (
    <Grid container spacing={2}>
      {goals.map((goal: FinancialGoal) => {
        const investmentBreakdown = investmentBreakdownForAllGoals.find(
          (ib) => ib.goalName === goal.getGoalName(),
        );

        return (
          <Grid key={goal.id} size={{ xs: 12, sm: 6 }}>
            <GoalCard
              goal={goal}
              dispatch={dispatch}
              currentValue={investmentBreakdown?.currentValue ?? 0}
              investmentSuggestions={investmentBreakdown?.investmentSuggestions}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default GoalList;
