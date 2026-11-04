import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../../types/util';
import { cardSx } from './styles';

export type GoalProgress = {
  id: string;
  name: string;
  /** Whole percent, 0–100. */
  progress: number;
};

type GoalProgressCardProps = {
  goals: GoalProgress[];
  onViewGoals: () => void;
  onGoalClick: (goalId: string) => void;
  /** Finished goals, listed under the progress bars. */
  completed?: { id: string; name: string; value: number; doneAt: string }[];
};

const GoalProgressCard = ({ goals, onViewGoals, onGoalClick, completed = [] }: GoalProgressCardProps) => (
  <Box sx={cardSx}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography component="h2" sx={{ fontWeight: 700, fontSize: 17, mr: 'auto' }}>
        Goal Progress
      </Typography>
      <Tooltip title="View all goals">
        <IconButton size="small" onClick={onViewGoals} aria-label="View all goals" sx={{ color: 'text.secondary' }}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>

    {goals.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {completed.length > 0 ? 'Every goal is complete.' : 'No goals yet.'}
      </Typography>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
        {goals.map(({ id, name, progress }) => {
          const color = progress > 0 ? 'primary.main' : 'error.main';
          return (
            <Box key={id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => onGoalClick(id)}
                  title={name}
                  sx={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    '&:hover': { textDecoration: 'underline' },
                    '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
                  }}
                >
                  {name}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color, ml: 1 }}>
                  {progress}%
                </Typography>
              </Box>
              <Box
                role="progressbar"
                aria-label={`${name} progress`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                sx={{ height: 6, borderRadius: 3, backgroundColor: '#ECECEA', overflow: 'hidden' }}
              >
                <Box sx={{ width: `${progress}%`, height: '100%', borderRadius: 3, backgroundColor: 'primary.main' }} />
              </Box>
            </Box>
          );
        })}
      </Box>
    )}

    {completed.length > 0 && (
      <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.5, display: 'block', mb: 0.5 }}>
          {completed.length} completed
        </Typography>
        {completed.map((goal) => (
          <Box
            key={goal.id}
            component="button"
            type="button"
            onClick={() => onGoalClick(goal.id)}
            aria-label={`Open ${goal.name} summary`}
            sx={{
              all: 'unset',
              boxSizing: 'border-box',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              py: 0.75,
              borderRadius: 1.5,
              '&:hover': { backgroundColor: 'action.hover' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: '#E6F4E3',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon sx={{ fontSize: 14 }} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {goal.name}
              </Box>{' '}
              · {formatCurrency(goal.value)} · {dayjs(goal.doneAt).format('MMM YYYY')}
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

export default GoalProgressCard;
