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
