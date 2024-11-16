import React, { Dispatch } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type FinancialGoalCardProps = {
  goal: FinancialGoal;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoalCard = ({ goal, dispatch }: FinancialGoalCardProps) => {
  const theme = useTheme();
  const handleDelete = () => {
    deleteFinancialGoal(dispatch, goal.id);
  };
  return (
    <Card sx={{ borderRadius: 4 }}>
      <Box
        sx={{
          display: 'flex',
          backgroundColor: theme.palette.cardBackGround.main,
          px: 2,
          py: 1,
          borderRadius: 4,
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Tooltip title={goal.getGoalName()} placement="top">
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
            >
              <Typography sx={{ fontSize: '24px' }}>
                {goal.getGoalName()}
              </Typography>
              <Typography sx={{ pt: 1, fontSize: '16px', fontWeight: 'light' }}>
                {goal.getInvestmentStartYear()} - {goal.getTargetYear()}
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ fontSize: '32px' }}>
            {goal
              .getInflationAdjustedTargetAmount()
              .toLocaleString(navigator.language)}
          </Typography>
          <Tooltip title="Inflation Adjusted Amount" placement="top">
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: '12px',
                padding: 2,
                color: 'grey',
                cursor: 'pointer',
              }}
            >
              info
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default FinancialGoalCard;
