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

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value}%`,
              arcLabelMinAngle: 15,
              arcLabelRadius: '60%',
              data: [...values],
            },
          ]}
          width={400}
          height={300}
          slotProps={{
            legend: {
              position: { horizontal: 'middle', vertical: 'top' },
              // labelFormatter: (params) => {
              //   const { id, value, color } = params; // Access each slice's properties
              //   return (
              //     <span style={{ display: 'flex', alignItems: 'center' }}>
              //       {/* Color Box */}
              //       <span
              //         style={{
              //           width: 16,
              //           height: 16,
              //           backgroundColor: color, // Assign the slice color to the box
              //           marginRight: 8,
              //         }}
              //       />
              //       {/* Label and Value */}
              //       {id}: {value}%
              //     </span>
              //   );
              // },
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default InvestmentPieChart;
