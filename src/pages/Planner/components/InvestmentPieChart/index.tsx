import { PieChart } from '@mui/x-charts';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';
import { ChartDataPoint } from '../../../../types/charts';
import { memo, useMemo } from 'react';

const InvestmentPieChart = memo(
  ({ allocations }: { allocations: InvestmentChoiceType[] }) => {
    const chartData = useMemo(
      () =>
        allocations
          .map((allocation) => ({
            label: allocation.investmentName,
            value: Number(allocation.investmentPercentage),
          }))
          .reduce((acc: ChartDataPoint[], curr) => {
            const existing = acc.find((item) => item.label === curr.label);
            if (existing) {
              existing.value = Number(existing.value) + Number(curr.value);
            } else {
              acc.push(curr);
            }
            return acc;
          }, []),
      [allocations],
    );

    const pieParams = useMemo(
      () => ({
        height: 250,
        margin: { right: 5 },
        slotProps: { legend: { hidden: true } },
      }),
      [],
    );

    const palette = [
      'rgba(255, 165, 0, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(50, 205, 50, 0.8)',
      'rgba(255, 99, 132, 0.8)',
    ];

    return (
      <PieChart
        colors={palette}
        series={[
          {
            arcLabel: (item) => `${item.value}%`,
            arcLabelMinAngle: 35,
            arcLabelRadius: '100%',
            data: chartData,
            outerRadius: 100,
          },
        ]}
        {...pieParams}
      />
    );
  }
);

InvestmentPieChart.displayName = 'InvestmentPieChart';

export default InvestmentPieChart;
