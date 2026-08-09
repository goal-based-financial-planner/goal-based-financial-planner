import { Box, Typography, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import { WhatIfGoalMarker, WhatIfProjectionPoint, WhatIfTopUpResult } from '../../../../../domain/whatIf';
import { formatCompactCurrency, formatCurrency } from '../../../../../types/util';

type Props = {
  /** What you need — under the live inflation adjustment. Not drawn as its own line; only used
   *  to derive the chart's date range, since each goal's requirement is already called out by
   *  its dashed reference line below. */
  requirement: WhatIfProjectionPoint[];
  /** How you're actually investing — your logged SIPs compounding forward under the live
   *  return-rate adjustment. */
  investing: WhatIfProjectionPoint[];
  /** One per one-time goal, rendered as a dashed reference line labelled with the goal's name
   *  and required amount at its target date. */
  markers: WhatIfGoalMarker[];
  /** How much more to invest, per instrument, to close any shortfall shown below. */
  requiredTopUp: WhatIfTopUpResult;
};

const WhatIfChart = ({ requirement, investing, markers, requiredTopUp }: Props) => {
  const theme = useTheme();

  if (requirement.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }} aria-label="What if comparison chart">
        <Typography variant="body2" color="text.secondary">
          Add a goal to see the what-if comparison.
        </Typography>
      </Box>
    );
  }

  const xAxisDates = requirement.map((p) => new Date(p.date));
  const goesNegative = investing.some((p) => p.value < 0);
  const shortfalls = markers.filter((m) => m.portfolioValueAfter < 0);

  return (
    <Box aria-label="What if comparison chart">
      <LineChart
        xAxis={[
          {
            data: xAxisDates,
            scaleType: 'time',
            valueFormatter: (value: Date) => value.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
          },
        ]}
        yAxis={[{ valueFormatter: (value: number) => formatCompactCurrency(value) }]}
        series={[
          {
            id: 'investing',
            data: investing.map((p) => p.value),
            label: 'My Investments',
            color: theme.palette.primary.main,
            area: true,
            curve: 'linear' as const,
            showMark: false,
          },
        ]}
        height={340}
        sx={{ '& .MuiAreaElement-root': { fillOpacity: 0.1 } }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            padding: 0,
            itemMarkWidth: 16,
            itemMarkHeight: 3,
            markGap: 6,
          },
        }}
        margin={{ top: 20, left: 70, right: 30, bottom: 50 }}
      >
        {goesNegative && (
          <ChartsReferenceLine
            y={0}
            label="Portfolio exhausted"
            labelAlign="end"
            lineStyle={{ stroke: theme.palette.error.main, strokeWidth: 1.5 }}
            labelStyle={{ fontSize: 11, fill: theme.palette.error.main, fontWeight: 600 }}
          />
        )}
        {markers.map((marker) => (
          <ChartsReferenceLine
            key={marker.goalId}
            x={new Date(marker.date)}
            label={`${marker.goalName} (${formatCompactCurrency(marker.amount)})`}
            labelAlign="start"
            lineStyle={{ stroke: theme.palette.info.main, strokeWidth: 1.5, strokeDasharray: '4 4' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelStyle={{ fontSize: 9, fill: theme.palette.info.main, textAnchor: 'end', transform: 'rotate(-45deg)', transformBox: 'fill-box', transformOrigin: 'right bottom' } as any}
          />
        ))}
      </LineChart>

      {shortfalls.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5, px: 1 }}>
          {shortfalls.map((m) => (
            <Box
              key={m.goalId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.light',
                backgroundColor: (t) => `${t.palette.error.main}10`,
              }}
            >
              <Typography variant="caption" color="error.main" fontWeight={600}>
                ⚠
              </Typography>
              <Typography variant="caption" color="error.main">
                <strong>{m.goalName}</strong> ({formatCompactCurrency(m.amount)}) — short by{' '}
                <strong>{formatCompactCurrency(Math.abs(m.portfolioValueAfter))}</strong> at target date.
              </Typography>
            </Box>
          ))}

          {requiredTopUp.topUps.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
              To close the gap, invest this much more each month:{' '}
              {requiredTopUp.topUps
                .map((t) => `${formatCurrency(t.additionalMonthlyAmount)}/mo in ${t.investmentName}`)
                .join(', ')}.
            </Typography>
          )}

          {requiredTopUp.unresolvable && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
              Increasing your SIPs alone won&apos;t close this gap — a goal is due too soon to benefit from
              extra contributions. Consider pushing its date out or lowering its target.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WhatIfChart;
