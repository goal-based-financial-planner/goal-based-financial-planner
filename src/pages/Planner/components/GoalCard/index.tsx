import { Box, Typography, useTheme } from '@mui/material';
import SemiCircleProgressBar from 'react-progressbar-semicircle';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';
import { GoalType } from '../../../../types/enums';

const GoalCard = ({
  goal,
  dispatch,
  currentValue,
}: {
  goal: FinancialGoal;
  dispatch: any;
  currentValue: number;
}) => {
  const theme = useTheme();

  const handleDelete = () => deleteFinancialGoal(dispatch, goal.id);

  const formattedTargetAmount = goal
    .getInflationAdjustedTargetAmount()
    .toLocaleString(navigator.language, { maximumFractionDigits: 0 });

  const formattedCurrentValue = goal
    .getTargetAmount()
    .toLocaleString(navigator.language, { maximumFractionDigits: 0 });

  const progressPercentage = Math.round(
    (currentValue / goal.getInflationAdjustedTargetAmount()) * 100,
  );

  const goalDuration = `${dayjs(goal.startDate).format('MM/YYYY')} - ${dayjs(
    goal.targetDate,
  ).format('MM/YYYY')}`;

  return (
    <Box
      sx={{
        overflow: 'hidden',
        position: 'relative',
        // On larger screens, slide the card on hover
        [theme.breakpoints.up('md')]: {
          '&:hover .hover-buttons': { right: 0 },
          '&:hover .card-content': {
            transform: 'translateX(-40px)',
            transition: 'transform 0.3s ease',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        },
        // On smaller screens, always show the delete button
        [theme.breakpoints.down('md')]: {
          '& .hover-buttons': { right: 0 },
        },
      }}
    >
      {/* Card content with extra right padding on small screens */}
      <Box
        className="card-content"
        sx={{
          display: 'flex',
          px: 1,
          py: 1,
          pr: { xs: '40px', md: 0 },
          borderRadius: 2,
          justifyContent: 'space-between',
          transition: 'transform 0.3s ease',
          flexDirection: 'row',
        }}
      >
        {/* Left section: Shrinkable box */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2">{goal.goalName}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
            {formattedTargetAmount}
          </Typography>
          {goal.goalType !== GoalType.RECURRING && (
            <Typography variant="caption">
              Original Target: {formattedCurrentValue}
            </Typography>
          )}
        </Box>

        {/* Right section: Duration and progress */}
        {/* Show this only if goal is not recurring*/}
        {goal.goalType !== GoalType.RECURRING && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: 'grey', textAlign: 'center' }}
            >
              {goalDuration}
            </Typography>
            <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
              <SemiCircleProgressBar
                percentage={progressPercentage}
                showPercentValue
                strokeWidth={5}
                diameter={90}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Delete Button */}
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
          [theme.breakpoints.down('md')]: {
            right: 0,
          },
        }}
      >
        <Box
          sx={{ color: 'red', padding: 1, cursor: 'pointer' }}
          onClick={handleDelete}
        >
          <span className="material-symbols-rounded">delete</span>
        </Box>
      </Box>
    </Box>
  );
};

export default GoalCard;
