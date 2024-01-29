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
  styled,
  tableCellClasses,
} from '@mui/material';
import useTableData from './useTableData';
import React, { Dispatch } from 'react';
import NumberInput from './CustomAmountField';
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

interface AssetsTypeTableProps {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
}
const AssetsTypeTable: React.FC<AssetsTypeTableProps> = ({
  dispatch,
  plannerData,
}) => {
  const tableData = useTableData();

  const handleInputChangeForShortTerm = (assetId: string, value: any) => {
    setShortTermAssetPercentage(dispatch, assetId, value);
  };

  const handleInputChangeForMidTerm = (assetId: string, value: any) => {
    setMidTermAssetPercentage(dispatch, assetId, value);
  };
  const handleInputChangeForLongTerm = (assetId: string, value: any) => {
    setLongTermAssetPercentage(dispatch, assetId, value);
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
            maxWidth: 1500,
            mt: 4,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '100px' }}>Asset Type</TableCell>
                <TableCell sx={{ width: '100px' }}>
                  Expected Percentage (%)
                </TableCell>
                <TableCell sx={{ width: '100px' }}>Risk Grade</TableCell>
                <StyledTableCell sx={{ width: '100px' }}>
                  Short term (%)
                </StyledTableCell>
                <StyledTableCell sx={{ width: '100px' }}>
                  Mid term (%)
                </StyledTableCell>
                <StyledTableCell sx={{ width: '100px' }}>
                  Long term (%)
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={`index`}>
                  <TableCell>{tableData[index].assetType}</TableCell>
                  <TableCell>{tableData[index].expectedPercentage}</TableCell>

                  <TableCell>{tableData[index].riskGrade}</TableCell>

                  <StyledTableCell
                    style={{
                      background: 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <NumberInput
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
                  <StyledTableCell
                    style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                  >
                    <NumberInput
                      value={
                        plannerData.assets.midTermGoals[tableData[index].id]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForMidTerm(tableData[index].id, value)
                      }
                    />
                  </StyledTableCell>
                  <StyledTableCell
                    style={{ background: 'rgba(0, 0, 0, 0.04)' }}
                  >
                    <NumberInput
                      value={
                        plannerData.assets.longTermGoals[tableData[index].id]
                      }
                      onChange={(value: any) =>
                        handleInputChangeForLongTerm(tableData[index].id, value)
                      }
                    />
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box textAlign="right">
        <Button
          sx={{ mt: 3, fontSize: '1.2rem' }}
          onClick={() => {}}
          variant="contained"
          color="primary"
        >
          Continue
        </Button>
      </Box>
    </>
  );
};

export default AssetsTypeTable;
