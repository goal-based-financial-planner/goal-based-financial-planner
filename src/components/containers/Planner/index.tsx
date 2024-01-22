import React, { useReducer, useState } from 'react';
import FinancialGoals from '../FinancialGoals';
import {
  initialPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import CustomPaper from '../../common/CustomPaper';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import AssetsPlanner from '../InvestmentsBreakdown/LongTermGoalsSplit';

type StateType = 'goals' | 'breakdown' | 'recommendations';
const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    initialPlannerData,
  );

  const [currentState, setCurrentState] = useState<StateType>('goals');

  const handleSave = () => {
    setCurrentState('breakdown');
  };

  const handleEdit = () => {
    setCurrentState('goals');
  };

  const getGoalSummaryAsText = () => {
    const goalSummary = plannerData
      .getFinancialGoalSummary()
      .filter((e) => e.numberOfGoals > 0)
      .map((e) => `${e.numberOfGoals} ${e.termType}`);

    const summaryText = goalSummary.join(', ');
    const lastIndex = summaryText.lastIndexOf(',');
    if (lastIndex !== -1) {
      const updatedSummaryText =
        summaryText.substring(0, lastIndex) +
        ' and ' +
        summaryText.substring(lastIndex + 1);
      return updatedSummaryText;
    }

    return summaryText;
  };

  return (
    <Box sx={{ m: 1 }}>
      {currentState === 'goals' ? (
        <CustomPaper>
          <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
          <Stack alignItems="flex-end">
            <Button
              disabled={plannerData.financialGoals.length === 0}
              sx={{ fontSize: '1.2rem' }}
              onClick={handleSave}
              variant="contained"
              color="primary"
            >
              Continue
            </Button>
          </Stack>
        </CustomPaper>
      ) : (
        <CustomPaper>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11}>
              <h2>Financial Goals</h2>
              <Typography>
                {`You have added ${getGoalSummaryAsText()} goals`}
              </Typography>
            </Grid>
            <Grid item xs={1} textAlign="right">
              <Button
                onClick={handleEdit}
                variant="contained"
                color="secondary"
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </CustomPaper>
      )}
      {currentState === 'breakdown' ? (
        <CustomPaper>
          <h2>Assets Planner </h2>
          <AssetsPlanner dispatch={dispatch} plannerData={plannerData} />
        </CustomPaper>
      ) : null}
    </Box>
  );
};

export default Planner;
