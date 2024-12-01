import { PieChart } from '@mui/x-charts';
import { Grid2 as Grid } from '@mui/material';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';

const InvestmentPieChart = ({
  allocations,
}: {
  allocations: InvestmentChoiceType[];
}) => {
  const values = allocations.map((a) => ({
    value: a.investmentPercentage,
    label: a.investmentName,
  }));

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
              data: values,
            },
          ]}
          {...pieParams}
        />
      </Grid>
    </Grid>
  );
};

export default InvestmentPieChart;
