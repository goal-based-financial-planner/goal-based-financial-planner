import React, { useReducer, useState } from 'react';
import FinancialGoals from '../FinancialGoals';
import {
  initialPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import CustomPaper from '../../common/CustomPaper';
import CustomButton from '../../common/CustomButton';
import { Box, Grid, Stack } from '@mui/material';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    initialPlannerData,
  );
  const [showGoalsTable, setShowGoalsTable] = useState(true);
  const handleSave = () => {
    setShowGoalsTable(false);
  };
  const handleEdit = () => {
    setShowGoalsTable(true);
  };
  return (
    <Box>
      {showGoalsTable ? (
        <CustomPaper>
          <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
          <Stack alignItems="flex-end">
            <CustomButton
              sx={{ mb: 2 }}
              text="Save & Next"
              onClick={handleSave}
            />
          </Stack>
        </CustomPaper>
      ) : (
        <CustomPaper>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11}>
              <h2>Financial Goals</h2>
            </Grid>
            <Grid item xs={1}>
              <CustomButton text="Edit" onClick={handleEdit} />
            </Grid>
          </Grid>
        </CustomPaper>
      )}
    </Box>
  );
};

export default Planner;
