import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GoalWiseInvestmentSuggestions } from '../../pages/Planner/hooks/useInvestmentCalculator';

ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

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

  const totalAmount = Object.values(investmentOptionWiseSum).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const data = {
    labels: Object.keys(investmentOptionWiseSum),
    datasets: [
      {
        data: Object.values(investmentOptionWiseSum).map((a) => Math.round(a)),
        backgroundColor: [
          'rgba(255, 165, 0, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(50, 205, 50, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        hoverBackgroundColor: [
          'rgba(255, 165, 0, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(50, 205, 50, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: '75%',
    layout: {
      padding: 50,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        clip: false,
        color: '#000',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        formatter: (value: any, context: any) => {
          const total = context.dataset.data.reduce(
            (acc: number, curr: number) => acc + curr,
            0,
          );
          const percent = ((value / total) * 100).toFixed(0);
          return `${percent}%`;
        },
        align: 'end' as const,
        anchor: 'end' as const,
      },
    },
  };

  return (
    <Box sx={{ width: 250, position: 'relative' }}>
      <Doughnut data={data} options={options} />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" fontWeight="bold">
          Total
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {totalAmount.toLocaleString(navigator.language, {
            maximumFractionDigits: 0,
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default DoughnutChart;
