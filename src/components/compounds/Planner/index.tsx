import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import FinancialGoalsStep from '../FinancialGoalsStep';
import InvestmentAllocationStep from '../InvestmentAllocationStep';
import PortfolioSummaryStep from '../PortfolioSummaryStep';
import { TermType } from '../../../types/enums';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  const [activeStep, setActiveStep] = React.useState(0);

  const steps = [
    'Financial Goals',
    'Investment Allocation',
    'Portfolio Summary',
  ];

  const stepComponents = [
    <FinancialGoalsStep plannerData={plannerData} dispatch={dispatch} />,
    <InvestmentAllocationStep plannerData={plannerData} dispatch={dispatch} />,
    <PortfolioSummaryStep plannerData={plannerData} />,
  ];

  const areGoalsPresentOfType = (column: string) => {
    return plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);
  };

  const isInvestmentAllocationInvalid = (termType: TermType) => {
    if (areGoalsPresentOfType(termType)) {
      const termSum = plannerData.investmentAllocationOptions.reduce(
        (sum, row) =>
          sum +
          Number(
            plannerData.investmentAllocations[termType].filter(
              (e) => e.id === row.id,
            )[0]?.investmentPercentage || 0,
          ),
        0,
      );

      return termSum !== 100;
    } else return false;
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const allowNext = () => {
    switch (activeStep) {
      case 0:
        return plannerData.financialGoals.length > 0;
      case 1:
        return (
          !isInvestmentAllocationInvalid(TermType.SHORT_TERM) &&
          !isInvestmentAllocationInvalid(TermType.MEDIUM_TERM) &&
          !isInvestmentAllocationInvalid(TermType.LONG_TERM)
        );
      default:
        return true;
    }
  };

  return (
    <>
      <Typography variant="h4" textAlign="center" m={4} fontWeight={500}>
        FINANCIAL PLANNER
      </Typography>

      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {stepComponents[activeStep]}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        {activeStep === 0 ? (
          ''
        ) : (
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
        )}

        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          ''
        ) : (
          <Button onClick={handleNext} disabled={!allowNext()}>
            Next
          </Button>
        )}
      </Box>

      {/* <Box sx={{ margin: 3 }}>
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
      /> */}
    </>
  );
};

export default Planner;
