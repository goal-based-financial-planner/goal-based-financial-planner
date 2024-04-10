import React, { useEffect, useReducer, useRef, useState } from 'react';
import FinancialGoalsStep from '../FinancialGoalsStep';
import { getInitialData, persistPlannerData, plannerDataReducer } from '../../../store/plannerDataReducer';
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

  const [isInvestmentAllocationExpanded, setIsInvestmentAllocationExpanded] =
    useState<boolean>(true);
  const [isInvestmentAllocationVisible, setIsInvestmentAllocationVisible] =
    useState<boolean>(false);

  const [isPortFolioSummaryExpanded, setIsPortFolioSummaryExpanded] =
    useState<boolean>(true);
  const [isPortFolioSummaryVisible, setIsPortFolioSummaryVisible] =
    useState<boolean>(false);

  const financialGoalsRef = useRef<HTMLDivElement>(null);
  const investmentAllocationsRef = useRef<HTMLDivElement>(null);
  const portfolioSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  const goToStep = (nextStep: PlannerState) => {
    setCurrentState(nextStep);
  };

  useEffect(() => {
    switch (currentState) {
      case PlannerState.GOALS:
        setIsFinancialGoalsExpanded(true);
        setIsInvestmentAllocationVisible(false);
        setIsPortFolioSummaryVisible(false);
        break;
      case PlannerState.ASSET_ALLOCATION:
        setIsFinancialGoalsExpanded(false);
        setIsInvestmentAllocationExpanded(true);
        setIsInvestmentAllocationVisible(true);
        setIsPortFolioSummaryVisible(false);
        break;
      case PlannerState.PORTFOLIO_SUMMARY:
        setIsInvestmentAllocationExpanded(false);
        setIsPortFolioSummaryVisible(true);
        setIsPortFolioSummaryExpanded(true);
        break;
    }
  }, [currentState]);

  useEffect(() => {
    switch (currentState) {
      case PlannerState.GOALS:
        financialGoalsRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case PlannerState.ASSET_ALLOCATION:
        investmentAllocationsRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case PlannerState.PORTFOLIO_SUMMARY:
        portfolioSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
    }

  }, [currentState, isFinancialGoalsExpanded, isInvestmentAllocationVisible, isPortFolioSummaryVisible]);

  return (
    <Box sx={{ m: 1 }}>
      <div ref={financialGoalsRef}>
        <FinancialGoalsStep
          isExpanded={isFinancialGoalsExpanded}
          onContinue={() => goToStep(PlannerState.ASSET_ALLOCATION)}
          onEdit={() => goToStep(PlannerState.GOALS)}
          plannerData={plannerData}
          dispatch={dispatch}
        />
      </div>
      <div ref={investmentAllocationsRef}>
        {isInvestmentAllocationVisible ? (
          <InvestmentAllocationStep
            dispatch={dispatch}
            plannerData={plannerData}
            onContinue={() => goToStep(PlannerState.PORTFOLIO_SUMMARY)}
            onEdit={() => goToStep(PlannerState.ASSET_ALLOCATION)}
            isExpanded={isInvestmentAllocationExpanded}
          />
        ) : null}
      </div>
      <div ref={portfolioSummaryRef}>
        {isPortFolioSummaryVisible ? (
          <PortfolioSummaryStep
            isExpanded={isPortFolioSummaryExpanded}
            plannerData={plannerData}
          />
        ) : null}
      </div>
    </Box>
  );
};

export default Planner;
