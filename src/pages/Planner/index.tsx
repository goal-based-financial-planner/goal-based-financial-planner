import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import { Grid } from '@mui/material';
import FinancialGoals from '../../components/FinancialGoalsStep';
import PortfolioSummary from '../../components/PortfolioSummaryStep';
import { TermType } from '../../types/enums';

const Planner: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

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

  return (
    <Grid container>
      <FinancialGoals plannerData={plannerData} dispatch={dispatch} />

      {plannerData.financialGoals.length > 0 ? (
        <PortfolioSummary plannerData={plannerData} />
      ) : null}
    </Grid>
  );
};

export default Planner;
