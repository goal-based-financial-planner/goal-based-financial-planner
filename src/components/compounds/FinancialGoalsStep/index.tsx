import React, { Dispatch, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';
import FinancialGoalsGrid from '../../molecules/FinancialGoals/FinancialGoalsGrid';
import { theme } from '../../../theme';
import BackDropLoader from '../../molecules/FinancialGoals/FinancialGoalForm';
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
      <Grid xs={12} container p={3}>
        <Grid>
          <Typography variant="h4">Your Goals</Typography>
        </Grid>
        <Grid>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
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
        </Grid>
        {isFormOpen ? (
          <Grid>
            <FinancialGoalForm
              plannerData={plannerData}
              dispatch={dispatch}
              close={() => setIsFormOpen(false)}
            />
          </Grid>
        ) : null}
      </Grid>

      <Grid container rowGap={6} columnGap={3}>
        {plannerData.financialGoals.length ? (
          <FinancialGoalsGrid
            financialGoals={plannerData.financialGoals}
            dispatch={dispatch}
          />
        ) : null}
      </Grid>
    </>
  );
};

export default FinancialGoalsStep;
