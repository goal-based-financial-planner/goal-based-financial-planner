import GoalCard from '../GoalCard';
import { Grid2 as Grid } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { Dispatch } from 'react';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';

type GoalListProps = {
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  goals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
  goalRiskStatuses: Record<string, GoalRiskDisplayStatus>;
};

const GoalList = ({
  investmentBreakdownForAllGoals,
  goals,
  dispatch,
  goalRiskStatuses,
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
              riskStatus={goalRiskStatuses[goal.id]}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default GoalList;
