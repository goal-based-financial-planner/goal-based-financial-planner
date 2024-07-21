import React, { useEffect, useReducer, useState } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import { Box, Typography } from '@mui/material';
import { PlannerState } from '../../../types/enums';
import FinancialGoalsAccordion from './FinancialGoalsAccordion';
import InvestmentAllocationAccordion from './InvestmentAllocationAccordion';
import PortfolioSummaryAccordion from './PortdolioSummaryAccordion';
import AcknowledgmentDialog from './AcknowledmentDialog';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [currentState, setCurrentState] = useState<PlannerState>(
    PlannerState.GOALS,
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentDialogStep, setCurrentDialogStep] =
    useState<PlannerState | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string>('');

  const [isFinancialGoalsExpanded, setIsFinancialGoalsExpanded] =
    useState<boolean>(true);
  const [isInvestmentAllocationExpanded, setIsInvestmentAllocationExpanded] =
    useState<boolean>(false);
  const [isInvestmentAllocationVisible, setIsInvestmentAllocationVisible] =
    useState<boolean>(false);
  const [isPortFolioSummaryExpanded, setIsPortFolioSummaryExpanded] =
    useState<boolean>(false);
  const [isPortFolioSummaryVisible, setIsPortFolioSummaryVisible] =
    useState<boolean>(false);

  const [isFinancialGoalsIconDisabled, setIsFinancialGoalsIconDisabled] =
    useState<boolean>(false);
  const [
    isInvestmentAllocationIconDisabled,
    setIsInvestmentAllocationIconDisabled,
  ] = useState<boolean>(false);
  const [isPortFolioSummaryIconDisabled, setIsPortFolioSummaryIconDisabled] =
    useState<boolean>(false);

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  const goToStep = (nextStep: PlannerState) => {
    setCurrentState(nextStep);
  };

  const handleDialogOpen = (step: PlannerState, message: string) => {
    setDialogMessage(message);
    setCurrentDialogStep(step);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    if (currentDialogStep === PlannerState.GOALS) {
      setIsFinancialGoalsIconDisabled(true);
    } else if (currentDialogStep === PlannerState.INVESTMENT_ALLOCATION) {
      setIsInvestmentAllocationIconDisabled(true);
    } else if (currentDialogStep === PlannerState.PORTFOLIO_SUMMARY) {
      setIsPortFolioSummaryIconDisabled(true);
    }
    setCurrentDialogStep(null);
  };

  useEffect(() => {
    switch (currentState) {
      case PlannerState.GOALS:
        setIsFinancialGoalsExpanded(true);
        setIsInvestmentAllocationVisible(false);
        setIsPortFolioSummaryVisible(false);
        break;
      case PlannerState.INVESTMENT_ALLOCATION:
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

  const handleAccordionClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setExpanded((prevExpanded) => !prevExpanded);
  };

  return (
    <>
      <Typography variant="h4" textAlign="center" m={4} fontWeight={500}>
        FINANCIAL PLANNER
      </Typography>
      <Box sx={{ margin: 3 }}>
        <FinancialGoalsAccordion
          isExpanded={isFinancialGoalsExpanded}
          onAccordionClick={(event) =>
            handleAccordionClick(event, setIsFinancialGoalsExpanded)
          }
          onDialogOpen={() =>
            handleDialogOpen(
              PlannerState.GOALS,
              'A financial goal is in the most cases an event for which you have to flush out a lumpsum of money...',
            )
          }
          isIconDisabled={isFinancialGoalsIconDisabled}
          plannerData={plannerData}
          dispatch={dispatch}
          goToStep={goToStep}
        />

        <InvestmentAllocationAccordion
          isExpanded={isInvestmentAllocationExpanded}
          isVisible={isInvestmentAllocationVisible}
          onAccordionClick={(event) =>
            handleAccordionClick(event, setIsInvestmentAllocationExpanded)
          }
          onDialogOpen={() =>
            handleDialogOpen(
              PlannerState.INVESTMENT_ALLOCATION,
              'Now that you have added your financial goals, choose the investments that you are comfortable investing in. Just put the percentage of investment next each option under the type of goal',
            )
          }
          isIconDisabled={isInvestmentAllocationIconDisabled}
          plannerData={plannerData}
          dispatch={dispatch}
          goToStep={goToStep}
        />

        <PortfolioSummaryAccordion
          isExpanded={isPortFolioSummaryExpanded}
          isVisible={isPortFolioSummaryVisible}
          onAccordionClick={(event) =>
            handleAccordionClick(event, setIsPortFolioSummaryExpanded)
          }
          onDialogOpen={() =>
            handleDialogOpen(
              PlannerState.PORTFOLIO_SUMMARY,
              'Alright! Based on the goals you have added and your choice of investments, we calculated how much you should invest into each of the investment options. Here is a summary of the investments you have added.',
            )
          }
          isIconDisabled={isPortFolioSummaryIconDisabled}
          plannerData={plannerData}
        />
      </Box>
      <AcknowledgmentDialog
        open={isDialogOpen}
        message={dialogMessage}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default Planner;
