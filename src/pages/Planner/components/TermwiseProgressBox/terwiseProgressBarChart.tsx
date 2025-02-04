import { BarChart } from '@mui/x-charts/BarChart';
import { AxisConfig, ChartsXAxisProps } from '@mui/x-charts';
import { Typography } from '@mui/material';

export type TermTypeWiseProgressData = {
  termType: string;
  termTypeWiseData: TermTypeWiseData;
};

type TermWiseProgressBoxProps = {
  data: TermTypeWiseProgressData[];
};

type TermTypeWiseData = {
  progressPercent: number;
  termTypeSum: number;
  goalNames: string[];
};

const TermWiseProgressBarChart = ({ data }: TermWiseProgressBoxProps) => {
  const chartData = data.map(({ termType, termTypeWiseData }) => ({
    termType,
    progressPercent: termTypeWiseData.progressPercent,
  }));

  return (
    <>
      <Typography variant="h6" fontWeight="bold" mt={3}>
        Financial Progress
      </Typography>
      <BarChart
        xAxis={[
          {
            scaleType: 'band',
            data: chartData.map((item) => {
              if (item.termType === 'Short Term') return 'ST';
              if (item.termType === 'Medium Term') return 'MT';
              if (item.termType === 'Long Term') return 'LT';
              return '';
            }),
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
};

export default TermWiseProgressBarChart;
