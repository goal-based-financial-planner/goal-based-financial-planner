import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Alert, Box, Button, Divider, IconButton, Snackbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InvestmentAllocationPerTerm from '../InvesmentAllocationPerTerm';
import { TermType } from '../../../../types/enums';
import { updateInvestmentAllocation } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

const InvestmentAllocations = ({
  investmentAllocations,
  dispatch,
  onSubmit,
  onCancel,
  termType,
}: {
  investmentAllocations: InvestmentAllocationsType;
  dispatch: React.Dispatch<PlannerDataAction>;
  onSubmit: () => void;
  /** Closes without saving. The Cancel / ✕ buttons are hidden when omitted. */
  onCancel?: () => void;
  termType: TermType;
}) => {
  const { control, handleSubmit } = useForm<InvestmentAllocationsType>({
    defaultValues: investmentAllocations,
    reValidateMode: 'onChange',
    mode: 'onBlur',
  });
  const rows = useWatch({ control, name: termType }) ?? [];
  const total = rows.reduce((sum, row) => sum + (Number(row?.investmentPercentage) || 0), 0);
  const totalColor = total === 100 ? 'primary.main' : total > 100 ? 'error.main' : 'warning.main';
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
        role="dialog"
        aria-labelledby="allocation-dialog-title"
        sx={{
          width: { xs: 'calc(100vw - 32px)', sm: 680 },
          maxWidth: '100%',
          maxHeight: '90vh',
          backgroundColor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        <Box className="allocation-modal-header" sx={{ display: 'flex', gap: 2, px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 2.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography id="allocation-dialog-title" component="h2" sx={{ fontWeight: 700, fontSize: 19 }}>
              Investment Allocations for {termType} Goals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 480 }}>
              We&apos;ve recommended a few investment options based on your goals&apos; term. You can modify the
              options and percentages below. Ensure your total adds up to 100%.
            </Typography>
          </Box>
          {onCancel && (
            <IconButton aria-label="Close" onClick={onCancel} sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Divider />

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          noValidate
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Box className="allocation-table-section" sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                mb: 2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#F8F8F7',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Total Allocation
                {total !== 100 && (
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                    {' '}· {total < 100 ? `${100 - total}% left to allocate` : `${total - 100}% over`}
                  </Box>
                )}
              </Typography>
              <Typography aria-label="Total allocation" sx={{ fontWeight: 700, color: totalColor }}>
                {total}%
              </Typography>
            </Box>
            <InvestmentAllocationPerTerm control={control} name={termType} />
          </Box>

          <Divider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              px: { xs: 2.5, sm: 3.5 },
              py: 2,
              backgroundColor: '#FBFBFA',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mr: 'auto', flex: 1, minWidth: 0 }}>
              Changes update this term&apos;s suggested SIPs. Your logged SIPs stay as they are.
            </Typography>
            {onCancel && (
              <Button onClick={onCancel} color="inherit" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                Cancel
              </Button>
            )}
            <Button className="allocation-submit-btn" variant="contained" type="submit" sx={{ px: 3, flexShrink: 0 }}>
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
