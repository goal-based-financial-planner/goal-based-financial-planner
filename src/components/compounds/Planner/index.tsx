import React, { useEffect, useReducer, useRef, useState } from 'react';
import FinancialGoalsStep from '../FinancialGoalsStep';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import { Box } from '@mui/material';

import InvestmentAllocationStep from '../InvestmentAllocationStep';
import { PlannerState } from '../../../types/enums';
import PortfolioSummaryStep from '../PortfolioSummaryStep';

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

  const [isPortFolioSummaryExpanded, setIsPortFolioSummaryExpanded] =
    useState<boolean>(true);
  const [isPortFolioSummaryVisible, setIsPortFolioSummaryVisible] =
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
        setIsPortFolioSummaryVisible(false);
        break;
      case PlannerState.ASSET_ALLOCATION:
        setIsFinancialGoalsExpanded(false);
        setIsAssetAllocationExpanded(true);
        setIsAssetAllocationVisible(true);
        setIsPortFolioSummaryVisible(false);

        assetsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        break;
      case PlannerState.PORTFOLIO_SUMMARY:
        setIsAssetAllocationExpanded(false);
        setIsPortFolioSummaryVisible(true);
        setIsPortFolioSummaryExpanded(true);
        break;
    }
  }, [currentState]);

  return (
    <Box sx={{ m: 1 }}>
      <FinancialGoalsStep
        isExpanded={isFinancialGoalsExpanded}
        onContinue={() => goToStep(PlannerState.ASSET_ALLOCATION)}
        onEdit={() => goToStep(PlannerState.GOALS)}
        plannerData={plannerData}
        dispatch={dispatch}
      />

      {isAssetAllocationVisible ? (
        <InvestmentAllocationStep
          dispatch={dispatch}
          plannerData={plannerData}
          onContinue={() => goToStep(PlannerState.PORTFOLIO_SUMMARY)}
          onEdit={() => goToStep(PlannerState.ASSET_ALLOCATION)}
          isExpanded={isAssetAllocationExpanded}
        />
      ) : null}

      {isPortFolioSummaryVisible ? (
        <PortfolioSummaryStep
          isExpanded={isPortFolioSummaryExpanded}
          onContinue={() => {}}
          onEdit={() => {}}
        />
      ) : null}
    </Box>
  );
};

export default Planner;
