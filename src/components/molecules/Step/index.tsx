import { forwardRef, ReactNode } from 'react';
import CustomPaper from '../../atoms/CustomPaper';
import { Grid } from '@mui/material';

export type StepProps = {
  title: string;
  children: ReactNode;
};

const Step = ({ title, children }: StepProps) => {
  return (
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <h2>{title}</h2>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          mb: 5,
          mt: 5,
          overflow: 'scroll',
        }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

export default Step;
