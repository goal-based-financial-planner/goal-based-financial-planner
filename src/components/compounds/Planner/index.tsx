import React, { useEffect, useReducer, useRef, useState } from 'react';
import FinancialGoals from '../FinancialGoals';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import { Box } from '@mui/material';

import InvestmentAllocation from '../InvestmentAllocation';
import { PlannerState } from '../../../types/enums';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [currentState, setCurrentState] = useState<PlannerState>(
    PlannerState.GOALS,
  );
  const [isFinancialGoalsExpanded, setIsFinancialGoalsExpanded] =
    useState<boolean>(true);

  const [isAssetAllocationExpanded, setIsAssetAllocationExpanded] =
    useState<boolean>(true);
  const [isAssetAllocationVisible, setIsAssetAllocationVisible] =
    useState<boolean>(false);

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);
  const assetsRef = useRef<HTMLDivElement>(null);

  const goToStep = (nextStep: PlannerState) => {
    setCurrentState(nextStep);
  };

  useEffect(() => {
    switch (currentState) {
      case PlannerState.GOALS:
        setIsFinancialGoalsExpanded(true);
        setIsAssetAllocationVisible(false);
        break;
      case PlannerState.ASSET_ALLOCATION:
        setIsFinancialGoalsExpanded(false);
        setIsAssetAllocationExpanded(true);
        setIsAssetAllocationVisible(true);
        // Scroll page to bring breakdown into view
        assetsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        break;
      case PlannerState.PORTFOLIO_SUMMARY:
        break;
    }
  }, [currentState]);

  console.log(plannerData);
  return (
    <Box sx={{ m: 1 }}>
      <FinancialGoals
        isExpanded={isFinancialGoalsExpanded}
        onContinue={() => goToStep(PlannerState.ASSET_ALLOCATION)}
        onEdit={() => goToStep(PlannerState.GOALS)}
        plannerData={plannerData}
        dispatch={dispatch}
      ></FinancialGoals>

      {isAssetAllocationVisible ? (
        <InvestmentAllocation
          dispatch={dispatch}
          plannerData={plannerData}
          onContinue={() => goToStep(PlannerState.PORTFOLIO_SUMMARY)}
          onEdit={() => goToStep(PlannerState.ASSET_ALLOCATION)}
          isExpanded={isAssetAllocationExpanded}
        />
      ) : null}
    </Box>
  );
};

export default Planner;
