import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { Box, Button, Grid2 as Grid } from '@mui/material';
import CustomTextField from '../../../../components/CustomTextField';

const InvestmentAllocationPerTerm = ({
  control,
  name,
}: {
  control: any;
  name: string;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Grid
          container
          spacing={2}
          display={'flex'}
          justifyContent="center"
          alignItems="center"
        >
          {fields.map((field, index) => (
            <Grid container key={field.id} spacing={2}>
              <Grid size={6}>
                <Controller
                  name={`${name}.${index}.investmentName`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} placeholder="Investment Name" />
                  )}
                />
              </Grid>
              <Grid size={2}>
                <Controller
                  name={`${name}.${index}.expectedReturnPercentage`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      type="number"
                      placeholder="Expected Return (%)"
                    />
                  )}
                />
              </Grid>
              <Grid size={2}>
                <Controller
                  name={`${name}.${index}.investmentPercentage`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      type="number"
                      placeholder="Allocation (%)"
                    />
                  )}
                />
              </Grid>
              <Grid size={2}>
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
        </Grid>
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
      {/* <Grid size={6}>
        <InvestmentPieChart allocations={fields} />
      </Grid> */}
    </Grid>
  );
};

export default InvestmentAllocationPerTerm;
