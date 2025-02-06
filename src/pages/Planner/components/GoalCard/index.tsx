import { Box, Typography } from '@mui/material';
import SemiCircleProgressBar from 'react-progressbar-semicircle';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';

const GoalCard = ({
  goal,
  dispatch,
  currentValue,
}: {
  goal: FinancialGoal;
  dispatch: any;
  currentValue: number;
}) => {
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
          px: 1,
          py: 1,
          borderRadius: 2,
          justifyContent: 'space-between',
          transition: 'transform 0.3s ease',
          flexDirection: 'row',
        }}
      >
        <Box>
          <Typography variant="subtitle2">{goal.goalName}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
            {goal
              .getInflationAdjustedTargetAmount()
              .toLocaleString(navigator.language, {
                maximumFractionDigits: 0,
              })}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'grey', textAlign: 'center' }}
          >
            {`${dayjs(goal.startDate).get('month') + 1}/${dayjs(goal.startDate).get('year')}-${dayjs(goal.targetDate).get('month') + 1}/${dayjs(goal.targetDate).get('year')}`}
          </Typography>
          <Box style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
            <SemiCircleProgressBar
              percentage={Math.round(
                (currentValue / goal.getInflationAdjustedTargetAmount()) * 100,
              )}
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
