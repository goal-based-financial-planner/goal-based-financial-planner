import React, { Dispatch, useState } from 'react';
import FinancialGoalsTable from './FinancialGoalsTable';
import { Box, Unstable_Grid2 as Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddFinancialGoals from './AddFinancialGoals';
import CustomButton from '../../common/CustomButton';
import { PlannerData } from '../../../domain/PlannerData';
import { PlannerDataAction } from '../../../store/plannerDataReducer';

type FinancialGoalsProps = {
  plannerData: PlannerData;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoals: React.FC<FinancialGoalsProps> = ({
  plannerData,
  dispatch,
}) => {
  const [showAddGoalsModal, setShowAddGoalsModal] = useState(false);
  const handleClose = () => setShowAddGoalsModal(false);

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={10}>
          <h1>Financial Goals</h1>
        </Grid>
        <Grid
          xs={2}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
          <Box>
            <CustomButton
              text="Add Goal"
              startIcon={<AddIcon />}
              onClick={() => {
                setShowAddGoalsModal(true);
              }}
            ></CustomButton>
          </Box>
        </Grid>
        <Grid xs={12}>
          <FinancialGoalsTable goals={plannerData.financialGoals} />
        </Grid>
      </Grid>

      <AddFinancialGoals
        handleClose={handleClose}
        showAddGoalsModal={showAddGoalsModal}
      />
    </>
  );
};

export default FinancialGoals;
