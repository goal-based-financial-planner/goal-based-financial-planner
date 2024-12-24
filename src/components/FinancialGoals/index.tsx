import React, { Dispatch, useState } from 'react';
import { Box } from '@mui/material';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import { PlannerData } from '../../domain/PlannerData';
import FinancialGoalsGrid from '../../pages/Planner/components/FinancialGoalsGrid';
import FinancialGoalForm from '../../pages/Planner/components/FinancialGoalForm';
import Header from '../Header';

type FinancialGoalsProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

const FinancialGoals: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };
  return (
    <>
      <Header title="Your Goals" iconName="add_circle" onAction={handleAdd} />
      <Box sx={{ px: 3, height: 'calc(100vh - 108px)', overflow: 'auto' }}>
        {plannerData.financialGoals.length ? (
          <FinancialGoalsGrid plannerData={plannerData} dispatch={dispatch} />
        ) : null}
      </Box>

      {isFormOpen ? (
        <FinancialGoalForm
          plannerData={plannerData}
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </>
  );
};

export default FinancialGoals;
