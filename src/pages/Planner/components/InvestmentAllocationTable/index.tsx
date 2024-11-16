import {
  Box,
  styled,
  TableCell,
  tableCellClasses,
  Tooltip,
  Typography,
} from '@mui/material';

import React, { Dispatch, ReactNode } from 'react';
import CustomAmountField from '../../../../components/CustomAmountField';
import {
  setLongTermInvestmentPercentage,
  setMidTermInvestmentPercentage,
  setShortTermInvestmentPercentage,
} from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { PlannerData } from '../../../../domain/PlannerData';
import { ToolTipVisibilityState } from '../../../../components/InvestmentAllocationStep';
import { TermType } from '../../../../types/enums';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { InvestmentOptionType } from '../../../../domain/InvestmentOptions';

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
  emptyBodyPlaceholder: ReactNode;
  tooltipVisibilityState: ToolTipVisibilityState;
}

const InvestmentAllocationTable: React.FC<InvestmentAllocationTableProps> = ({
  dispatch,
  plannerData,
  emptyBodyPlaceholder: addInvestmentOption,
  tooltipVisibilityState: termTooltipVisible,
}) => {
  const handleInputChangeForShortTerm = (
    investmentOptionId: string,
    value: any,
  ) => {
    setShortTermInvestmentPercentage(dispatch, {
      id: investmentOptionId,
      investmentPercentage: value,
    });
  };

  const handleInputChangeForMidTerm = (
    investmentOptionId: string,
    value: any,
  ) => {
    setMidTermInvestmentPercentage(dispatch, {
      id: investmentOptionId,
      investmentPercentage: value,
    });
  };
  const handleInputChangeForLongTerm = (
    investmentOptionId: string,
    value: any,
  ) => {
    setLongTermInvestmentPercentage(dispatch, {
      id: investmentOptionId,
      investmentPercentage: value,
    });
  };

  const areGoalsPresentOfType = (column: TermType) => {
    return plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);
  };

  const conditionallyRenderToolTipBasedCell = (
    label: string,
    termType: TermType,
    offset: number,
    column: TermType,
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

  const rows = plannerData.investmentOptions.map((option, index) => ({
    id: option.id,
    investmentName: option.investmentName,
    expectedReturnPercentage: option.expectedReturnPercentage,
    shortTerm: plannerData.investmentAllocations['Short Term'].find(
      (e) => e.id === option.id,
    )?.investmentPercentage,
    midTerm: plannerData.investmentAllocations['Medium Term'].find(
      (e) => e.id === option.id,
    )?.investmentPercentage,
    longTerm: plannerData.investmentAllocations['Long Term'].find(
      (e) => e.id === option.id,
    )?.investmentPercentage,
  }));

  const columns: GridColDef[] = [
    { field: 'investmentName', headerName: 'Investment Option', width: 140 },
    {
      field: 'expectedReturnPercentage',
      headerName: 'Expected Percentage (%)',
      width: 140,
    },
    {
      field: 'shortTerm',
      headerName: 'Short Term (%)',
      width: 140,
      renderCell: (params: GridRenderCellParams<InvestmentOptionType>) =>
        areGoalsPresentOfType(TermType.SHORT_TERM) ? (
          <CustomAmountField
            value={params.value}
            onChange={(value: number) =>
              handleInputChangeForShortTerm(params.row.id, value)
            }
          />
        ) : null,
    },
    {
      field: 'midTerm',
      headerName: 'Mid Term (%)',
      width: 140,
      renderCell: (params: GridRenderCellParams<InvestmentOptionType>) =>
        areGoalsPresentOfType(TermType.MEDIUM_TERM) ? (
          <CustomAmountField
            value={params.value}
            onChange={(value: number) =>
              handleInputChangeForMidTerm(params.row.id, value)
            }
          />
        ) : null,
    },

    {
      field: 'longTerm',
      headerName: 'Long Term (%)',
      width: 140,

      renderCell: (params: GridRenderCellParams<InvestmentOptionType>) =>
        areGoalsPresentOfType(TermType.LONG_TERM) ? (
          <CustomAmountField
            value={params.value}
            onChange={(value: number) =>
              handleInputChangeForLongTerm(params.row.id, value)
            }
          />
        ) : null,
    },
  ];

  return (
    <DataGrid
      columns={columns}
      rows={plannerData.investmentOptions}
      hideFooterPagination={true}
    />
    // <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    //   <TableContainer
    //     component={Paper}
    //     sx={{
    //       maxWidth: 1000,
    //       mt: 4,
    //     }}
    //   >
    //     <Table>
    //       <TableHead>
    //         <TableRow>
    //           <TableCell sx={{ width: '140px' }}>Investment Option</TableCell>
    //           <TableCell sx={{ width: '140px' }}>
    //             Expected Percentage (%)
    //           </TableCell>

    //           {conditionallyRenderToolTipBasedCell(
    //             'Short Term (%)',
    //             TermType.SHORT_TERM,
    //             10,
    //             TermType.SHORT_TERM,
    //           )}
    //           {conditionallyRenderToolTipBasedCell(
    //             'Mid Term (%)',
    //             TermType.MEDIUM_TERM,
    //             10,
    //             TermType.MEDIUM_TERM,
    //           )}
    //           {conditionallyRenderToolTipBasedCell(
    //             'Long Term (%)',
    //             TermType.LONG_TERM,
    //             10,
    //             TermType.LONG_TERM,
    //           )}
    //         </TableRow>
    //       </TableHead>
    //       <TableBody>
    //         {plannerData.investmentAllocationOptions.length > 0 ? (
    //           plannerData.investmentAllocationOptions.map((row, index) => (
    //             <TableRow key={index}>
    //               <TableCell>
    //                 {
    //                   plannerData.investmentAllocationOptions[index]
    //                     .investmentName
    //                 }
    //               </TableCell>
    //               <TableCell>
    //                 {
    //                   plannerData.investmentAllocationOptions[index]
    //                     .expectedReturnPercentage
    //                 }
    //               </TableCell>

    //               {/* <TableCell>{investmentOptions[index].riskType}</TableCell> */}

    //               {areGoalsPresentOfType(TermType.SHORT_TERM) && (
    //                 <StyledTableCell
    //                   style={{
    //                     background: 'rgba(0, 0, 0, 0.04)',
    //                   }}
    //                 >
    //                   <CustomAmountField
    //                     value={
    //                       plannerData.investmentAllocations[
    //                         'Short Term'
    //                       ].filter(
    //                         (e) =>
    //                           e.id ===
    //                           plannerData.investmentAllocationOptions[index].id,
    //                       )[0]?.investmentPercentage
    //                     }
    //                     onChange={(value: any) =>
    //                       handleInputChangeForShortTerm(
    //                         plannerData.investmentAllocationOptions[index].id,
    //                         value,
    //                       )
    //                     }
    //                   />
    //                 </StyledTableCell>
    //               )}
    //               {areGoalsPresentOfType(TermType.MEDIUM_TERM) && (
    //                 <StyledTableCell
    //                   style={{ background: 'rgba(0, 0, 0, 0.04)' }}
    //                 >
    //                   <CustomAmountField
    //                     value={
    //                       plannerData.investmentAllocations[
    //                         'Medium Term'
    //                       ].filter(
    //                         (e) =>
    //                           e.id ===
    //                           plannerData.investmentAllocationOptions[index].id,
    //                       )[0]?.investmentPercentage
    //                     }
    //                     onChange={(value: any) =>
    //                       handleInputChangeForMidTerm(
    //                         plannerData.investmentAllocationOptions[index].id,
    //                         value,
    //                       )
    //                     }
    //                   />
    //                 </StyledTableCell>
    //               )}
    //               {areGoalsPresentOfType(TermType.LONG_TERM) && (
    //                 <StyledTableCell
    //                   style={{ background: 'rgba(0, 0, 0, 0.04)' }}
    //                 >
    //                   <CustomAmountField
    //                     value={
    //                       plannerData.investmentAllocations['Long Term'].filter(
    //                         (e) =>
    //                           e.id ===
    //                           plannerData.investmentAllocationOptions[index].id,
    //                       )[0]?.investmentPercentage
    //                     }
    //                     onChange={(value: any) =>
    //                       handleInputChangeForLongTerm(
    //                         plannerData.investmentAllocationOptions[index].id,
    //                         value,
    //                       )
    //                     }
    //                   />
    //                 </StyledTableCell>
    //               )}
    //             </TableRow>
    //           ))
    //         ) : (
    //           <TableRow>
    //             <TableCell colSpan={7} style={{ textAlign: 'center' }}>
    //               {addInvestmentOption}
    //             </TableCell>
    //           </TableRow>
    //         )}
    //       </TableBody>
    //     </Table>
    //   </TableContainer>
    // </Box>
  );
};

export default InvestmentAllocationTable;
