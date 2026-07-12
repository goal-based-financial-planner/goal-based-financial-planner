import { Box, IconButton, Tooltip } from '@mui/material';
import { PieChart } from '@mui/x-charts';

import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { formatCurrency } from '../../../../types/util';
import { InvestmentAmountMap } from '../../../../types/charts';
import { memo, useMemo } from 'react';

const PALETTE = [
  'rgba(255, 165, 0, 0.8)',
  'rgba(54, 162, 235, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(50, 205, 50, 0.8)',
  'rgba(255, 99, 132, 0.8)',
];

const CustomLegend = memo(
  ({
    suggestions,
    label,
    onCustomize,
  }: {
    suggestions: GoalWiseInvestmentSuggestions[];
    label?: string;
    onCustomize?: () => void;
  }) => {
    const investmentOptionWiseSum = useMemo(
      () =>
        suggestions.reduce(
          (acc, goal) => {
            goal.investmentSuggestions.forEach(({ investmentName, amount }) => {
              acc[investmentName] = (acc[investmentName] || 0) + amount;
            });
            return acc;
          },
          {} as InvestmentAmountMap,
        ),
      [suggestions],
    );

    const entries = useMemo(() => Object.entries(investmentOptionWiseSum), [investmentOptionWiseSum]);
    const total = useMemo(() => entries.reduce((sum, [, v]) => sum + v, 0), [entries]);

    const pieData = useMemo(
      () =>
        entries.map(([name, value], i) => ({
          id: i,
          value,
          label: name,
          color: PALETTE[i % PALETTE.length],
        })),
      [entries],
    );

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Left: pie + term label + customize button */}
        {pieData.length > 0 && (
          <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <PieChart
              series={[{
                data: pieData,
                innerRadius: 28,
                outerRadius: 50,
                paddingAngle: 2,
                cornerRadius: 3,
                highlightScope: { faded: 'global', highlighted: 'item' },
                valueFormatter: (item) => {
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                  return `${pct}% (${formatCurrency(Math.round(item.value))})`;
                },
              }]}
              width={110}
              height={110}
              margin={{ top: 2, bottom: 2, left: 2, right: 2 }}
              slotProps={{ legend: { hidden: true } }}
            />
            {label && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 500, letterSpacing: 0.3 }}>
                  {label}
                </Box>
                {onCustomize && (
                  <Tooltip title="Customize allocation" arrow>
                    <IconButton
                      size="small"
                      onClick={onCustomize}
                      className="customize-button"
                      sx={{ color: 'success.main', p: 0.25 }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>tune</span>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Right: horizontal legend rows */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {entries.map(([key, value], index) => {
            const color = PALETTE[index % PALETTE.length];
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                <Box component="span" sx={{ flex: 1, fontSize: '0.82rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {key}
                </Box>
                <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.disabled', flexShrink: 0 }}>
                  {pct}%
                </Box>
                <Box component="span" sx={{ fontSize: '0.92rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {formatCurrency(Math.round(value))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
);

CustomLegend.displayName = 'CustomLegend';

export default CustomLegend;
