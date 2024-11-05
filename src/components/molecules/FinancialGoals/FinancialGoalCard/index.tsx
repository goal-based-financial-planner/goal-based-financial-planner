import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';

type FinancialGoalCardProps = {
  goal: FinancialGoal;
};

const FinancialGoalCard = ({ goal }: FinancialGoalCardProps) => {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}>
        <Box
          sx={{
            height: '180px',
            backgroundColor: theme.palette.cardBackGround.main,
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

          <Typography variant="body1" sx={{ pt: 1 }}>
            {goal.getInvestmentStartYear()} - {goal.getTargetYear()}
          </Typography>
        </Box>

        <Box
          sx={{
            padding: 1,
            height: '25px',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Typography variant="h5">
            {goal
              .getInflationAdjustedTargetAmount()
              .toLocaleString(navigator.language)}
          </Typography>
          <Tooltip title="Inflation Adjusted Amount" placement="top">
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: '15px',
                padding: 2,
                color: 'grey',
                cursor: 'pointer',
              }}
            >
              info
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialGoalCard;
