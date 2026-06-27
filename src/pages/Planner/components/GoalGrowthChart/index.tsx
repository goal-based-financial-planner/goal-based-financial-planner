import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import dayjs from 'dayjs';
import { SIPEntry } from '../../../../types/investmentLog';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { InvestmentSuggestion } from '../../../../types/planner';
import { buildPortfolioWithdrawalSeries } from '../../../../domain/investmentLog';
import { formatCompactCurrency } from '../../../../types/util';

type Props = {
  sips: SIPEntry[];
  goals: FinancialGoal[];
  allSuggestions: InvestmentSuggestion[];
};

const GoalGrowthChart = ({ sips, goals, allSuggestions }: Props) => {
  const theme = useTheme();

  const { points, suggestedPoints, goalMarkers } = useMemo(
    () => buildPortfolioWithdrawalSeries(sips, goals, allSuggestions),
    [sips, goals, allSuggestions],
  );

  if (points.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }} aria-label="Portfolio growth projection chart">
        <Typography variant="body2" color="text.secondary">
          {sips.length === 0
            ? 'Log your SIPs above to see portfolio growth.'
            : 'Add one-time financial goals to see growth with withdrawals.'}
        </Typography>
      </Box>
    );
  }

  const goesNegative = points.some((p) => p.value < 0);
  const shortfalls = goalMarkers.filter((m) => m.portfolioValueAfter < 0);

  const todayDate = dayjs().startOf('month').toDate();
  const showTodayLine = todayDate >= points[0].date && todayDate <= points[points.length - 1].date;

  return (
    <Box aria-label="Portfolio growth projection chart">
      <LineChart
        xAxis={[
          {
            data: points.map((p) => p.date),
            scaleType: 'time',
            valueFormatter: (value: Date) => dayjs(value).format('MMM YYYY'),
            tickInterval: (value: Date) => value.getMonth() === 0,
          },
        ]}
        yAxis={[{ valueFormatter: (value: number) => formatCompactCurrency(value) }]}
        series={[
          ...(suggestedPoints.length > 0 ? [{
            data: suggestedPoints.map((p) => p.value),
            label: 'If on plan',
            color: theme.palette.warning.main,
            area: false,
            curve: 'linear' as const,
            showMark: false,
          }] : []),
          {
            data: points.map((p) => p.value),
            label: 'Actual',
            color: theme.palette.primary.main,
            area: true,
            curve: 'linear' as const,
            showMark: false,
          },
        ]}
        height={380}
        sx={{ '& .MuiAreaElement-root': { fillOpacity: 0.12 } }}
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
        margin={{ top: 20, left: 70, right: 30, bottom: 60 }}
      >
        {showTodayLine && (
          <ChartsReferenceLine
            x={todayDate}
            label="Today"
            labelAlign="start"
            lineStyle={{ strokeDasharray: '4 4', stroke: '#666', strokeWidth: 1.5 }}
            labelStyle={{ fontSize: 11, fill: '#666' }}
          />
        )}
        {goesNegative && (
          <ChartsReferenceLine
            y={0}
            label="Portfolio exhausted"
            labelAlign="end"
            lineStyle={{ stroke: theme.palette.error.main, strokeWidth: 1.5 }}
            labelStyle={{ fontSize: 11, fill: theme.palette.error.main, fontWeight: 600 }}
          />
        )}
        {goalMarkers.map((marker, i) => (
          <ChartsReferenceLine
            key={i}
            x={marker.date}
            label={`${marker.goalName} (${formatCompactCurrency(marker.amount)})`}
            labelAlign="start"
            lineStyle={{
              stroke: theme.palette.info.main,
              strokeWidth: 1.5,
              strokeDasharray: '4 4',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelStyle={{ fontSize: 10, fill: theme.palette.info.main, textAnchor: 'end' } as any}
          />
        ))}
      </LineChart>

      {shortfalls.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5, px: 1 }}>
          {shortfalls.map((m, i) => (
            <Box
              key={i}
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
                <strong>{m.goalName}</strong> ({formatCompactCurrency(m.amount)}) — portfolio short by{' '}
                <strong>{formatCompactCurrency(Math.abs(m.portfolioValueAfter))}</strong> at target date.
                Increase your SIPs or push the goal timeline out.
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default GoalGrowthChart;
