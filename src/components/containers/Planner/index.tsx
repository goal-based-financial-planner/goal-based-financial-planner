import React, { useReducer, useState } from 'react';
import FinancialGoals from '../FinancialGoals';
import {
  initialPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import CustomPaper from '../../common/CustomPaper';
import CustomButton from '../../common/CustomButton';
import { Box, Grid, Stack, Typography } from '@mui/material';
import AssetsPlanner from '../InvestmentsBreakdown/LongTermGoalsSplit';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    initialPlannerData,
  );
  const [showGoalsTable, setShowGoalsTable] = useState(true);
  const [showAssetsTable, setShowAssetsTable] = useState(false);
  const handleSave = () => {
    setShowGoalsTable(false);
    setShowAssetsTable(true);
  };
  const handleEdit = () => {
    setShowGoalsTable(true);
    setShowAssetsTable(false);
  };

  const getGoalSummaryAsText = () => {
    const goalSummary = plannerData
      .getFinancialGoalSummary()
      .filter((e) => e.numberOfGoals > 0)
      .map((e) => e.numberOfGoals + ' ' + e.termType);

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
      {showGoalsTable ? (
        <CustomPaper>
          <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
          <Stack alignItems="flex-end">
            <CustomButton
              sx={{ fontSize: '1.2rem' }}
              text="Continue"
              onClick={handleSave}
            />
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
            <Grid item xs={1}>
              <CustomButton text="Edit" onClick={handleEdit} />
            </Grid>
          </Grid>
        </CustomPaper>
      )}
      {showAssetsTable ? (
        <CustomPaper>
          <h2>Assets Planner </h2>
          <Box sx={{ p: 3 }}>
            <AssetsPlanner dispatch={dispatch} plannerData={plannerData} />
          </Box>
        </CustomPaper>
      ) : null}
    </Box>
  );
};

export default Planner;
