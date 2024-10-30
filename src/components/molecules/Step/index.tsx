import { Grid } from '@mui/material';
import { ReactNode } from 'react';

export type StepProps = {
  children: ReactNode;
};

const Step = ({ children }: StepProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {children}
      </Grid>
    </Grid>
  );
};

export default Step;
