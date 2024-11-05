import React from 'react';
import { Box, Card, CardContent, Tooltip, Typography } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';

type FinancialGoalCardProps = {
  goal: FinancialGoal;
};

const FinancialGoalCard = ({ goal }: FinancialGoalCardProps) => {
  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ padding: 1 }}>
        <Box
          sx={{
            height: '180px',
            backgroundColor: '#BCE6FF',
            padding: 2,
            borderRadius: 4,
          }}
        >
          <Box sx={{ textAlign: 'right' }}>
            <span className="material-symbols-rounded">close</span>{' '}
          </Box>

          <Tooltip title={goal.getGoalName()} placement="top">
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
            >
              <Typography variant="h4">{goal.getGoalName()}</Typography>
            </Box>
          </Tooltip>

          <Typography variant="body1">
            {goal.getInvestmentStartYear()} - {goal.getTargetYear()}
          </Typography>
        </Box>

        <Box sx={{ padding: 1, height: '20px' }}>
          {goal
            .getInflationAdjustedTargetAmount()
            .toLocaleString(navigator.language)}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialGoalCard;
