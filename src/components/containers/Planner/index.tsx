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
  return (
    <Box>
      {showGoalsTable ? (
        <CustomPaper>
          <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
          <Stack alignItems="flex-end">
            <CustomButton
              sx={{ mb: 2, fontSize: '1.2rem' }}
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
              <Typography>You have added </Typography>
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
