import { Grid } from '@mui/material';
import CustomPieChart from '../../../atoms/CustomPieChart';
import CustomInputSlider from '../../../atoms/CustomInputSlider';
import CustomMenu from '../../../atoms/CustomMenu';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';
import {
  setLongTermInvestmentPercentage,
  setMidTermInvestmentPercentage,
  setShortTermInvestmentPercentage,
} from '../../../../store/plannerDataActions';
import { TermType } from '../../../../types/enums';

const investmentActions = {
  [TermType.SHORT_TERM]: setShortTermInvestmentPercentage,
  [TermType.MEDIUM_TERM]: setMidTermInvestmentPercentage,
  [TermType.LONG_TERM]: setLongTermInvestmentPercentage,
};

const InvestmentAllocation = ({
  dispatch,
  allocations,
  type,
}: {
  dispatch: any;
  allocations: InvestmentChoiceType[];
  type: keyof typeof investmentActions;
}) => {
  const setInvestmentPercentage = (
    selectedOption: string,
    updatedPercent: number,
  ) => {
    const setPercentage = investmentActions[type];
    setPercentage(dispatch, {
      id: selectedOption,
      investmentPercentage: updatedPercent,
    });
  };

  const handleMenuChange = (selectedOption: string) => {
    setInvestmentPercentage(selectedOption, 30);
  };

  const handleInputChange = (
    updatedPercent: number,
    selectedOption: string,
  ) => {
    setInvestmentPercentage(selectedOption, updatedPercent);
  };

  const handleSliderChange = (
    updatedPercent: number | number[],
    selectedOption: string,
  ) => {
    setInvestmentPercentage(selectedOption, Number(updatedPercent));
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <CustomPieChart allocations={allocations} type={type} />
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
          allocations={allocations}
          handleMenuChange={handleMenuChange}
        />
      </Grid>
      <Grid xs={12} sx={{ paddingX: 10, paddingY: 3 }}>
        {allocations.map((option) => (
          <CustomInputSlider
            key={option.id}
            selectedOption={option.id}
            percent={option.investmentPercentage}
            handleInputChange={handleInputChange}
            handleSliderChange={handleSliderChange}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default InvestmentAllocation;
