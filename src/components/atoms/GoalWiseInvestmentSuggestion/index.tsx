import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export type InvestmentPerOptionType = {
  goalName: string;
  amount: number;
};
type GoalWiseInvestmentSuggestionProps = {
  investmentPerOption: InvestmentPerOptionType[];
};
const GoalWiseInvestmentSuggestion = ({
  investmentPerOption,
}: GoalWiseInvestmentSuggestionProps) => {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ fontSize: '16px', textAlign: 'center' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                
                  <TableCell>Goal name</TableCell>
                  <TableCell>Amount</TableCell>
              
              </TableRow>
            </TableHead>
            <TableBody>
              {investmentPerOption.map((a: InvestmentPerOptionType) => (
                <TableRow>
                  <TableCell>{a.goalName}</TableCell>
                  <TableCell>
                    {a.amount.toLocaleString(navigator.language)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Typography>
    </Box>
  );
};

export default GoalWiseInvestmentSuggestion;
