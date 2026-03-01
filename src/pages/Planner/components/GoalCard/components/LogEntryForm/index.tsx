import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Dispatch, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PlannerDataAction } from '../../../../../../store/plannerDataReducer';
import {
  addInvestmentLogEntry,
  editInvestmentLogEntry,
} from '../../../../../../store/plannerDataActions';
import { SIPEntry } from '../../../../../../types/investmentLog';

type FormValues = {
  name: string;
  type: string;
  monthlyAmount: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  investmentTypes: string[];
  dispatch: Dispatch<PlannerDataAction>;
  existingEntry?: SIPEntry;
};

const SIPForm = ({
  open,
  onClose,
  investmentTypes,
  dispatch,
  existingEntry,
}: Props) => {
  const isEditMode = Boolean(existingEntry);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: existingEntry?.name ?? '',
      type: existingEntry?.type ?? investmentTypes[0] ?? '',
      monthlyAmount: existingEntry ? String(existingEntry.monthlyAmount) : '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: existingEntry?.name ?? '',
        type: existingEntry?.type ?? investmentTypes[0] ?? '',
        monthlyAmount: existingEntry ? String(existingEntry.monthlyAmount) : '',
      });
    }
  }, [open, existingEntry, investmentTypes, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    const monthlyAmount = parseFloat(values.monthlyAmount);

    if (isEditMode && existingEntry) {
      editInvestmentLogEntry(dispatch, existingEntry.id, values.name, values.type, monthlyAmount);
    } else {
      const entry: SIPEntry = {
        id: crypto.randomUUID(),
        name: values.name,
        type: values.type,
        monthlyAmount,
      };
      addInvestmentLogEntry(dispatch, entry);
    }

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit SIP' : 'Add SIP'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Fund / Investment Name"
            placeholder="e.g. Axis Bank Liquid Fund"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Controller
            name="type"
            control={control}
            rules={{ required: 'Type is required' }}
            render={({ field }) => (
              <Autocomplete
                freeSolo
                disablePortal
                options={investmentTypes}
                value={field.value}
                onChange={(_, value) => field.onChange(value ?? '')}
                onInputChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Investment Type"
                    placeholder="e.g. Liquid Funds, or type your own"
                    error={Boolean(errors.type)}
                    helperText={errors.type?.message}
                  />
                )}
              />
            )}
          />

          <TextField
            label="Monthly SIP Amount (₹)"
            type="number"
            inputProps={{ min: 1, step: 1 }}
            error={Boolean(errors.monthlyAmount)}
            helperText={errors.monthlyAmount?.message}
            {...register('monthlyAmount', {
              required: 'Amount is required',
              validate: (v) =>
                parseFloat(v) > 0 || 'Amount must be greater than zero',
            })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          {isEditMode ? 'Save Changes' : 'Add SIP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SIPForm;
