import { Button, Modal, Paper, Stack } from '@mui/material';
import React, { Dispatch, useState } from 'react';
import { Add, CancelRounded } from '@mui/icons-material';
import { addInvestmentOption } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import {
  ALPHANUMERIC_PATTERN,
  NUMBER_PATTERN,
} from '../../../../types/constants';
import Grid from '@mui/material/Grid';
import CustomTextField from '../../../../components/CustomTextField';

interface AddFinancialGoalsProps {
  showAddInvesmentOptionsModal: boolean;
  handleClose: () => void;
  dispatch: Dispatch<PlannerDataAction>;
}

const AddInvestmentOptions: React.FC<AddFinancialGoalsProps> = ({
  showAddInvesmentOptionsModal,
  handleClose,
  dispatch,
}: AddFinancialGoalsProps) => {
  const handleCloseAndReset = () => {
    setInvestmentOptionName('');
    setExpectedPercentage(0);
    handleClose();
  };

  const [invesmentOptionName, setInvestmentOptionName] = useState<string>('');
  const [expectedPercentage, setExpectedPercentage] = useState<number>(0);

  const handleInvestmentOptionChange = (value: string) => {
    setInvestmentOptionName(value);
  };

  const handleExpectedPercentChange = (value: any) => {
    setExpectedPercentage(Number(value));
  };

  const handleAdd = () => {
    addInvestmentOption(dispatch, {
      id: invesmentOptionName,
      investmentName: invesmentOptionName,
      expectedReturnPercentage: expectedPercentage,
    });
    handleCloseAndReset();
  };

  return (
    <Modal
      component={Stack}
      open={showAddInvesmentOptionsModal}
      alignItems="center"
      justifyContent="center"
      onClose={handleClose}
    >
      <Paper
        component={Stack}
        p={3}
        sx={{
          position: 'absolute',
          minWidth: {
            xs: '90%',
            sm: null,
            md: 600,
          },
          maxWidth: 400,
          width: {
            xs: '80%',
            md: 600,
          },
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add Investment Option</h2>
        <Grid container spacing={5} alignItems="center" mt={0.5}>
          <Grid xs={6}>
            <CustomTextField
              label="Investment option name"
              placeholder='Eg: "Gold"'
              sx={{ minWidth: '270px', minHeight: 80 }}
              helperText="Enter valid  Name"
              required
              value={invesmentOptionName}
              onChange={handleInvestmentOptionChange}
              regex={ALPHANUMERIC_PATTERN}
            />
          </Grid>

          <Grid xs={6}>
            <CustomTextField
              label="Expected Percentage"
              placeholder='Eg: "1000000"'
              sx={{ minWidth: '270px', minHeight: 80 }}
              required
              helperText="Enter valid Amount"
              value={expectedPercentage}
              onChange={handleExpectedPercentChange}
              regex={NUMBER_PATTERN}
            />
          </Grid>

          <Grid xs={6}>
            <Button
              startIcon={<CancelRounded />}
              variant="outlined"
              color="secondary"
              onClick={handleCloseAndReset}
            >
              Cancel
            </Button>
          </Grid>
          <Grid
            xs={6}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <Button
              startIcon={<Add />}
              onClick={handleAdd}
              variant="contained"
              color="secondary"
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default AddInvestmentOptions;
