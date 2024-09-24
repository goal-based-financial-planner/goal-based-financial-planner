import { forwardRef, ReactNode } from 'react';
import CustomPaper from '../../atoms/CustomPaper';
import { Grid } from '@mui/material';

export type StepProps = {
  title: string;

  children: ReactNode;
};

const Step = forwardRef<HTMLDivElement, StepProps>(
  ({ title, children }, ref) => {
    return (
      <CustomPaper ref={ref} sx={{ mt: 5 }}>
        <Grid container spacing={2}>
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
      </CustomPaper>
    );
  },
);

export default Step;
