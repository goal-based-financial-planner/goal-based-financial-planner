import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiInput from '@mui/material/Input';
import { Grid2 as Grid, Typography } from '@mui/material';

const Input = styled(MuiInput)`
  width: 42px;
`;

const CustomInput = ({
  label,
  percent,
  onChange,
}: {
  label: string;
  percent: number;
  onChange: (updatedPercent: number) => void;
}) => {
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPercent =
      event.target.value === '' ? 0 : Number(event.target.value);
    onChange(updatedPercent);
  };

  return (
    <>
      <Grid size={10}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid size={2}>
        <Input
          value={percent}
          size="small"
          onChange={handleInput}
          inputProps={{
            step: 10,
            min: 0,
            max: 100,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
      </Grid>
    </>
  );
};

export default CustomInput;
