import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { TermType } from '../../../../types/enums';

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
}

const InvestmentAllocationTable: React.FC<InvestmentAllocationTableProps> = ({
  dispatch,
  plannerData,
  investmentOptions,
  tooltipVisibilityState: termTooltipVisible,
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
            {investmentOptions.map((row, index) => (
              <TableRow key={`index`}>
                <TableCell>{investmentOptions[index].assetType}</TableCell>
                <TableCell>
                  {investmentOptions[index].expectedPercentage}
                </TableCell>

                <TableCell>{investmentOptions[index].riskType}</TableCell>

                {areGoalsPresentOfType(TermType.SHORT_TERM) ? (
                  <StyledTableCell
                    style={{
                      background: 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.assets.shortTermGoals[
                          investmentOptions[index].id
                        ]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForShortTerm(
                          investmentOptions[index].id,
                          value,
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
                          investmentOptions[index].id
                        ]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForMidTerm(
                          investmentOptions[index].id,
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
                          investmentOptions[index].id
                        ]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForLongTerm(
                          investmentOptions[index].id,
                          value,
                        )
                      }
                    />
                  </StyledTableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvestmentAllocationTable;
