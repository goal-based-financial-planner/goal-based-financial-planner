import {
  Box,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import React, { Dispatch } from "react";
import CustomAmountField from "../CustomAmountField";
import {
  setLongTermAssetPercentage,
  setMidTermAssetPercentage,
  setShortTermAssetPercentage,
} from "../../../../store/plannerDataActions";
import { PlannerDataAction } from "../../../../store/plannerDataReducer";
import { PlannerData } from "../../../../domain/PlannerData";
import { InvestmentOptionType } from "../../../../domain/InvestmentOptions";
import { ToolTipVisibilityState } from "../../../compounds/InvestmentAllocationStep";
import { TermType } from "../../../../types/enums";

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
    setShortTermAssetPercentage(dispatch, {
      id: assetId,
      investmentPercentage: value,
    });
  };

  const handleInputChangeForMidTerm = (assetId: string, value: any) => {
    setMidTermAssetPercentage(dispatch, {
      id: assetId,
      investmentPercentage: value,
    });
  };
  const handleInputChangeForLongTerm = (assetId: string, value: any) => {
    setLongTermAssetPercentage(dispatch, {
      id: assetId,
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
      <StyledTableCell sx={{ width: "70px" }}>
        {tooltipVisible ? (
          <Tooltip
            sx={{ alignContent: "right", justifyContent: "right" }}
            title={
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "16px", textAlign: "center" }}
                >
                  should add up to 100
                </Typography>
              </Box>
            }
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
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
    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              <TableCell sx={{ width: "140px" }}>Asset Type</TableCell>
              <TableCell sx={{ width: "140px" }}>
                Expected Percentage (%)
              </TableCell>
              <TableCell sx={{ width: "140px" }}>Risk Grade</TableCell>

              {conditionallyRenderToolTipBasedCell(
                "Short Term (%)",
                TermType.SHORT_TERM,
                10,
                TermType.SHORT_TERM,
              )}
              {conditionallyRenderToolTipBasedCell(
                "Mid Term (%)",
                TermType.MEDIUM_TERM,
                10,
                TermType.MEDIUM_TERM,
              )}
              {conditionallyRenderToolTipBasedCell(
                "Long Term (%)",
                TermType.LONG_TERM,
                10,
                TermType.LONG_TERM,
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {investmentOptions.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{investmentOptions[index].investmentName}</TableCell>
                <TableCell>
                  {investmentOptions[index].expectedReturnPercentage}
                </TableCell>

                <TableCell>{investmentOptions[index].riskType}</TableCell>

                {areGoalsPresentOfType(TermType.SHORT_TERM) && (
                  <StyledTableCell
                    style={{
                      background: "rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.investmentAllocations["Short Term"].filter(
                          (e) => e.id === investmentOptions[index].id,
                        )[0]?.investmentPercentage
                      }
                      onChange={(value: any) =>
                        handleInputChangeForShortTerm(
                          investmentOptions[index].id,
                          value,
                        )
                      }
                    />
                  </StyledTableCell>
                )}
                {areGoalsPresentOfType(TermType.MEDIUM_TERM) && (
                  <StyledTableCell
                    style={{ background: "rgba(0, 0, 0, 0.04)" }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.investmentAllocations["Medium Term"].filter(
                          (e) => e.id === investmentOptions[index].id,
                        )[0]?.investmentPercentage
                      }
                      onChange={(value: any) =>
                        handleInputChangeForMidTerm(
                          investmentOptions[index].id,
                          value,
                        )
                      }
                    />
                  </StyledTableCell>
                )}
                {areGoalsPresentOfType(TermType.LONG_TERM) && (
                  <StyledTableCell
                    style={{ background: "rgba(0, 0, 0, 0.04)" }}
                  >
                    <CustomAmountField
                      value={
                        plannerData.investmentAllocations["Long Term"].filter(
                          (e) => e.id === investmentOptions[index].id,
                        )[0]?.investmentPercentage
                      }
                      onChange={(value: any) =>
                        handleInputChangeForLongTerm(
                          investmentOptions[index].id,
                          value,
                        )
                      }
                    />
                  </StyledTableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvestmentAllocationTable;
