import React from 'react';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalCard from '../FinancialGoalCard';
import { Grid } from '@mui/material';

type FinancialGoalsGridProps = {
  financialGoals: FinancialGoal[];
};

const FinancialGoalsGrid: React.FC<FinancialGoalsGridProps> = ({
  financialGoals,
}) => {
  return (
    <>
      {financialGoals.map((goal) => (
        <Grid xs={2.5} key={goal.id} sx={{ mb: 2 }}>
          <FinancialGoalCard goal={goal} />
        </Grid>
      ))}
    </>
  );
};

export default FinancialGoalsGrid;
