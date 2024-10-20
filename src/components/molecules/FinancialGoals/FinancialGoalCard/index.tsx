import React from 'react';
import { Card, CardContent, Icon, IconButton, Typography } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';

type FinancialGoalCardProps = {
  goal: FinancialGoal;
};

const FinancialGoalCard = ({ goal }: FinancialGoalCardProps) => {
  return (
    <Card sx={{ height: '250px' }}>
      <CardContent>
        <IconButton
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={() => console.log('Close button clicked')}
        >
          <Icon>close</Icon>
        </IconButton>
        <Typography variant="h4">{goal.getGoalName()}</Typography>
        <Typography variant="body1">
          {goal.getInvestmentStartYear()} - {goal.getTargetYear()}
        </Typography>
        <Typography variant="h5" align="right">
          {goal
            .getInflationAdjustedTargetAmount()
            .toLocaleString(navigator.language)}
          <Typography variant={'overline'}>*</Typography>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FinancialGoalCard;
