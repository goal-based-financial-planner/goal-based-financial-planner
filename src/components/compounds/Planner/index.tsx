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
  Grid,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
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

  console.log(
    isInvestmentAllocationInvalid(TermType.SHORT_TERM),
    !isInvestmentAllocationInvalid(TermType.MEDIUM_TERM),
    isInvestmentAllocationInvalid(TermType.LONG_TERM),
  );
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
    <Grid container>
      {/* <Grid
        xs={2.5}
        item
        sx={{
          backgroundColor: theme.palette.leftPanel.main,
          height: 'calc(100vh)',
        }}
      >
        <Box p={2}>
          <Stepper activeStep={activeStep} orientation={'vertical'}>
            {steps.map(({ label, description }) => {
              return (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    <Typography variant={'caption'}>{description}</Typography>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </Grid>

      <Grid
        item
        xs={9.5}
        sx={{
          backgroundColor: theme.palette.rightPanel.main,
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        <Box p={2}>
          {stepComponents[activeStep]}
          <Container
            sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}
            maxWidth={false}
          >
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === 0 ? (
              ''
            ) : (
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                {'<- '}Back
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              ''
            ) : (
              <Button
                onClick={handleNext}
                //  disabled={!allowNext()}
                variant="contained"
                sx={{ borderRadius: 5 }}
              >
                Next {'->'}
              </Button>
            )}
          </Container>
        </Box>
      </Grid> */}
      <FinancialGoalsStep plannerData={plannerData} dispatch={dispatch} />
      {/* {plannerData.financialGoals.length > 0 ? (
        <InvestmentAllocationStep
          plannerData={plannerData}
          dispatch={dispatch}
        />
      ) : null} */}

      {plannerData.financialGoals.length > 0 ? (
        <PortfolioSummaryStep plannerData={plannerData} />
      ) : null}
    </Grid>
  );
};

export default Planner;
