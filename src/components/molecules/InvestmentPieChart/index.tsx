import { PieChart } from '@mui/x-charts';
import { Grid } from '@mui/material';
import { InvestmentChoiceType } from '../../../domain/InvestmentOptions';

const InvestmentPieChart = ({
  allocations,
}: {
  allocations: InvestmentChoiceType[];
}) => {
  const values = allocations.map((a) => ({
    id: a.id,
    value: a.investmentPercentage,
    label: a.id,
  }));

  const pieParams = {
    height: 200,
    margin: { right: 5 },
    slotProps: { legend: { hidden: true } },
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <PieChart
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
