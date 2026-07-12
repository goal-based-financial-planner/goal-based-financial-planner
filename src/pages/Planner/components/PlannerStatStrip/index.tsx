import { Box, Chip, Typography } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { TermType } from '../../../../types/enums';
import { formatCurrency } from '../../../../types/util';

export type PlannerStatStripProps = {
  targetAmount: number;
  totalRequired: number;
  totalInvesting: number;
  financialGoals?: FinancialGoal[];
  onGoalsClick?: () => void;
  onAddGoal?: () => void;
};

const TERM_CONFIG: { type: TermType; label: string; color: string }[] = [
  { type: TermType.SHORT_TERM, label: 'Short', color: '#ED6C02' },
  { type: TermType.MEDIUM_TERM, label: 'Mid', color: '#0288D1' },
  { type: TermType.LONG_TERM, label: 'Long', color: '#2E7D32' },
];

const StatTile = ({
  label,
  value,
  caption,
  valueColor,
  className,
  children,
}: {
  label: string;
  value: string;
  caption?: string;
  valueColor?: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <Box
    className={className}
    sx={{
      flex: 1,
      p: 2,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1.5,
      backgroundColor: 'background.paper',
    }}
  >
    <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: 1.2, display: 'block', lineHeight: 1.4 }}>
      {label}
    </Typography>
    <Typography variant="h6" fontWeight="bold" color={valueColor ?? 'text.primary'} sx={{ mt: 0.5 }}>
      {value}
    </Typography>
    {caption && (
      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
    )}
    {children}
  </Box>
);

const PlannerStatStrip = ({ targetAmount, totalRequired, totalInvesting, financialGoals, onGoalsClick, onAddGoal }: PlannerStatStripProps) => {
  const isOnTrack = totalInvesting >= totalRequired;
  const investingColor = isOnTrack ? 'success.main' : totalInvesting > 0 ? 'warning.main' : 'text.secondary';
  const investingCaption = totalInvesting === 0
    ? 'No SIPs logged yet'
    : isOnTrack
    ? 'On track'
    : `${formatCurrency(totalRequired - totalInvesting)} short`;

  const termChips = TERM_CONFIG
    .map(({ type, label, color }) => ({
      label,
      color,
      count: financialGoals?.filter((g) => g.getTermType() === type).length ?? 0,
    }))
    .filter(({ count }) => count > 0);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
      <StatTile
        className="stat-total-target"
        label="Total Goal Target"
        value={formatCurrency(targetAmount)}
        valueColor="primary.main"
      >
        <Box
          className="goals-drawer-button"
          sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}
        >
          {onGoalsClick && termChips.map(({ label, color, count }) => (
            <Chip
              key={label}
              size="small"
              label={`${label} · ${count}`}
              onClick={onGoalsClick}
              sx={{
                fontSize: '0.68rem',
                height: 20,
                backgroundColor: `${color}18`,
                color,
                border: `1px solid ${color}40`,
                cursor: 'pointer',
                '& .MuiChip-label': { px: 1 },
                '&:hover': { backgroundColor: `${color}28` },
              }}
            />
          ))}
          {onAddGoal && (
            <Chip
              size="small"
              label="+ Add Goal"
              onClick={onAddGoal}
              className="add-goals-button"
              sx={{
                fontSize: '0.68rem',
                height: 20,
                backgroundColor: 'transparent',
                color: 'primary.main',
                border: '1px dashed',
                borderColor: 'primary.main',
                cursor: 'pointer',
                '& .MuiChip-label': { px: 1 },
                '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' },
              }}
            />
          )}
        </Box>
      </StatTile>
      <StatTile
        label="Monthly Required"
        value={formatCurrency(totalRequired)}
        caption="/month across all goals"
      />
      <StatTile
        label="Monthly Investing"
        value={formatCurrency(totalInvesting)}
        caption={investingCaption}
        valueColor={investingColor}
      />
    </Box>
  );
};

export default PlannerStatStrip;
