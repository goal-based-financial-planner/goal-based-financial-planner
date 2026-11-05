import { useMemo } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { SIPEntry } from '../../../../types/investmentLog';
import { InvestmentSuggestion } from '../../../../types/planner';
import { buildSIPComparison } from '../../../../domain/investmentLog';
import { formatCurrency } from '../../../../types/util';
import { cardSx, instrumentColor } from './styles';

type PlanVsSipsCardProps = {
  sips: SIPEntry[];
  /** Planned monthly amount per instrument, summed across every term. */
  planned: InvestmentSuggestion[];
};

/** Same thresholds as the Investment Tracker: within 10% of plan counts as on track. */
const comparisonStatus = (actual: number, planned: number) => {
  if (planned === 0) return { label: 'Not in plan', color: 'warning.main', fill: 100 };
  const fill = Math.min((actual / planned) * 100, 100);
  if (actual > planned) return { label: 'Exceeding', color: 'info.main', fill };
  if (actual >= planned * 0.9) return { label: 'On track', color: 'primary.main', fill };
  return { label: `${Math.round(fill)}% met`, color: 'error.main', fill };
};

const PlanVsSipsCard = ({ sips, planned }: PlanVsSipsCardProps) => {
  const rows = useMemo(() => buildSIPComparison(sips, planned), [sips, planned]);

  return (
    <Box sx={cardSx}>
      <Typography component="h2" sx={{ fontWeight: 700, fontSize: 17 }}>
        Plan vs Your SIPs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
        How much you invest each month in each instrument, compared with what your plan needs.
      </Typography>

      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Nothing to compare yet.
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {rows.map((row, i) => {
            const status = comparisonStatus(row.actualAmount, row.suggestedAmount);
            const isOffPlan = row.suggestedAmount === 0;
            const gap = Math.round(row.difference);
            return (
              <Box component="li" key={row.type}>
                {i > 0 && <Divider />}
                <Box sx={{ py: 1.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        backgroundColor: instrumentColor(row.type),
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap title={row.type}>
                      {row.type}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: status.color, whiteSpace: 'nowrap' }}>
                      {status.label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, pl: 2.25, mb: 0.75 }}>
                    <Typography variant="caption" color="text.secondary">
                      {isOffPlan
                        ? `${formatCurrency(row.actualAmount)}/mo — your plan doesn't include this`
                        : `${formatCurrency(row.actualAmount)} of ${formatCurrency(Math.round(row.suggestedAmount))}/mo`}
                    </Typography>
                    {!isOffPlan && gap !== 0 && (
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 500, color: gap > 0 ? 'primary.main' : 'error.main', whiteSpace: 'nowrap' }}
                      >
                        {gap > 0 ? `${formatCurrency(gap)} over` : `${formatCurrency(-gap)} short`}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    role="progressbar"
                    aria-label={`${row.type} share of plan met`}
                    aria-valuenow={Math.round(status.fill)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    sx={{ ml: 2.25, height: 4, borderRadius: 2, backgroundColor: '#ECECEA', overflow: 'hidden' }}
                  >
                    <Box sx={{ width: `${status.fill}%`, height: '100%', backgroundColor: status.color }} />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PlanVsSipsCard;
