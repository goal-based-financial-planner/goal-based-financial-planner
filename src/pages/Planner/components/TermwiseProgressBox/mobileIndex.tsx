import { Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { StyledBox } from '../../../../components/StyledBox';

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

const TermWiseProgressMobileBox = ({ data }: TermWiseProgressBoxProps) => {
  const chartData = data.map(({ termType, termTypeWiseData }) => ({
    termType,
    progressPercent: termTypeWiseData.progressPercent,
  }));

  return (
    <StyledBox
      sx={{
        mx: 2,
        my: 2,
        height: '150px',
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Financial Progress
      </Typography>
      <BarChart
        xAxis={[
          {
            scaleType: 'band',
            data: chartData.map((item) => item.termType),
          },
        ]}
        yAxis={[
          {
            tickInterval: [0, 50, 100],
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
      />

      <BarChart
        series={[
          { data: [3, 4, 1, 6, 5], stack: 'A', label: 'Series A1' },
          { data: [4, 3, 1, 5, 8], stack: 'A', label: 'Series A2' },
          { data: [4, 2, 5, 4, 1], stack: 'B', label: 'Series B1' },
          { data: [2, 8, 1, 3, 1], stack: 'B', label: 'Series B2' },
          { data: [10, 6, 5, 8, 9], label: 'Series C1' },
        ]}
        width={600}
        height={350}
      />
    </StyledBox>
  );
};

export default TermWiseProgressMobileBox;
