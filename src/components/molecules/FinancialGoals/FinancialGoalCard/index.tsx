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
      <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}>
        <Box
          sx={{
            height: '90px',
            backgroundColor: theme.palette.cardBackGround.main,
            padding: 1,
            borderRadius: 4,
          }}
        >
          <Tooltip title={goal.getGoalName()} placement="top">
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
            >
              <Typography variant="h6">{goal.getGoalName()}</Typography>
            </Box>
          </Tooltip>

          <Typography variant="body2" sx={{ pt: 1 }}>
            {goal.getInvestmentStartYear()} - {goal.getTargetYear()}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '12.5px',
            paddingTop: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Typography variant="h6">
              {goal
                .getInflationAdjustedTargetAmount()
                .toLocaleString(navigator.language)}
            </Typography>
            <Tooltip title="Inflation Adjusted Amount" placement="top">
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: '10px',
                  padding: 2,
                  color: 'grey',
                  cursor: 'pointer',
                }}
              >
                info
              </span>
            </Tooltip>
          </Box>

          <Box onClick={handleDelete}>
            <span
              className="material-symbols-rounded"
              style={{
                padding: 2,
                color: '#c42525',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              delete
            </span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialGoalCard;
