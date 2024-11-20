import { Grid2 as Grid } from '@mui/material';
import InvestmentPieChart from '../InvestmentPieChart';
import CustomInput from '../../../../components/CustomInput';
import CustomMenu from '../../../../components/CustomMenu';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';
import { DEFAULT_INVESTMENT_OPTIONS } from '../../../../domain/constants';

const InvestmentAllocationPerTerm = ({
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
      <Grid size={6} sx={{ py: 3 }}>
        <Grid container>
          <Grid container size={12} rowGap={2}>
            {allocations.map((option) => (
              <CustomInput
                key={option.id}
                label={
                  DEFAULT_INVESTMENT_OPTIONS.filter(
                    (a) => a.id === option.id,
                  )[0].investmentName
                }
                percent={option.investmentPercentage}
                onChange={(value) => handleInputChange(value, option.id)}
              />
            ))}
          </Grid>
          <Grid
            size={12}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 4,
              alignItems: 'center',
            }}
          >
            <CustomMenu
              options={filteredOptions}
              handleMenuChange={handleMenuChange}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={6}>
        <InvestmentPieChart allocations={allocations} />
      </Grid>
    </Grid>
  );
};

export default InvestmentAllocationPerTerm;
