import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../../store/plannerDataReducer';
import {
  Box,
  Button,
  Container,
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
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Stepper activeStep={activeStep} sx={{ width: '1000px' }}>
          {steps.map((label) => {
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
      </Box>

      {stepComponents[activeStep]}
      <Container
        sx={{ display: 'flex', flexDirection: 'row' }}
        maxWidth={false}
      >
        {activeStep === 0 ? (
          ''
        ) : (
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
            variant="outlined"
          >
            Back
          </Button>
        )}

        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          ''
        ) : (
          <Button
            onClick={handleNext}
            disabled={!allowNext()}
            variant="contained"
          >
            Next
          </Button>
        )}
      </Container>
    </>
  );
};

export default Planner;
