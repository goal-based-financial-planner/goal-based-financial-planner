import {
  Box,
  Typography,
  Collapse,
  Chip,
  IconButton,
  Dialog,
} from '@mui/material';
import { deleteFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';
import { GoalType } from '../../../../types/enums';
import { useMemo, useState, Dispatch, memo, useCallback } from 'react';
import { InvestmentSuggestion } from '../../../../types/planner';
import { formatCurrency } from '../../../../types/util';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { DEFAULT_INFLATION_RATE } from '../../../../domain/constants';
import FinancialGoalForm from '../../../../pages/Home/components/FinancialGoalForm';

const INVESTMENT_COLORS = [
  '#FF9800', // Orange
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#9C27B0', // Purple
  '#F44336', // Red
];

const GoalCard = memo(
  ({
    goal,
    dispatch,
    currentValue,
    investmentSuggestions = [],
  }: {
    goal: FinancialGoal;
    dispatch: Dispatch<PlannerDataAction>;
    currentValue: number;
    investmentSuggestions?: InvestmentSuggestion[];
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = useCallback(
      () => deleteFinancialGoal(dispatch, goal.id),
      [dispatch, goal.id],
    );

    const totalMonthlyInvestment = useMemo(
      () =>
        investmentSuggestions.reduce(
          (sum, suggestion) => sum + suggestion.amount,
          0,
        ),
      [investmentSuggestions],
    );

    const formattedTargetAmount = formatCurrency(goal.getInflationAdjustedTargetAmount());
    const formattedNominalAmount = formatCurrency(goal.getTargetAmount());

    const goalDuration = `${dayjs(goal.startDate).format('MM/YYYY')} - ${dayjs(
      goal.targetDate,
    ).format('MM/YYYY')}`;

    const fontSize = useMemo(() => {
      const valueLength = currentValue.toFixed().length;
      if (valueLength <= 8) return '1.25rem';
      return '1rem';
    }, [currentValue]);

    const hasInvestmentData = investmentSuggestions.length > 0;
    const displayedInflationRate = goal.inflationRate ?? DEFAULT_INFLATION_RATE;

    return (
      <Box
        sx={{
          position: 'relative',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.15s ease',
          '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' },
        }}
      >
        {/* Main card row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            pr: 4,
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
            <Typography variant="caption" display="block">
              Original Target: {formattedNominalAmount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Inflation: {displayedInflationRate}%
            </Typography>
            {goal.goalType !== GoalType.RECURRING && (
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {goalDuration}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Investment Breakdown Toggle */}
        {hasInvestmentData && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 1.5,
              pt: 1,
              borderTop: '1px dashed',
              borderColor: 'divider',
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
              Monthly SIP: {formatCurrency(totalMonthlyInvestment)}
            </Typography>

            {/* Mini color bar preview when collapsed */}
            {!expanded && (
              <Box
                sx={{
                  display: 'flex',
                  ml: 2,
                  height: 5,
                  borderRadius: 1,
                  overflow: 'hidden',
                  flex: 1,
                  maxWidth: 100,
                  opacity: 0.75,
                }}
              >
                {investmentSuggestions.map((suggestion, index) => (
                  <Box
                    key={suggestion.investmentName}
                    sx={{
                      flex: suggestion.amount / totalMonthlyInvestment,
                      backgroundColor: INVESTMENT_COLORS[index % INVESTMENT_COLORS.length],
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Expandable Investment Breakdown */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {investmentSuggestions.map((suggestion, index) => {
              const color = INVESTMENT_COLORS[index % INVESTMENT_COLORS.length];
              const pct = totalMonthlyInvestment > 0
                ? Math.round((suggestion.amount / totalMonthlyInvestment) * 100)
                : 0;
              return (
                <Chip
                  key={suggestion.investmentName}
                  label={
                    <Box sx={{ py: 0.25 }}>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                        {suggestion.investmentName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color, lineHeight: 1.4 }}>
                          {formatCurrency(Math.round(suggestion.amount))}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                          {pct}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    height: 'auto',
                    borderRadius: 1.5,
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: `3px solid ${color}`,
                    '& .MuiChip-label': { px: 1.25 },
                  }}
                />
              );
            })}
          </Box>
        </Collapse>

        {/* Edit Button — stacked above Delete */}
        <IconButton
          size="small"
          onClick={() => setIsEditing(true)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'primary.main',
            opacity: 0.6,
            '&:hover': {
              opacity: 1,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
            edit
          </span>
        </IconButton>

        {/* Delete Button — below Edit */}
        <IconButton
          size="small"
          onClick={handleDelete}
          sx={{
            position: 'absolute',
            top: 40,
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
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
            delete
          </span>
        </IconButton>

        {/* Edit Dialog */}
        <Dialog
          open={isEditing}
          onClose={() => setIsEditing(false)}
          maxWidth="sm"
          fullWidth
        >
          <FinancialGoalForm
            dispatch={dispatch}
            close={() => setIsEditing(false)}
            embedded
            initialGoal={goal}
          />
        </Dialog>
      </Box>
    );
  });

GoalCard.displayName = 'GoalCard';

export default GoalCard;
