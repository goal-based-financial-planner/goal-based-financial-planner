import React, { forwardRef, ReactNode } from 'react';
import CustomPaper from '../../atoms/CustomPaper';
import { Grid, Box, Stack, Button, Typography } from '@mui/material';


export type StepProps =  {
  isExpanded: boolean;
  onContinue: () => void;
  onEdit: () => void;
  title: string;
  subtext: string;
  children: ReactNode;
  isContinueDisabled: boolean;
  summaryText: string;
  hideContinue?: boolean;
};

const Step = forwardRef<HTMLDivElement,StepProps>(({
  isExpanded,
  title,
  subtext,
  children,
  isContinueDisabled,
  onContinue,
  onEdit,
  summaryText,
  hideContinue
}, ref) => {
  return isExpanded ? (
    <CustomPaper sx={{ height: 'calc(100vh - 16px)', overflow: 'hidden' }} ref={ref}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h2>{title}</h2>
        </Grid>
        <Grid item xs={12}>
          <Box>{subtext}</Box>
        </Grid>
        <Grid item xs={12} sx={{ mb: 5, mt: 5 }}>
          {children}
        </Grid>
      </Grid>
      {hideContinue ? null : (
        <Stack alignItems="flex-end">
          <Button
            disabled={isContinueDisabled}
            sx={{ fontSize: '1.2rem' }}
            onClick={onContinue}
            variant="contained"
            color="primary"
          >
            Continue
          </Button>
        </Stack>
      )}
    </CustomPaper>
  ) : (
    <CustomPaper >
      <Grid spacing={2} alignItems="center">
        <Grid item xs={11}>
          <h2>{title}</h2>
          <Typography>{summaryText}</Typography>
        </Grid>
        <Grid item xs={1} textAlign="right">
          <Button onClick={onEdit} variant="contained" color="secondary">
            Edit
          </Button>
        </Grid>
      </Grid>
    </CustomPaper>
  );
});

export default Step;
