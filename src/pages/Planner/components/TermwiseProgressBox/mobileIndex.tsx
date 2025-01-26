import { Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { StyledBox } from '../../../../components/StyledBox';
import { AxisConfig, ChartsXAxisProps } from '@mui/x-charts';

export type TermTypeWiseProgressData = {
  termType: string;
  termTypeWiseData: TermTypeWiseData;
};

type TermWiseProgressBoxProps = {
  data: TermTypeWiseProgressData[];
  showSuggestions: boolean;
};

type TermTypeWiseData = {
  progressPercent: number;
  termTypeSum: number;
  goalNames: string[];
};

const TermWiseProgressMobileBox = ({
  data,
  showSuggestions: height,
}: TermWiseProgressBoxProps) => {
  const chartData = data.map(({ termType, termTypeWiseData }) => ({
    termType,
    progressPercent: termTypeWiseData.progressPercent,
  }));

  return (
    <StyledBox
      sx={{
        mx: 2,
        my: 2,
        height: height ? '150px' : '350px',
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
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
        height={300}
        width={350}
      />
    </StyledBox>
  );
};

export default TermWiseProgressMobileBox;
