import React, { Dispatch, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';
import FinancialGoalsGrid from '../../molecules/FinancialGoals/FinancialGoalsGrid';
import { theme } from '../../../theme';
import FinancialGoalForm from '../../molecules/FinancialGoals/FinancialGoalForm';

type FinancialGoalsProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

const FinancialGoalsStep: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', padding: 3 }}>
        <Typography variant="h4">Your Goals</Typography>
        <Box
          ml={3}
          onClick={handleAdd}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              transform: 'scale(1.05)',
            },
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: '40px',
              color: theme.palette.primary.main,
              transition: 'color 0.3s ease',
            }}
          >
            add_circle
          </span>
        </Box>
      </Box>

      <Box sx={{ width: '100vw', px: 3 }}>
        {plannerData.financialGoals.length ? (
          <FinancialGoalsGrid
            financialGoals={plannerData.financialGoals}
            dispatch={dispatch}
          />
        ) : null}
      </Box>

      {isFormOpen ? (
        <FinancialGoalForm
          plannerData={plannerData}
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </>
  );
};

export default FinancialGoalsStep;
