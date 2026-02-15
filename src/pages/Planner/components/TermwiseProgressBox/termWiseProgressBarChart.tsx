import { BarChart } from '@mui/x-charts/BarChart';
import { AxisConfig, ChartsXAxisProps } from '@mui/x-charts';
import { Typography } from '@mui/material';
import { TermTypeWiseProgressData } from '../../../../types/planner';
import { memo, useMemo } from 'react';

type TermWiseProgressBoxProps = {
  data: TermTypeWiseProgressData[];
};

const TermWiseProgressBarChart = memo(({ data }: TermWiseProgressBoxProps) => {
  const chartData = useMemo(
    () =>
      data.map(({ termType, termTypeWiseData }) => ({
        termType,
        progressPercent: termTypeWiseData.progressPercent,
      })),
    [data],
  );

  return (
    <>
      <Typography variant="h6" fontWeight="bold" mt={5}>
        Financial Progress
      </Typography>
      <BarChart
        xAxis={[
          {
            scaleType: 'band',
            data: chartData.map((item) => item.termType),
            categoryGapRatio: 0.5,
          } as AxisConfig<'band', any, ChartsXAxisProps>,
        ]}
        yAxis={[
          {
            max: 100,
          },
        ]}
        series={[
          {
            data: chartData.map((item) => item.progressPercent),
            stack: 'A',
            color: 'green',
          },
          {
            data: chartData.map(() => 100),
            stack: 'A',
            color: 'lightgrey',
          },
        ]}
        barLabel={(item) =>
          (item.value as number) > 15 && (item.value as number) < 100
            ? `${item.value}%`
            : null
        }
        height={250}
      />
    </>
  );
});

TermWiseProgressBarChart.displayName = 'TermWiseProgressBarChart';

// Re-export types for backward compatibility
export type { TermTypeWiseProgressData };

export default TermWiseProgressBarChart;
