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
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
} from '@mui/material';
import useInvestmentOptions from '../../../../hooks/useInvestmentAssetOptions';
import React, { Dispatch, useState } from 'react';
import CustomAmountField from '../CustomAmountField';
import {
  setLongTermAssetPercentage,
  setMidTermAssetPercentage,
  setShortTermAssetPercentage,
} from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { PlannerData } from '../../../../domain/PlannerData';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

interface InvestmentAllocationProps {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
  onAssetsPlannerContinue: any;
}
interface Terms {
  shortTerm?: boolean;
  midTerm?: boolean;
  longTerm?: boolean;
}
const InvestmentAllocationTable: React.FC<InvestmentAllocationProps> = ({
  dispatch,
  plannerData,
  onAssetsPlannerContinue,
}) => {
  const tableData = useInvestmentOptions();

  const [termTooltipVisible, setTermTooltipVisible] = useState<Terms>({
    shortTerm: false,
    midTerm: false,
    longTerm: false,
  });
  const handleInputChangeForShortTerm = (assetId: string, value: any) => {
    setShortTermAssetPercentage(dispatch, assetId, value);
  };

  const handleInputChangeForMidTerm = (assetId: string, value: any) => {
    setMidTermAssetPercentage(dispatch, assetId, value);
  };
  const handleInputChangeForLongTerm = (assetId: string, value: any) => {
    setLongTermAssetPercentage(dispatch, assetId, value);
  };

  const isTooltipVisible = (termType: keyof PlannerData['assets']) => {
    const termSum = tableData.reduce(
      (sum, row) => sum + Number(plannerData.assets[termType][row.id] || 0),
      0,
    );

    return termSum !== 100;
  };

  const isTermGoalGreaterZero = (columnNameToHide: string) => {
    return plannerData
      .getFinancialGoalSummary()
      .some(
        (item) => item.termType === columnNameToHide && item.numberOfGoals > 0,
      );
  };

  console.log('fhgjk;', isTermGoalGreaterZero('longTerm'));
  const renderTooltipCell = (
    label: string,
    termType: 'shortTerm' | 'midTerm' | 'longTerm',
    offset: number,
    columnNameToHide: string,
  ) => {
    const tooltipVisible = termTooltipVisible[termType];
    const hideColumn = isTermGoalGreaterZero(columnNameToHide);

    return !hideColumn ? null : (
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

  const handleClick = () => {
    const shortTermTooltipVisible = isTooltipVisible('shortTermGoals');
    const midTermTooltipVisible = isTooltipVisible('midTermGoals');
    const longTermTooltipVisible = isTooltipVisible('longTermGoals');

    if (shortTermTooltipVisible) {
      return setTermTooltipVisible({
        shortTerm: shortTermTooltipVisible,
      });
    }
    if (midTermTooltipVisible) {
      return setTermTooltipVisible({
        midTerm: midTermTooltipVisible,
      });
    }

    if (longTermTooltipVisible) {
      return setTermTooltipVisible({
        longTerm: longTermTooltipVisible,
      });
    }

    if (
      !shortTermTooltipVisible &&
      !midTermTooltipVisible &&
      !longTermTooltipVisible
    ) {
      onAssetsPlannerContinue();
      return setTermTooltipVisible({
        shortTerm: false,
        midTerm: false,
        longTerm: false,
      });
    }
  };
  return (
    <>
      <Box>
        Now that you have added your financial goals, let's add the assets that
        you are interested to invest in.
      </Box>

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

                {renderTooltipCell(
                  'Short Term (%)',
                  'shortTerm',
                  10,
                  'Short Term',
                )}
                {renderTooltipCell('Mid Term (%)', 'midTerm', 10, 'Mid Term')}
                {renderTooltipCell(
                  'Long Term (%)',
                  'longTerm',
                  10,
                  'Long Term',
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={`index`}>
                  <TableCell>{tableData[index].assetType}</TableCell>
                  <TableCell>{tableData[index].expectedPercentage}</TableCell>

                  <TableCell>{tableData[index].riskType}</TableCell>

                  {isTermGoalGreaterZero('Short Term') ? (
                    <StyledTableCell
                      style={{
                        background: 'rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <CustomAmountField
                        value={
                          plannerData.assets.shortTermGoals[tableData[index].id]
                        }
                        onChange={(value: any) =>
                          handleInputChangeForShortTerm(
                            tableData[index].id,
                            value,
                          )
                        }
                      />
                    </StyledTableCell>
                  ) : null}
                  {isTermGoalGreaterZero('Mid Term') ? (
                    <StyledTableCell
                      style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                    >
                      <CustomAmountField
                        value={
                          plannerData.assets.midTermGoals[tableData[index].id]
                        }
                        onChange={(value: any) =>
                          handleInputChangeForMidTerm(
                            tableData[index].id,
                            value,
                          )
                        }
                      />
                    </StyledTableCell>
                  ) : null}
                  {isTermGoalGreaterZero('Long Term') ? (
                    <StyledTableCell
                      style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                    >
                      <CustomAmountField
                        value={
                          plannerData.assets.longTermGoals[tableData[index].id]
                        }
                        onChange={(value: any) =>
                          handleInputChangeForLongTerm(
                            tableData[index].id,
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

      <Box textAlign="right">
        <Button
          sx={{ mt: 3, fontSize: '1.2rem' }}
          onClick={handleClick}
          variant="contained"
          color="primary"
        >
          Continue
        </Button>
      </Box>
    </>
  );
};

export default InvestmentAllocationTable;
