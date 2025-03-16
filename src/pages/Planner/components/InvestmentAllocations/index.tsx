import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import InvestmentAllocationPerTerm from '../InvesmentAllocationPerTerm';
import { TermType } from '../../../../types/enums';
import { updateInvestmentAllocation } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

const InvestmentAllocations = ({
  investmentAllocations,
  dispatch,
  onSubmit,
  termType,
}: {
  investmentAllocations: InvestmentAllocationsType;
  dispatch: React.Dispatch<PlannerDataAction>;
  onSubmit: () => void;
  termType: TermType;
}) => {
  const { control, handleSubmit } = useForm<InvestmentAllocationsType>({
    defaultValues: investmentAllocations,
    reValidateMode: 'onChange',
    mode: 'onBlur',
  });
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarMessage, setShowSnackBarMessage] = useState('');

  const areInvestmentAllocationsValid = (
    data: InvestmentAllocationsType,
    termType: TermType,
  ): boolean => {
    let isFormValid = true;
    const allocation = data[termType];
    if (allocation.length === 0) {
      setShowSnackBarMessage('Add atleast one allocation');
      return false;
    }
    const isEmptyAllocation = allocation.find(
      (ab) => ab.investmentName === '' || ab.investmentPercentage === 0,
    );

    if (isEmptyAllocation) {
      isFormValid = false;
      setShowSnackBarMessage('Delete empty Allocation');
      return false;
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

    return isFormValid;
  };

  const onSubmitForm = (data: InvestmentAllocationsType) => {
    debugger;
    if (areInvestmentAllocationsValid(data, termType)) {
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
          width: { xs: '95vw', sm: '80vw', md: '60vw', lg: '50vw' },
          maxWidth: '800px',
          height: '80vh',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          p: 2,
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width: 600px)': {
            position: 'fixed',
            top: '20%',
            transform: 'scale(0.8)',
          },
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Investment Allocations for {termType} Goals
          </Typography>

          <Typography sx={{ mt: 1, mb: 2 }}>
            We have recommended a few investment options based on your goals'
            term. You can modify the options and percentages below. Ensure your
            total investment percentage adds up to 100%.
          </Typography>
        </Box>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          noValidate
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              paddingBottom: '16px',
            }}
          >
            <InvestmentAllocationPerTerm control={control} name={termType} />
          </Box>

          <Box
            sx={{
              pt: 2,
              backgroundColor: 'white',
              textAlign: 'right',
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
