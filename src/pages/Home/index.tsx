import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import LandingPage from '../LandingPage';
import Planner from '../Planner';
import { useTheme, useMediaQuery } from '@mui/material';
import MobilePlanner from '../Planner/mobileIndex';

const Home: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return plannerData.financialGoals?.length > 0 ? (
    isMobile ? (
      <MobilePlanner plannerData={plannerData} dispatch={dispatch} />
    ) : (
      <Planner plannerData={plannerData} dispatch={dispatch} />
    )
  ) : (
    <LandingPage dispatch={dispatch} />
  );
};

export default Home;
