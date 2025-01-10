import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import InvestmentAllocationPerTerm from '../../../../pages/Planner/components/InvesmentAllocationPerTerm';
import { TermType } from '../../../../types/enums';
import { updateInvestmentAllocation } from '../../../../store/plannerDataActions';
import { PlannerData } from '../../../../domain/PlannerData';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

const InvestmentAllocations = ({
  plannerData,
  dispatch,
  onSubmit,
  termType,
}: {
  plannerData: PlannerData;
  dispatch: React.Dispatch<PlannerDataAction>;
  onSubmit: () => void;
  termType: TermType;
}) => {
  const { control, handleSubmit } = useForm<InvestmentAllocationsType>({
    defaultValues: plannerData.investmentAllocations,
    reValidateMode: 'onChange',
    mode: 'onBlur',
  });
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarMessage, setShowSnackBarMessage] = useState('');

  const areInvestmentAllocationsValid = (
    data: InvestmentAllocationsType,
  ): boolean => {
    let isFormValid = true;
    Object.values(data).forEach((allocation) => {
      if (allocation.length === 0) {
        return;
      }
      const isEmptyAllocation = allocation.find(
        (ab) => ab.investmentName === '' || ab.investmentPercentage === 0,
      );

      if (isEmptyAllocation) {
        isFormValid = false;
        setShowSnackBarMessage('Delete empty Allocation');
        return;
      }
      const totalPercentage = allocation.reduce(
        (acc, v) => Number(v.investmentPercentage) + acc,
        0,
      );

      if (totalPercentage !== 100) {
        isFormValid = false;
        setShowSnackBarMessage(
          'Invalid Allocation. Please make sure the allocation percentages addsupto 100',
        );
      }
    });

    return isFormValid;
  };

  const onSubmitForm = (data: InvestmentAllocationsType) => {
    if (areInvestmentAllocationsValid(data)) {
      updateInvestmentAllocation(dispatch, data);
      onSubmit();
    } else {
      setShowSnackBar(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          width: '800px',
          height: '60vh', // Box height relative to viewport height
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          p: 2,
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column', // Ensures children stack vertically
        }}
      >
        <Typography
          sx={{
            fontSize: 30,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Investment Allocations for {termType} Goals
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            p: 2,
          }}
        >
          We have recommended a few investment options based on your goals'
          term. You can modify the options and percentages below. Ensure your
          total investment percentage adds up to 100%.
        </Typography>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          noValidate
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            <InvestmentAllocationPerTerm control={control} name={termType} />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'green',
                border: '1px solid green',
              }}
              type="submit"
            >
              Submit
            </Button>
          </Box>
        </form>
      </Box>

      <Snackbar
        autoHideDuration={5000}
        open={showSnackBar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setShowSnackBar(false)}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InvestmentAllocations;
