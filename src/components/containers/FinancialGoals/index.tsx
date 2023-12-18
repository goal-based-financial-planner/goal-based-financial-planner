import React from 'react';
import FinancialGoalsTable from './FinancialGoalsTable';
import { Box, Unstable_Grid2 as Grid, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomButton from '../../common/CustomButton';

const FinancialGoals: React.FC = () => {
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
              icon={<AddIcon></AddIcon>}
              text="Add Goal"
              onClick={() => {}}
            ></CustomButton>
          </Box>
        </Grid>
        <Grid xs={12}>
          <FinancialGoalsTable goals={[]}></FinancialGoalsTable>
        </Grid>
      </Grid>
    </>
  );
};

export default FinancialGoals;
