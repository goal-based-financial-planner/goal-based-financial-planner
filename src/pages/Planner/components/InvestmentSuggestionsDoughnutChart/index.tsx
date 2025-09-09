import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { PieChart } from '@mui/x-charts';
import { useMemo } from 'react';

const InvestmentSuggestionsDoughnutChart = ({
  suggestions,
}: {
  suggestions: GoalWiseInvestmentSuggestions[];
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const investmentOptionWiseSum = suggestions.reduce(
    (acc, goal) => {
      goal.investmentSuggestions.forEach(({ investmentName, amount }) => {
        acc[investmentName] = (acc[investmentName] || 0) + amount;
      });

      return acc;
    },
    {} as { [key: string]: number },
  );

  const seriesData = Object.entries(investmentOptionWiseSum).map((entry) => {
    return { label: entry[0], value: Math.round(entry[1]) };
  });

  const totalAmount = Object.values(investmentOptionWiseSum).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const fontSize = useMemo(() => {
    const valueLength = totalAmount.toFixed().length;
    if (valueLength <= 8) return '1rem';
    return '0.9rem';
  }, [totalAmount]);

  const palette = [
    'rgba(255, 165, 0, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(50, 205, 50, 0.8)',
    'rgba(255, 99, 132, 0.8)',
  ];
  const pieParams = {
    height: 250,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  return (
    <Box
      sx={{
        width: 300,
        position: 'relative',
        mr: 2,
      }}
    >
      <PieChart
        colors={palette}
        series={[
          {
            data: seriesData,
            paddingAngle: 3,
            outerRadius: isMobile ? 60 : 100,
            innerRadius: isMobile ? 40 : 80,
            cornerRadius: 4,
          },
        ]}
        {...pieParams}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontSize, fontWeight: 'bold' }}>
          {totalAmount.toLocaleString(navigator.language, {
            maximumFractionDigits: 0,
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default InvestmentSuggestionsDoughnutChart;
