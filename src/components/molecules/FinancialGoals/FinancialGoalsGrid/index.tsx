import React, { Dispatch } from 'react';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalCard from '../FinancialGoalCard';
import { Grid } from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type FinancialGoalsGridProps = {
  financialGoals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoalsGrid: React.FC<FinancialGoalsGridProps> = ({
  financialGoals,
  dispatch,
}) => {
  return (
    <Grid container rowGap={6} columnGap={3}>
      {financialGoals.map((goal) => (
        <Grid xs={1.25} key={goal.id} sx={{ mb: 2 }}>
          <FinancialGoalCard goal={goal} dispatch={dispatch} />
        </Grid>
      ))}
    </Grid>
  );
};

export default FinancialGoalsGrid;
