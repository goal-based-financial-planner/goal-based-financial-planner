import React from 'react';
import FinancialGoals from '../FinancialGoals';
import { Box } from '@mui/material';

const Planner: React.FC = () => {
  return (
    <Box p={3}>
      <FinancialGoals></FinancialGoals>
    </Box>
  );
};

export default Planner;
