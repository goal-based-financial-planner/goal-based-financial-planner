import { PieChart } from '@mui/x-charts';
import { InvestmentChoiceType } from '../../../domain/InvestmentOptions';

const CustomPieChart = ({
  allocations,
  type,
}: {
  allocations: InvestmentChoiceType[];
  type: string;
}) => {
  const values = allocations.map((a) => {
    return {
      id: a.id,
      value: a.investmentPercentage,
      label: a.id,
    };
  });

  return (
    <PieChart
      series={[
        {
          data: values,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
        },
      ]}
      width={400}
      height={200}
    />
  );
};

export default CustomPieChart;
