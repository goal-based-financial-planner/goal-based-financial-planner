import { Grid } from '@mui/material';
import CustomPieChart from '../../../atoms/CustomPieChart';
import CustomInputSlider from '../../../atoms/CustomInputSlider';
import CustomMenu from '../../../atoms/CustomMenu';
import { useState } from 'react';

const InvestmentAllocation = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSetSelectedOption = (newOption: string) => {
    setSelectedOptions((prevOptions) => {
      if (!prevOptions.includes(newOption)) {
        return [...prevOptions, newOption];
      }
      return prevOptions;
    });
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <CustomPieChart />
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
          setSelectedOption={handleSetSelectedOption}
          selectedOptions={selectedOptions}
        />
      </Grid>
      <Grid xs={12} sx={{ paddingX: 10, paddingY: 3 }}>
        {selectedOptions.map((option, index) => (
          <CustomInputSlider key={index} selectedOption={option} />
        ))}
      </Grid>
    </Grid>
  );
};

export default InvestmentAllocation;
