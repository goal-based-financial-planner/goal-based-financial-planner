import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';

const CustomLegend = ({
  suggestions,
}: {
  suggestions: GoalWiseInvestmentSuggestions[];
}) => {
  const investmentOptionWiseSum = suggestions.reduce(
    (acc, goal) => {
      goal.investmentSuggestions.forEach(({ investmentName, amount }) => {
        acc[investmentName] = (acc[investmentName] || 0) + amount;
      });

      return acc;
    },
    {} as { [key: string]: number },
  );

  const palette = [
    'rgba(255, 165, 0, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(50, 205, 50, 0.8)',
    'rgba(255, 99, 132, 0.8)',
  ];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <TableContainer component={Box}>
      <Table size="small">
        <TableBody>
          {Object.entries(investmentOptionWiseSum).map(
            ([key, value], index) => {
              const color = palette[index % palette.length];
              return (
                <TableRow
                  key={key}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell sx={{ padding: '4px 8px' }}>
                    <Box
                      sx={{
                        width: isMobile ? 6 : 10,
                        height: isMobile ? 6 : 10,
                        backgroundColor: color,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '4px 8px' }}>{key}</TableCell>
                  <TableCell sx={{ padding: '4px 8px', textAlign: 'right' }}>
                    {Math.round(value).toLocaleString(navigator.language)}
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomLegend;
