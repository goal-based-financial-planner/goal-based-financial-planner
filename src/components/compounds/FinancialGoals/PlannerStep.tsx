import { Box, Button, Grid, Typography } from '@mui/material';
import CustomPaper from '../../atoms/CustomPaper';
import FinancialGoals from '.';
import InvestmentAllocation from '../InvestmentAllocation';

const PlannerStep = ({
  plannerData,
  dispatch,
  currentState,
  onFinancialGoalContinue,
  onFinancialGoalEdit,
  onAssetsPlannerContinue,
  onAssetsPlannerEdit,
  assetsRef,
}: any) => {
  const getGoalSummaryAsText = () => {
    const goalSummary = plannerData
      .getFinancialGoalSummary()
      .filter((e: any) => e.numberOfGoals > 0)
      .map((e: any) => `${e.numberOfGoals} ${e.termType}`);

    const summaryText = goalSummary.join(', ');
    const lastIndex = summaryText.lastIndexOf(',');
    if (lastIndex !== -1) {
      const updatedSummaryText =
        summaryText.substring(0, lastIndex) +
        ' and ' +
        summaryText.substring(lastIndex + 1);
      return updatedSummaryText;
    }

    return summaryText;
  };

  return (
    <Box sx={{ m: 1 }}>
      {currentState === 'goals' ? (
        <CustomPaper>
          <FinancialGoals plannerData={plannerData} dispatch={dispatch} />
          <Box textAlign="right">
            <Button
              disabled={plannerData.financialGoals.length === 0}
              sx={{ fontSize: '1.2rem' }}
              onClick={onFinancialGoalContinue}
              variant="contained"
              color="primary"
            >
              Continue
            </Button>
          </Box>
        </CustomPaper>
      ) : (
        <CustomPaper>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11}>
              <h2>Financial Goals</h2>
              <Typography>
                {`You have added ${getGoalSummaryAsText()} goals`}
              </Typography>
            </Grid>
            <Grid item xs={1} textAlign="right">
              <Button
                onClick={onFinancialGoalEdit}
                variant="contained"
                color="secondary"
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </CustomPaper>
      )}
      {currentState === 'breakdown' ? (
        <CustomPaper sx={{ height: '100vh' }} ref={assetsRef}>
          <h2>Assets Planner </h2>
          <InvestmentAllocation
            dispatch={dispatch}
            plannerData={plannerData}
            onAssetsPlannerContinue={onAssetsPlannerContinue}
          />
          {/* <Box textAlign="right">
            <Button
              sx={{ mt: 3, fontSize: '1.2rem' }}
              onClick={() => {}}
              variant="contained"
              color="primary"
            >
              Continue
            </Button>
          </Box> */}
        </CustomPaper>
      ) : (
        <CustomPaper>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={11}>
              <h2>Assets Planner</h2>
            </Grid>
            <Grid item xs={1} textAlign="right">
              <Button
                onClick={onAssetsPlannerEdit}
                variant="contained"
                color="secondary"
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </CustomPaper>
      )}
    </Box>
  );
};

export default PlannerStep;
