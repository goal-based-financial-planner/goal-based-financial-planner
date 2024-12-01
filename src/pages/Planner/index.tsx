import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import { Grid2 as Grid } from '@mui/material';
import FinancialGoals from '../../components/FinancialGoals';
import PortfolioSummary from './components/PortFolioSummary';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  return (
    <Grid container>
      <Grid size={4}>
        <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
      </Grid>

      {plannerData.financialGoals.length > 0 ? (
        <Grid size={8}>
          <PortfolioSummary plannerData={plannerData} dispatch={dispatch} />
        </Grid>
      ) : null}
    </Grid>
  );
};

export default Planner;
