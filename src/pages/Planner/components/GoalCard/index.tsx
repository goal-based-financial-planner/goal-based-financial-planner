import {
  Box,
  Typography,
  Collapse,
  Chip,
  IconButton,
} from '@mui/material';
import SemiCircleProgressBar from 'react-progressbar-semicircle';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';
import { GoalType } from '../../../../types/enums';
import { useMemo, useState } from 'react';
import { InvestmentSuggestion } from '../../hooks/useInvestmentCalculator';
import { formatNumber } from '../../../../types/util';

const INVESTMENT_COLORS = [
  '#FF9800', // Orange
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#9C27B0', // Purple
  '#F44336', // Red
];

const GoalCard = ({
  goal,
  dispatch,
  currentValue,
  investmentSuggestions = [],
}: {
  goal: FinancialGoal;
  dispatch: any;
  currentValue: number;
  investmentSuggestions?: InvestmentSuggestion[];
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => deleteFinancialGoal(dispatch, goal.id);

  const formattedTargetAmount = formatNumber(
    goal.getInflationAdjustedTargetAmount(),
  );

  const formattedCurrentValue = formatNumber(goal.getTargetAmount());

  const progressPercentage = Math.round(
    (currentValue / goal.getInflationAdjustedTargetAmount()) * 100,
  );

  const goalDuration = `${dayjs(goal.startDate).format('MM/YYYY')} - ${dayjs(
    goal.targetDate,
  ).format('MM/YYYY')}`;

  const fontSize = useMemo(() => {
    const valueLength = currentValue.toFixed().length;
    if (valueLength <= 8) return '1.25rem';
    return '1rem';
  }, [currentValue]);

  const totalMonthlyInvestment = investmentSuggestions.reduce(
    (sum, s) => sum + s.amount,
    0,
  );

  const hasInvestmentData = investmentSuggestions.length > 0;

  return (
    <Box
      sx={{
        position: 'relative',
        px: 1,
        py: 1,
        borderRadius: 2,
      }}
    >
      {/* Main card row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          pr: 4, // Space for delete button
        }}
      >
        {/* Left section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2">{goal.goalName}</Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', mt: 1, fontSize }}
          >
            {formattedTargetAmount}
          </Typography>
          {goal.goalType !== GoalType.RECURRING && (
            <Typography variant="caption">
              Original Target: {formattedCurrentValue}
            </Typography>
          )}
        </Box>

        {/* Right section: Duration and progress */}
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

      {/* Investment Breakdown Toggle */}
      {hasInvestmentData && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: '16px',
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              expand_more
            </span>
            Monthly SIP: ₹{formatNumber(totalMonthlyInvestment)}
          </Typography>

          {/* Mini color bar preview when collapsed */}
          {!expanded && (
            <Box
              sx={{
                display: 'flex',
                ml: 2,
                height: 6,
                borderRadius: 1,
                overflow: 'hidden',
                flex: 1,
                maxWidth: 120,
              }}
            >
              {investmentSuggestions.map((suggestion, index) => (
                <Box
                  key={suggestion.investmentName}
                  sx={{
                    flex: suggestion.amount / totalMonthlyInvestment,
                    backgroundColor:
                      INVESTMENT_COLORS[index % INVESTMENT_COLORS.length],
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Expandable Investment Breakdown */}
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
          >
            Investment Breakdown (Monthly)
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {investmentSuggestions.map((suggestion, index) => (
              <Chip
                key={suggestion.investmentName}
                size="small"
                label={
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor:
                          INVESTMENT_COLORS[index % INVESTMENT_COLORS.length],
                      }}
                    />
                    <span>{suggestion.investmentName}</span>
                    <Typography
                      component="span"
                      sx={{ fontWeight: 'bold', ml: 0.5 }}
                    >
                      ₹{formatNumber(suggestion.amount)}
                    </Typography>
                  </Box>
                }
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Collapse>

      {/* Delete Button - Always visible */}
      <IconButton
        size="small"
        onClick={handleDelete}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'error.main',
          opacity: 0.6,
          '&:hover': {
            opacity: 1,
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          },
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
          delete
        </span>
      </IconButton>
    </Box>
  );
};

export default GoalCard;
