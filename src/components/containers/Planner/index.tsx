import React, { useReducer } from 'react';
import FinancialGoals from '../FinancialGoals';
import { Container } from '@mui/material';
import {
  initialPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    initialPlannerData,
  );
  return (
    <Container maxWidth={false}>
      <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
    </Container>
  );
};

export default Planner;
