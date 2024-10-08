import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import { Typography } from '@mui/material';

const Input = styled(MuiInput)`
  width: 42px;
`;

const CustomInputSlider = ({
  label,
  percent,
  onChange,
}: {
  label: string;
  percent: number;
  onChange: (updatedPercent: number) => void;
}) => {
  const handleSlider = (event: Event, newValue: number | number[]) => {
    onChange(Number(newValue));
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPercent =
      event.target.value === '' ? 0 : Number(event.target.value);
    onChange(updatedPercent);
  };

  const handleBlur = () => {
    // if (percentage < 0) {
    //   setPercentage(0);
    // } else if (percentage > 100) {
    //   setPercentage(100);
    // }
  };

  return (
    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
      <Grid item xs={10}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Input
          value={percent}
          size="small"
          onChange={handleInput}
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
          value={typeof percent === 'number' ? percent : 0}
          onChange={handleSlider}
          aria-labelledby="input-slider"
        />
      </Grid>
    </Grid>
  );
};

export default CustomInputSlider;
