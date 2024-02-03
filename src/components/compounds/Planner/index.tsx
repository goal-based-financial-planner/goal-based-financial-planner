import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import PlannerStep from '../FinancialGoals/PlannerStep';

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

  const handleFinancialGoalContinue = () => {
    setCurrentState('breakdown');
  };
  const handleFinancialGoalsEdit = () => {
    setCurrentState('goals');
  };

  const handleAssetsPlannerContinue = () => {
    console.log('rtfyguhjkl');
    setCurrentState('recommendations');
  };

  const handleAssetsPlannerEdit = () => {
    setCurrentState('breakdown');
  };

  return (
    <PlannerStep
      plannerData={plannerData}
      dispatch={dispatch}
      currentState={currentState}
      onFinancialGoalContinue={handleFinancialGoalContinue}
      onFinancialGoalEdit={handleFinancialGoalsEdit}
      onAssetsPlannerContinue={handleAssetsPlannerContinue}
      onAssetsPlannerEdit={handleAssetsPlannerEdit}
      assetsRef={assetsRef}
    />
  );
};

export default Planner;
