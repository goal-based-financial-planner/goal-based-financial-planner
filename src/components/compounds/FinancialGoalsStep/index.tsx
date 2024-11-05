import React, { Dispatch } from 'react';
import { Grid } from '@mui/material';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import { PlannerData } from '../../../domain/PlannerData';
import FinancialGoalsGrid from '../../molecules/FinancialGoals/FinancialGoalsGrid';
import FinancialGoalForm from '../../molecules/FinancialGoals/FinancialGoalForm';

type FinancialGoalsProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

const FinancialGoalsStep: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  return (
    <Grid container rowGap={6} columnGap={3}>
      {plannerData.financialGoals.length ? (
        <FinancialGoalsGrid financialGoals={plannerData.financialGoals} />
      ) : null}

      <Grid xs={2.5} item>
        <FinancialGoalForm
          dispatch={dispatch}
          label={
            plannerData.financialGoals.length > 0
              ? 'Add More'
              : 'Add your first goal'
          }
        />
      </Grid>
    </Grid>
  );
};

export default FinancialGoalsStep;
