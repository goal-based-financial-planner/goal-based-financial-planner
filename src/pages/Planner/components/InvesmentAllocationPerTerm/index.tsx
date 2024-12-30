import React from 'react';
import { useFieldArray, Controller, Control, useWatch } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  Button,
  Grid2 as Grid,
  TextField,
  Typography,
} from '@mui/material';
import InvestmentPieChart from '../InvestmentPieChart';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';
import { TermType } from '../../../../types/enums';
import investmentNames from '../../../../domain/investmentAllocations';

const InvestmentAllocationPerTerm = ({
  control,
  name,
}: {
  control: Control<InvestmentAllocationsType, any>;
  name: TermType;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchedFields = useWatch({
    control,
    name,
  });

  return (
    <Grid container spacing={2}>
      <Grid size={8}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography fontWeight="bold">Investment Name</Typography>
          </Grid>
          <Grid size={2.5}>
            <Typography fontWeight="bold" textAlign="center">
              Expected Return (%)
            </Typography>
          </Grid>
          <Grid size={2.5}>
            <Typography fontWeight="bold" textAlign="center">
              Investment (%){' '}
            </Typography>
          </Grid>
          <Grid size={1}></Grid>
        </Grid>
        {fields.map((field, index) => (
          <Grid container key={field.id} spacing={2}>
            <Grid size={6}>
              <Controller
                name={`${name}.${index}.investmentName`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={investmentNames}
                    freeSolo
                    value={field.value || ''}
                    onChange={(event, newValue) => {
                      field.onChange(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === 'change') {
                        field.onChange(newInputValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        sx={{ width: '100%' }}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={2.5}>
              <Controller
                name={`${name}.${index}.expectedReturnPercentage`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    sx={{ width: '100%' }}
                    variant="standard"
                    slotProps={{
                      input: {
                        inputProps: {
                          min: 1,
                          inputMode: 'numeric',
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={2.5}>
              <Controller
                name={`${name}.${index}.investmentPercentage`}
                control={control}
                rules={{
                  validate: (value) => value <= 100,
                }}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <TextField
                      {...field}
                      type="number"
                      error={!!error}
                      slotProps={{
                        input: {
                          inputProps: {
                            min: 1,
                            max: 100,
                            inputMode: 'numeric',
                          },
                        },
                      }}
                      sx={{ width: '100%' }}
                      variant="standard"
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={1}>
              <Box
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                  },
                }}
              >
                <span
                  className="material-symbols-rounded"
                  onClick={() => remove(index)}
                >
                  delete
                </span>
              </Box>
            </Grid>
          </Grid>
        ))}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4 }}
          onClick={() =>
            append({
              investmentName: '',
              expectedReturnPercentage: 0,
              investmentPercentage: 0,
            })
          }
        >
          Add Investment
        </Button>
      </Grid>
      <Grid size={4}>
        <InvestmentPieChart allocations={watchedFields} />
      </Grid>
    </Grid>
  );
};

export default InvestmentAllocationPerTerm;
