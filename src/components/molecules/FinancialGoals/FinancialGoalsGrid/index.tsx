import React from 'react';
import { Grid } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalCard from '../FinancialGoalCard';

type FinancialGoalsGridProps = {
  financialGoals: FinancialGoal[];
};

const FinancialGoalsGrid: React.FC<FinancialGoalsGridProps> = ({
  financialGoals,
}) => {
  return (
    <Grid container rowGap={6} columnGap={3}>
      {financialGoals.map((goal) => (
        <Grid item xs={2} key={goal.id}>
          <FinancialGoalCard goal={goal} />
        </Grid>
      ))}
    </Grid>
  );
};

export default FinancialGoalsGrid;
