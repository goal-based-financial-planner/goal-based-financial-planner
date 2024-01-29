import React, { useEffect, useReducer, useRef, useState } from 'react';
import FinancialGoals from '../FinancialGoals';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import CustomPaper from '../../atoms/CustomPaper';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import InvestmentAllocationTable from '../../molecules/InvestmentAllocation/InvestmentAllocationTable';

type StateType = 'goals' | 'breakdown' | 'recommendations';
const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [currentState, setCurrentState] = useState<StateType>('goals');

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);
  const assetsRef = useRef<HTMLDivElement>(null);

  const handleGoalContinue = () => {
    setCurrentState('breakdown');
  };
  const handleGoalsEdit = () => {
    setCurrentState('goals');
  };
  useEffect(() => {
    if (currentState === 'breakdown') {
      // Scroll page to bring breakdown into view
      assetsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [currentState]);

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

  console.log(plannerData);
  return (
    <Box sx={{ m: 1 }}>
      {currentState === 'goals' ? (
        // TODO: Move custom paper, editable and non editable logic into Financial GOals

        <CustomPaper>
          {/* TODO: Pass only necessary data, don't pass entire planner data */}
          <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
          <Stack alignItems="flex-end">
            <Button
              disabled={plannerData.financialGoals.length === 0}
              sx={{ fontSize: '1.2rem' }}
              onClick={handleGoalContinue}
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
                onClick={handleGoalsEdit}
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
        // TODO: Pass into custom paper and pass only investment allocation details
        <CustomPaper sx={{ height: '100vh' }} ref={assetsRef}>
          <h2>Assets Planner </h2>

          <InvestmentAllocationTable
            dispatch={dispatch}
            plannerData={plannerData}
          />
        </CustomPaper>
      ) : null}
    </Box>
  );
};

export default Planner;
