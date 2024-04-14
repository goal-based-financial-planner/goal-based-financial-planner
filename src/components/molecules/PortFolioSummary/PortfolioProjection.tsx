import React from 'react';
import { LineChart } from '@mui/x-charts';
import { Box } from '@mui/material';
import { GoalWiseReturn } from '../../../hooks/useInvestmentCalculator';

type PortfolioProjectionProps = {
  goalWiseReturns: GoalWiseReturn[];
};

const PortfolioProjection: React.FC<PortfolioProjectionProps> = ({
                                                                   goalWiseReturns,
                                                                 }) => {
  const { minYear, maxYear } = goalWiseReturns.reduce(
    (acc, goalWiseReturn) => {
      const minYear = Math.min(
        acc.minYear,
        ...goalWiseReturn.returnsPerInvestment
          .map((r) => r.returnsByYear.map((ry) => ry.year))
          .flat(),
      );
      const maxYear = Math.max(
        acc.maxYear,
        ...goalWiseReturn.returnsPerInvestment
          .map((r) => r.returnsByYear.map((ry) => ry.year))
          .flat(),
      );
      return { minYear, maxYear };
    },
    { minYear: Infinity, maxYear: 0 },
  );


  const generateXAxis = () => {
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => i + minYear);
  };

  const generateYAxis = () => {
    return goalWiseReturns.map((goalWiseReturn) => {
      const data = [];

      for (let i = minYear; i <= maxYear; i++) {
        const totalReturn = goalWiseReturn.returnsPerInvestment.reduce((acc, investment) => {
          const returnByYear = investment.returnsByYear.find((ry) => ry.year === i);
          return acc + (returnByYear?.return || 0);
        }, 0);
        data.push(totalReturn > 0 ? totalReturn : null);
      }

      return { label: goalWiseReturn.goalName, data };
    });
  };

  return (
    <Box height={'100%'} width={'100%'}>
      <LineChart
        xAxis={[{ data: generateXAxis() }]}
        series={generateYAxis()}
      />
    </Box>
  );
};

export default PortfolioProjection;
