import React, { Dispatch } from 'react';
import FinancialGoalCard from '../FinancialGoalCard';
import { Box } from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { PlannerData } from '../../../../domain/PlannerData';

type FinancialGoalsGridProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoalsGrid: React.FC<FinancialGoalsGridProps> = ({
  plannerData,
  dispatch,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {plannerData.financialGoals.map((goal) => (
        <FinancialGoalCard
          goal={goal}
          dispatch={dispatch}
          plannerData={plannerData}
        />
      ))}
    </Box>
  );
};

export default FinancialGoalsGrid;
