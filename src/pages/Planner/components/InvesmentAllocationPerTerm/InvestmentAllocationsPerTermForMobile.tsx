import { useFieldArray, Controller, Control } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  Button,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';
import { TermType } from '../../../../types/enums';
import investmentNames from '../../../../domain/investmentAllocations';
import { useState } from 'react';

const InvestmentAllocationPerTermForMobile = ({
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

  const [editableRow, setEditableRow] = useState<number | null>(null);

  const saveRow = (index: number) => {
    setEditableRow(null);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold" fontSize="12px">
                    Investment Name
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" fontSize="12px">
                    Expected Return (%)
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" fontSize="12px">
                    Investment (%)
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => {
                const isEditing = editableRow === index; // Track editable row
                return (
                  <TableRow
                    key={field.id}
                    sx={{
                      'td,th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Controller
                        name={`${name}.${index}.investmentName`}
                        control={control}
                        render={({ field }) =>
                          isEditing ? (
                            <Autocomplete
                              options={investmentNames}
                              freeSolo
                              value={field.value || ''}
                              onChange={(event, newValue) =>
                                field.onChange(newValue)
                              }
                              onInputChange={(event, newInputValue) => {
                                if (event?.type === 'change') {
                                  field.onChange(newInputValue);
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  fullWidth
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      fontSize: '12px',
                                    }, // Input text size
                                  }}
                                />
                              )}
                              slotProps={{
                                paper: {
                                  sx: {
                                    fontSize: '12px', // Font size for dropdown options
                                    width: 'auto', // Allows dropdown to take more width dynamically
                                    minWidth: '200px', // Set minimum width
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Typography fontSize="12px">
                              {field.value || '—'}
                            </Typography>
                          )
                        }
                      />
                    </TableCell>
                    <TableCell align="center" width={'120px'}>
                      <Controller
                        name={`${name}.${index}.expectedReturnPercentage`}
                        control={control}
                        render={({ field }) =>
                          isEditing ? (
                            <TextField
                              {...field}
                              type="number"
                              sx={{
                                width: '100%',
                                '& .MuiInputBase-input': {
                                  fontSize: '12px',
                                },
                              }}
                              variant="standard"
                              inputProps={{
                                min: 1,
                                inputMode: 'numeric',
                              }}
                            />
                          ) : (
                            <Typography fontSize="12px">
                              {field.value}
                            </Typography>
                          )
                        }
                      />
                    </TableCell>
                    <TableCell align="center" width={'100px'}>
                      <Controller
                        name={`${name}.${index}.investmentPercentage`}
                        control={control}
                        rules={{
                          validate: (value) => value <= 100,
                        }}
                        render={({ field, fieldState: { error } }) =>
                          isEditing ? (
                            <TextField
                              {...field}
                              type="number"
                              error={!!error}
                              inputProps={{
                                min: 1,
                                max: 100,
                                inputMode: 'numeric',
                              }}
                              sx={{
                                width: '100%',
                                '& .MuiInputBase-input': {
                                  fontSize: '12px',
                                },
                              }}
                              variant="standard"
                            />
                          ) : (
                            <Typography fontSize="12px">
                              {field.value}
                            </Typography>
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          textAlign: 'right',
                          '& > span': { mx: 1, cursor: 'pointer' },
                        }}
                      >
                        {isEditing ? (
                          <span
                            className="material-symbols-rounded"
                            onClick={() => saveRow(index)}
                            style={{ fontSize: 'medium' }}
                          >
                            save
                          </span>
                        ) : (
                          <span
                            className="material-symbols-rounded"
                            onClick={() => setEditableRow(index)}
                            style={{ fontSize: 'medium' }}
                          >
                            edit
                          </span>
                        )}
                        <span
                          className="material-symbols-rounded"
                          onClick={() => remove(index)}
                          style={{ fontSize: 'medium' }}
                        >
                          delete
                        </span>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              sx={{
                mt: 2,
                color: 'green',
                border: '1px solid green',
                fontSize: '12px',
              }}
              onClick={() => {
                append({
                  investmentName: '',
                  expectedReturnPercentage: 0,
                  investmentPercentage: 0,
                });
                setEditableRow(fields.length);
              }}
            >
              Add Investment
            </Button>
          </Box>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default InvestmentAllocationPerTermForMobile;
