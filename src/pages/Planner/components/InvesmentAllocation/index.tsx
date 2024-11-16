import { Grid } from '@mui/material';
import InvestmentPieChart from '../InvestmentPieChart';
import CustomInputSlider from '../../../../components/CustomInputSlider';
import CustomMenu from '../../../../components/CustomMenu';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';
import { DEFAULT_INVESTMENT_OPTIONS } from '../../../../domain/constants';
import CustomPaper from '../../../../components/CustomPaper';

const InvestmentAllocation = ({
  allocations,
  handlePercentageChange,
}: {
  allocations: InvestmentChoiceType[];
  handlePercentageChange: any;
}) => {
  const handleMenuChange = (selectedOption: string) => {
    handlePercentageChange(selectedOption, 30);
  };

  const handleInputChange = (
    updatedPercent: number,
    selectedOption: string,
  ) => {
    handlePercentageChange(selectedOption, updatedPercent);
  };

  const filteredOptions = DEFAULT_INVESTMENT_OPTIONS.filter(
    (opt) => !allocations.map((a) => a.id).includes(opt.id),
  ).map((a) => {
    return {
      label: a.investmentName,
      value: a.id,
    };
  });

  return (
    <Grid container>
      <Grid xs={12}>
        <InvestmentPieChart allocations={allocations} />
      </Grid>
      <Grid
        xs={12}
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: 10,
          paddingTop: 3,
        }}
      >
        <CustomMenu
          options={filteredOptions}
          handleMenuChange={handleMenuChange}
        />
      </Grid>
      <Grid xs={12} sx={{ paddingY: 3 }}>
        {allocations.map((option) => (
          <CustomInputSlider
            key={option.id}
            label={
              DEFAULT_INVESTMENT_OPTIONS.filter((a) => a.id === option.id)[0]
                .investmentName
            }
            percent={option.investmentPercentage}
            onChange={(value) => handleInputChange(value, option.id)}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default InvestmentAllocation;
