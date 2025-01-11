import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import LandingPage from '../LandingPage';
import Planner from '../Planner';

const Home: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  return plannerData.financialGoals?.length > 0 ? (
    <Planner plannerData={plannerData} dispatch={dispatch} />
  ) : (
    <LandingPage plannerData={plannerData} dispatch={dispatch} />
  );
};

export default Home;
