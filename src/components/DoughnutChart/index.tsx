import { Box, Typography } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../pages/Planner/hooks/useInvestmentCalculator';
import { formatNumber } from '../../types/util';
import { PieChart } from '@mui/x-charts';

const DoughnutChart = ({
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

  const seriesData = Object.entries(investmentOptionWiseSum).map((entry) => {
    return { label: entry[0], value: Math.round(entry[1]) };
  });

  const totalAmount = Object.values(investmentOptionWiseSum).reduce(
    (sum, amount) => sum + amount,
    0,
  );

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
    <Box sx={{ width: 300, position: 'relative' }}>
      <PieChart
        colors={palette}
        series={[
          {
            data: seriesData,
            paddingAngle: 3,
            outerRadius: 100,
            innerRadius: 80,
            cornerRadius: 70,
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
        <Typography variant="h6" fontWeight="bold">
          {formatNumber(totalAmount)}
        </Typography>
      </Box>
    </Box>
  );
};

export default DoughnutChart;
