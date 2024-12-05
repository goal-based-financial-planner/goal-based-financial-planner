import React, { Dispatch, useState } from 'react';
import { Box, Card, Tooltip, Typography } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type FinancialGoalCardProps = {
  goal: FinancialGoal;
  dispatch: Dispatch<PlannerDataAction>;
};

const FinancialGoalCard = ({ goal, dispatch }: FinancialGoalCardProps) => {
  const handleDelete = () => {
    deleteFinancialGoal(dispatch, goal.id);
  };
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        '&:hover .hover-buttons': {
          right: 0,
        },
        '&:hover .card-content': {
          transform: 'translateX(-40px)',
          transition: 'transform 0.3s ease',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
      }}
    >
      <Box
        className="card-content"
        sx={{
          display: 'flex',
          backgroundColor: '#CBC5B5',
          px: 2,
          py: 1,
          borderRadius: 2,
          justifyContent: 'space-between',
          transition: 'transform 0.3s ease',
          height: isExpanded ? '170px' : '70px',
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
              <Typography sx={{ fontSize: '18px' }}>
                {goal.getGoalName()}
              </Typography>
              <Typography sx={{ pt: 1, fontSize: '12px', fontWeight: 'light' }}>
                {goal.getInvestmentStartYear()} - {goal.getTargetYear()}
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ fontSize: '20px' }}>
            {goal
              .getInflationAdjustedTargetAmount()
              .toLocaleString(navigator.language)}
          </Typography>
        </Box>
      </Box>

      <Box
        className="hover-buttons"
        sx={{
          position: 'absolute',
          top: 0,
          right: '-40px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'right 0.3s ease',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'red',
            color: 'white',
            padding: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50%',
          }}
          onClick={handleDelete}
        >
          <span className="material-symbols-rounded">delete</span>
        </Box>
        <Box
          sx={{
            backgroundColor: 'skyblue',
            color: 'white',
            padding: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50%',
          }}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <span className="material-symbols-rounded">info</span>
        </Box>
      </Box>
    </Card>
  );
};

export default FinancialGoalCard;
