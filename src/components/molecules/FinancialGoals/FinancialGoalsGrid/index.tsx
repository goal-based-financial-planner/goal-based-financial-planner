import React, { Dispatch } from 'react';
import { Grid } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalCard from '../FinancialGoalCard';
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
    <>
      {financialGoals.map((goal) => (
        <Grid item xs={3} key={goal.id} sx={{ mb: 2 }}>
          <FinancialGoalCard goal={goal} />
        </Grid>
      ))}
    </>
  );
};

export default FinancialGoalsGrid;
