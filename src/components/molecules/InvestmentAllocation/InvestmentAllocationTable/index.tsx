import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
} from '@mui/material';

import React, { Dispatch } from 'react';
import CustomAmountField from '../CustomAmountField';
import {
  setLongTermAssetPercentage,
  setMidTermAssetPercentage,
  setShortTermAssetPercentage,
} from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { PlannerData } from '../../../../domain/PlannerData';
import { InvestmentOptionType } from '../../../../domain/InvestmentOptions';
import { ToolTipVisibilityState } from '../../../compounds/InvestmentAllocationStep';
import { InvestmentOptionRiskType, TermType } from '../../../../types/enums';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

interface InvestmentAllocationTableProps {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
  investmentOptions: InvestmentOptionType[];
  tooltipVisibilityState: ToolTipVisibilityState;
  investmentOptionsData: any;
  setInvestmentOptions: any;
}

const InvestmentAllocationTable: React.FC<InvestmentAllocationTableProps> = ({
  dispatch,
  plannerData,
  investmentOptions,
  tooltipVisibilityState: termTooltipVisible,
  investmentOptionsData,
  setInvestmentOptions,
}) => {
  const handleInputChangeForShortTerm = (assetId: string, value: any) => {
    setShortTermAssetPercentage(dispatch, assetId, value);
  };

  const handleInputChangeForMidTerm = (assetId: string, value: any) => {
    setMidTermAssetPercentage(dispatch, assetId, value);
  };
  const handleInputChangeForLongTerm = (assetId: string, value: any) => {
    setLongTermAssetPercentage(dispatch, assetId, value);
  };

  const areGoalsPresentOfType = (column: string) => {
    return plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);
  };

  const handleAddRow = () => {
    setInvestmentOptions([
      ...investmentOptionsData,
      {
        assetType: '',
        expectedPercentage: '',
        riskType: '' as InvestmentOptionRiskType,
        id: Math.random().toString(),
      } as unknown as InvestmentOptionType,
    ]);
  };

  const conditionallyRenderToolTipBasedCell = (
    label: string,
    termType: 'shortTerm' | 'midTerm' | 'longTerm',
    offset: number,
    column: string,
  ) => {
    const tooltipVisible = termTooltipVisible[termType];
    const shouldHideColumn = areGoalsPresentOfType(column);

    return !shouldHideColumn ? null : (
      <StyledTableCell sx={{ width: '70px' }}>
        {tooltipVisible ? (
          <Tooltip
            sx={{ alignContent: 'right', justifyContent: 'right' }}
            title={
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontSize: '16px', textAlign: 'center' }}
                >
                  should add up to 100
                </Typography>
              </Box>
            }
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, offset],
                    },
                  },
                ],
              },
            }}
            arrow
            placement="top"
            open={tooltipVisible}
          >
            <div>{label}</div>
          </Tooltip>
        ) : (
          <div>{label}</div>
        )}
      </StyledTableCell>
    );
  };

  console.log('dfgchvjbkl', investmentOptionsData);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 1000,
          mt: 4,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '140px' }}>Asset Type</TableCell>
              <TableCell sx={{ width: '140px' }}>
                Expected Percentage (%)
              </TableCell>
              <TableCell sx={{ width: '140px' }}>Risk Grade</TableCell>

              {conditionallyRenderToolTipBasedCell(
                'Short Term (%)',
                'shortTerm',
                10,
                TermType.SHORT_TERM,
              )}
              {conditionallyRenderToolTipBasedCell(
                'Mid Term (%)',
                'midTerm',
                10,
                TermType.MEDIUM_TERM,
              )}
              {conditionallyRenderToolTipBasedCell(
                'Long Term (%)',
                'longTerm',
                10,
                TermType.LONG_TERM,
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {investmentOptionsData.map((row: any, index: any) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    value={row.assetType}
                    onChange={(e) => {
                      const updatedOptions = [...investmentOptionsData];
                      updatedOptions[index].assetType = e.target.value;
                      setInvestmentOptions(updatedOptions);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <CustomAmountField
                    value={row.expectedPercentage}
                    onChange={(e: any) => {
                      const updatedOptions = [...investmentOptionsData];
                      updatedOptions[index].expectedPercentage = e;
                      setInvestmentOptions(updatedOptions);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.riskType}
                    onChange={(e) => {
                      const updatedOptions = [...investmentOptionsData];
                      updatedOptions[index].riskType = e.target
                        .value as InvestmentOptionRiskType;
                      setInvestmentOptions(updatedOptions);
                    }}
                  />
                </TableCell>
                {areGoalsPresentOfType(TermType.SHORT_TERM) ? (
                  <StyledTableCell
                    style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.assets.shortTermGoals[
                          investmentOptions[index]?.id || ''
                        ]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForShortTerm(
                          investmentOptions[index]?.id,
                          value || '',
                        )
                      }
                    />
                  </StyledTableCell>
                ) : null}
                {areGoalsPresentOfType(TermType.MEDIUM_TERM) ? (
                  <StyledTableCell
                    style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.assets.midTermGoals[
                          investmentOptions[index]?.id || ''
                        ]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForMidTerm(
                          investmentOptions[index]?.id,
                          value,
                        )
                      }
                    />
                  </StyledTableCell>
                ) : null}
                {areGoalsPresentOfType(TermType.LONG_TERM) ? (
                  <StyledTableCell
                    style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.assets.longTermGoals[
                          investmentOptions[index]?.id || ''
                        ]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForLongTerm(
                          investmentOptions[index]?.id,
                          value,
                        )
                      }
                    />
                  </StyledTableCell>
                ) : null}
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>
                <Button variant="contained" onClick={handleAddRow}>
                  Add Row
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvestmentAllocationTable;
