import React from 'react';
import { Box, Typography } from '@mui/material';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../../store/plannerDataReducer';
import FinancialGoalForm from '../../../../Home/components/FinancialGoalForm';

type CreateGoalStepProps = {
  dispatch: Dispatch<PlannerDataAction>;
  onComplete: () => void;
};

const CreateGoalStep: React.FC<CreateGoalStepProps> = ({ dispatch, onComplete }) => (
  <Box sx={{ py: 1 }}>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Add your first goal
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      You can add more goals later. Start with one that matters most to you.
    </Typography>
    <FinancialGoalForm
      dispatch={dispatch}
      close={onComplete}
      title="Add your first goal"
      embedded
    />
  </Box>
);

export default CreateGoalStep;
