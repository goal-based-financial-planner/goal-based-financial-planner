import React, { useState } from 'react';
import { useFieldArray, Controller, Control } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SavingsIcon from '@mui/icons-material/Savings';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';
import { TermType } from '../../../../types/enums';
import investmentNames from '../../../../domain/investmentAllocations';
import { assetClassOf } from '../../../../domain/assetClass';

const instrumentIcon = (name: string): { Icon: React.ElementType; color: string } => {
  if (/liquid/i.test(name)) return { Icon: WaterDropIcon, color: '#4C6EF5' };
  switch (assetClassOf(name || '')) {
    case 'Debt / RD':
      return { Icon: AccountBalanceIcon, color: '#E8772E' };
    case 'Equity':
      return { Icon: ShowChartIcon, color: '#2E7D32' };
    case 'Gold':
      return { Icon: MonetizationOnIcon, color: '#D4A017' };
    case 'Real Estate':
      return { Icon: ApartmentIcon, color: '#6B7280' };
    default:
      return { Icon: SavingsIcon, color: '#8B5CF6' };
  }
};

const headerCellSx = {
  fontSize: 11,
  fontWeight: 600,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  whiteSpace: 'nowrap',
} as const;

const InvestmentAllocationPerTerm = ({
  control,
  name,
}: {
  control: Control<InvestmentAllocationsType>;
  name: TermType;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [editableRow, setEditableRow] = useState<number | null>(null);

  return (
    <Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ '& td, & th': { borderColor: 'divider', px: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Investment Name</TableCell>
              <TableCell align="center" sx={headerCellSx}>
                Expected Return (%)
              </TableCell>
              <TableCell align="center" sx={headerCellSx}>
                Investment (%)
              </TableCell>
              <TableCell align="right" sx={headerCellSx}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => {
              const isEditing = editableRow === index;
              return (
                <TableRow key={field.id}>
                  <TableCell sx={{ width: '50%' }}>
                    <Controller
                      name={`${name}.${index}.investmentName`}
                      control={control}
                      render={({ field }) => {
                        const { Icon, color } = instrumentIcon(field.value);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: isEditing ? 260 : 180 }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                flexShrink: 0,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color,
                              }}
                            >
                              <Icon sx={{ fontSize: 16 }} />
                            </Box>
                            {isEditing ? (
                              <Autocomplete
                                options={investmentNames}
                                freeSolo
                                fullWidth
                                sx={{ minWidth: 220 }}
                                value={field.value || ''}
                                onChange={(event, newValue) => field.onChange(newValue)}
                                onInputChange={(event, newInputValue) => {
                                  if (event?.type === 'change') {
                                    field.onChange(newInputValue);
                                  }
                                }}
                                slotProps={{
                                  popper: {
                                    disablePortal: true,
                                    placement: 'bottom-start',
                                    // Wider than the input so long names fit on one line
                                    sx: { transformOrigin: 'top', zIndex: 2000, minWidth: 320 },
                                  },
                                  listbox: {
                                    sx: { '& .MuiAutocomplete-option': { whiteSpace: 'nowrap', fontSize: 14 } },
                                  },
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Investment name"
                                    inputProps={{ ...params.inputProps, 'aria-label': 'Investment name' }}
                                  />
                                )}
                              />
                            ) : (
                              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{field.value || '—'}</Typography>
                            )}
                          </Box>
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" width="130px">
                    <Controller
                      name={`${name}.${index}.expectedReturnPercentage`}
                      control={control}
                      render={({ field }) =>
                        isEditing ? (
                          <TextField
                            {...field}
                            type="number"
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ min: 1, inputMode: 'numeric', 'aria-label': 'Expected return (%)' }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{field.value}</Typography>
                        )
                      }
                    />
                  </TableCell>
                  <TableCell align="center" width="120px">
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
                            size="small"
                            error={!!error}
                            sx={{ width: 80 }}
                            inputProps={{ min: 1, max: 100, inputMode: 'numeric', 'aria-label': 'Investment (%)' }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{field.value}</Typography>
                        )
                      }
                    />
                  </TableCell>
                  <TableCell align="right" width="96px" sx={{ whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <Tooltip title="Done">
                        <IconButton size="small" aria-label="Save row" onClick={() => setEditableRow(null)} sx={{ color: 'primary.main' }}>
                          <CheckIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit">
                        <IconButton size="small" aria-label="Edit row" onClick={() => setEditableRow(index)} sx={{ color: 'text.secondary' }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        aria-label="Delete row"
                        onClick={() => {
                          remove(index);
                          setEditableRow(null);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Box
        component="button"
        type="button"
        className="allocation-add-btn"
        onClick={() => {
          append({
            investmentName: '',
            expectedReturnPercentage: 0,
            investmentPercentage: 0,
          });
          setEditableRow(fields.length);
        }}
        sx={{
          all: 'unset',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          width: '100%',
          mt: 2.5,
          py: 1.25,
          borderRadius: 2.5,
          border: '1px dashed',
          borderColor: '#D4D4D2',
          fontSize: 13,
          fontWeight: 600,
          color: 'primary.main',
          '&:hover': { borderColor: 'primary.main', backgroundColor: '#F6FAF4' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
        Add Investment
      </Box>
    </Box>
  );
};

export default InvestmentAllocationPerTerm;
