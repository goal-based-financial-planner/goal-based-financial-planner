import React, { Dispatch } from 'react';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalCard from '../FinancialGoalCard';
import { Box } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {financialGoals.map((goal) => (
        <FinancialGoalCard goal={goal} dispatch={dispatch} />
      ))}
    </Box>
  );
};

export default FinancialGoalsGrid;
