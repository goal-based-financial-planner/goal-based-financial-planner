import { Box, Card, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import SemiCircleProgressBar from 'react-progressbar-semicircle';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';

const GoalCard = ({
  goal,
  amount,
  dispatch,
}: {
  goal: FinancialGoal;
  amount: number;
  dispatch: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = () => {
    deleteFinancialGoal(dispatch, goal.id);
  };
  return (
    <Box
      sx={{
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
          px: 2,
          py: 1,
          borderRadius: 2,
          justifyContent: 'space-between',
          transition: 'transform 0.3s ease',
          height: isExpanded ? '170px' : '70px',
          flexDirection: 'row',
        }}
      >
        <Box>
          <Typography variant="subtitle1">{goal.goalName}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {amount.toLocaleString(navigator.language, {
              maximumFractionDigits: 0,
            })}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body2"
            sx={{ color: 'grey', textAlign: 'center' }}
          >
            2024-2028
          </Typography>
          <Box style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
            <SemiCircleProgressBar
              percentage={33}
              showPercentValue
              strokeWidth={5}
              diameter={90}
            />
          </Box>
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
            color: 'black',
            padding: 1,
            cursor: 'pointer',
          }}
          onClick={handleDelete}
        >
          <span className="material-symbols-rounded">delete</span>
        </Box>
      </Box>
    </Box>
  );
};

export default GoalCard;
