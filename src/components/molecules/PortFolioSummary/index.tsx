import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { InvestmentBreakdown } from '../../../hooks/useCalculateInvestment';

type AssetTableProps = {
  investmentBreakdown: InvestmentBreakdown[];
}
const AssetTable: React.FC<AssetTableProps> = ({ investmentBreakdown }) => {

  const assetSums = investmentBreakdown.reduce((acc, goal) => {
    goal.assetBreakdown.forEach(({ assetId, amount }) => {
      acc[assetId] = (acc[assetId] || 0) + amount;
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
