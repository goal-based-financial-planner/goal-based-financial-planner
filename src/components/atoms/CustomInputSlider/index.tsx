import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import { Typography } from '@mui/material';

const Input = styled(MuiInput)`
  width: 42px;
`;

const CustomInputSlider = ({ selectedOption }: { selectedOption: string }) => {
  const [percentage, setPercentage] = React.useState(30);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setPercentage(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (percentage < 0) {
      setPercentage(0);
    } else if (percentage > 100) {
      setPercentage(100);
    }
  };

  return (
    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
      <Grid item xs={10}>
        <Typography>{selectedOption}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Input
          value={percentage}
          size="small"
          onChange={handleInputChange}
          onBlur={handleBlur}
          inputProps={{
            step: 10,
            min: 0,
            max: 100,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Slider
          value={typeof percentage === 'number' ? percentage : 0}
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
        />
      </Grid>
    </Grid>
  );
};

export default CustomInputSlider;
