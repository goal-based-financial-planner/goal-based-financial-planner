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
import { Dispatch, useEffect, useMemo } from 'react';
import { getUserLocale } from '../../../../../../types/util';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
  expectedReturnPct: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  investmentTypes: string[];
  dispatch: Dispatch<PlannerDataAction>;
  existingEntry?: SIPEntry;
};

const localeCurrencyMap: Record<string, string> = {
  'en-IN': 'INR', 'hi-IN': 'INR', 'en-US': 'USD',
  'en-GB': 'GBP', 'de-DE': 'EUR', 'fr-FR': 'EUR', 'ja-JP': 'JPY',
};

const SIPForm = ({
  open,
  onClose,
  investmentTypes,
  dispatch,
  existingEntry,
}: Props) => {
  const isEditMode = Boolean(existingEntry);

  const currencySymbol = useMemo(() => {
    const locale = getUserLocale();
    const currency = localeCurrencyMap[locale] || 'USD';
    return (0)
      .toLocaleString(locale, { style: 'currency', currency, maximumFractionDigits: 0 })
      .replace(/[\d,.\s]/g, '')
      .trim();
  }, []);

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
      expectedReturnPct: existingEntry?.expectedReturnPct != null ? String(existingEntry.expectedReturnPct) : '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: existingEntry?.name ?? '',
        type: existingEntry?.type ?? investmentTypes[0] ?? '',
        monthlyAmount: existingEntry ? String(existingEntry.monthlyAmount) : '',
        expectedReturnPct: existingEntry?.expectedReturnPct != null ? String(existingEntry.expectedReturnPct) : '',
      });
    }
  }, [open, existingEntry, investmentTypes, reset]);

  const watchedType = useWatch({ control, name: 'type' });
  const isCustomType = watchedType ? !investmentTypes.includes(watchedType) : false;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    const monthlyAmount = parseFloat(values.monthlyAmount);
    const expectedReturnPct = isCustomType && values.expectedReturnPct
      ? parseFloat(values.expectedReturnPct)
      : undefined;

    if (isEditMode && existingEntry) {
      editInvestmentLogEntry(dispatch, existingEntry.id, values.name, values.type, monthlyAmount, expectedReturnPct);
    } else {
      const entry: SIPEntry = {
        id: crypto.randomUUID(),
        name: values.name,
        type: values.type,
        monthlyAmount,
        ...(expectedReturnPct != null && { expectedReturnPct }),
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

          {isCustomType && (
            <TextField
              label="Expected Annual Return (%)"
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              placeholder="e.g. 7.1"
              error={Boolean(errors.expectedReturnPct)}
              helperText={
                errors.expectedReturnPct?.message ??
                'Used to project portfolio growth for this investment type'
              }
              {...register('expectedReturnPct', {
                required: 'Return % is required for custom types',
                validate: (v) => {
                  const n = parseFloat(v);
                  return (!isNaN(n) && n >= 0 && n <= 100) || 'Enter a value between 0 and 100';
                },
              })}
            />
          )}

          <TextField
            label={`Monthly SIP Amount (${currencySymbol})`}
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
