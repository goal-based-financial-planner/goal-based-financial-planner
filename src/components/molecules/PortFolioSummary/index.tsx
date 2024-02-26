import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import usePlanningServiceData from '../usePlannerServiceData';

const AssetTable = () => {
  const data = usePlanningServiceData();
  const assetSums = data.reduce((acc, goal) => {
    goal.investment.forEach(({ assetType, amount }) => {
      acc[assetType] = (acc[assetType] || 0) + amount;
    });
    return acc;
  }, {} as { [key: string]: number });

  const assetSumArray = Object.entries(assetSums).map(
    ([assetType, totalValue]) => ({
      assetType,
      totalValue,
    }),
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset Type</TableCell>
            <TableCell>Amount </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assetSumArray.map((goal, index) => (
            <TableRow key={index}>
              <TableCell>{goal.assetType}</TableCell>
              <TableCell>{goal.totalValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssetTable;
