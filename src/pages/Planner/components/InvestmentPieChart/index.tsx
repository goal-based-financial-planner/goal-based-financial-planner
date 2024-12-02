import { PieChart } from '@mui/x-charts';
import { Grid2 as Grid } from '@mui/material';

interface SeriesType {
  value: number;
  label: string;
}
const InvestmentPieChart = ({ allocations }: { allocations: SeriesType[] }) => {
  const palette = [
    '#CDB3A1',
    '#AFAEA0',
    '#636667',
    '#F3EDD8',
    '#F6B7AA',
    '#6D7B7B',
    '#B4C1B0',
    '#BDBEAB',
  ];

  const pieParams = {
    height: 200,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid size={12}>
        <PieChart
          colors={palette}
          series={[
            {
              data: allocations,
            },
          ]}
          {...pieParams}
        />
      </Grid>
    </Grid>
  );
};

export default InvestmentPieChart;
