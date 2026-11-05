import React from 'react';
import { Box, Typography } from '@mui/material';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import { formatCurrency } from '../../../../types/util';
import { TermType } from '../../../../types/enums';
import { cardSx, TERM_ORDER, TERM_STYLES } from './styles';

type OverviewStatCardsProps = {
  targetAmount: number;
  totalRequired: number;
  totalInvesting: number;
  termsPresent: TermType[];
  onTermClick: (term: TermType) => void;
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="overline" color="text.secondary" sx={{ fontSize: 12, lineHeight: 1.5, display: 'block' }}>
    {children}
  </Typography>
);

const Value = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <Typography sx={{ fontSize: { xs: 24, sm: 26 }, fontWeight: 700, mt: 0.5, color: color ?? 'text.primary' }}>
    {children}
  </Typography>
);

const OverviewStatCards = ({
  targetAmount,
  totalRequired,
  totalInvesting,
  termsPresent,
  onTermClick,
}: OverviewStatCardsProps) => {
  const metPct = totalRequired > 0 ? Math.round((totalInvesting / totalRequired) * 100) : 0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 3,
        mb: 3,
      }}
    >
      <Box className="stat-total-target" sx={cardSx}>
        <Label>Total Goal Target</Label>
        <Value>{formatCurrency(targetAmount)}</Value>
        <Box className="goals-drawer-button" sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
          {TERM_ORDER.filter((term) => termsPresent.includes(term)).map((term) => {
            const style = TERM_STYLES[term];
            return (
              <Box
                key={term}
                component="button"
                type="button"
                onClick={() => onTermClick(term)}
                aria-label={`Open ${term} portfolio`}
                sx={{
                  all: 'unset',
                  cursor: 'pointer',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: style.bg,
                  color: style.text,
                }}
              >
                {style.short}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={cardSx}>
        <Label>Monthly Required</Label>
        <Value>{formatCurrency(totalRequired)}</Value>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textTransform: 'uppercase' }}>
          Across all durations
        </Typography>
      </Box>

      <Box sx={{ ...cardSx, borderColor: 'primary.main', position: 'relative', overflow: 'hidden' }}>
        <SavingsOutlinedIcon
          aria-hidden
          sx={{ position: 'absolute', top: 6, right: 6, fontSize: 52, color: 'primary.main', opacity: 0.12 }}
        />
        <Label>Monthly Investing</Label>
        <Value color="primary.main">{formatCurrency(totalInvesting)}</Value>
        {totalRequired > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
            <Box
              role="progressbar"
              aria-label="Share of monthly requirement met"
              aria-valuenow={Math.min(metPct, 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              sx={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: '#ECECEA', overflow: 'hidden' }}
            >
              <Box sx={{ width: `${Math.min(metPct, 100)}%`, height: '100%', backgroundColor: 'primary.main' }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>
              {metPct}% met
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            {totalInvesting === 0 ? 'No SIPs logged yet' : 'No active goals need funding'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default OverviewStatCards;
