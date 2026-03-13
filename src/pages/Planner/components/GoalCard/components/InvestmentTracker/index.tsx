import { Box, Button, Chip, Grid2 as Grid, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { Dispatch, useMemo } from 'react';
import { useState } from 'react';
import { PlannerDataAction } from '../../../../../../store/plannerDataReducer';
import { deleteInvestmentLogEntry } from '../../../../../../store/plannerDataActions';
import { InvestmentSuggestion } from '../../../../../../types/planner';
import { SIPEntry } from '../../../../../../types/investmentLog';
import {
  buildSIPComparison,
  buildGrowthProjection,
} from '../../../../../../domain/investmentLog';
import { formatNumber } from '../../../../../../types/util';
import SIPForm from '../LogEntryForm';
import SIPList from '../InvestmentLogHistory';

type Props = {
  investmentSuggestions: InvestmentSuggestion[];
  sips: SIPEntry[];
  dispatch: Dispatch<PlannerDataAction>;
  projectionYears?: number;
};

const InvestmentTracker = ({
  investmentSuggestions,
  sips = [],
  dispatch,
  projectionYears = 10,
}: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SIPEntry | undefined>(undefined);

  const investmentTypes = investmentSuggestions.map((s) => s.investmentName);
  const comparison = buildSIPComparison(sips, investmentSuggestions);

  const growthData = useMemo(
    () => buildGrowthProjection(sips, investmentSuggestions, projectionYears),
    [sips, investmentSuggestions, projectionYears],
  );

  const xLabels = growthData.map((d) => (d.year === 0 ? 'Now' : `Yr ${d.year}`));
  const expectedSeries = growthData.map((d) => d.expectedValue);
  const actualSeries = growthData.map((d) => d.actualValue);

  const hasAnySips = sips.length > 0;

  const handleEdit = (entry: SIPEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleDelete = (entryId: string) => {
    deleteInvestmentLogEntry(dispatch, entryId);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Growth projection chart */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
        Portfolio Growth Projection ({projectionYears} year{projectionYears !== 1 ? 's' : ''})
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {hasAnySips
          ? 'Based on your current SIPs vs the recommended plan'
          : 'Add SIPs to see how your actual portfolio compares to the plan'}
      </Typography>
      <LineChart
        height={220}
        series={[
          {
            data: expectedSeries,
            label: 'Recommended plan',
            color: '#2196F3',
            curve: 'natural',
            showMark: false,
          },
          ...(hasAnySips
            ? [
                {
                  data: actualSeries,
                  label: 'Your SIPs',
                  color: '#4CAF50',
                  curve: 'natural' as const,
                  showMark: false,
                },
              ]
            : []),
        ]}
        xAxis={[{ data: xLabels, scaleType: 'point' as const }]}
        yAxis={[
          {
            valueFormatter: (v: number) =>
              v >= 10000000
                ? `₹${(v / 10000000).toFixed(1)}Cr`
                : v >= 100000
                ? `₹${(v / 100000).toFixed(1)}L`
                : `₹${formatNumber(v)}`,
          },
        ]}
        sx={{ '& .MuiChartsLegend-root': { fontSize: '0.7rem' } }}
        slotProps={{ legend: { itemMarkWidth: 10, itemMarkHeight: 10 } }}
      />

      {/* Comparison + SIP list side by side */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Left: comparison cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              By Instrument Type
            </Typography>
          </Box>
          {comparison.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No data yet.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {comparison.map((row) => {
                const max = Math.max(row.suggestedAmount, row.actualAmount, 1);
                const suggestedPct = (row.suggestedAmount / max) * 100;
                const actualPct = (row.actualAmount / max) * 100;
                const isOver = row.difference >= 0;
                const isCustom = row.suggestedAmount === 0;

                return (
                  <Box
                    key={row.type}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '65%' }}>
                        {row.type}
                      </Typography>
                      {isCustom ? (
                        <Chip
                          label="Not in plan"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            backgroundColor: 'warning.light',
                            color: 'warning.contrastText',
                          }}
                        />
                      ) : (
                        <Chip
                          label={`${isOver ? '+' : ''}₹${formatNumber(Math.abs(row.difference))}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            backgroundColor: isOver ? 'success.light' : 'error.light',
                            color: isOver ? 'success.contrastText' : 'error.contrastText',
                          }}
                        />
                      )}
                    </Box>

                    {/* Suggested bar */}
                    {!isCustom && (
                      <Box sx={{ mb: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            Suggested
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            ₹{formatNumber(row.suggestedAmount)}/mo
                          </Typography>
                        </Box>
                        <Box sx={{ height: 4, borderRadius: 2, backgroundColor: 'action.hover', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              width: `${suggestedPct}%`,
                              height: '100%',
                              borderRadius: 2,
                              backgroundColor: '#2196F3',
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Actual bar */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          Your SIPs
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          ₹{formatNumber(row.actualAmount)}/mo
                        </Typography>
                      </Box>
                      <Box sx={{ height: 4, borderRadius: 2, backgroundColor: 'action.hover', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${actualPct}%`,
                            height: '100%',
                            borderRadius: 2,
                            backgroundColor: isCustom ? '#FF9800' : isOver ? '#4CAF50' : '#F44336',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Grid>

        {/* Right: SIP list + add button */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Your SIPs
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => { setEditingEntry(undefined); setFormOpen(true); }}
              startIcon={<span className="material-symbols-rounded" style={{ fontSize: '14px' }}>add</span>}
              sx={{ py: 0.25, minWidth: 'unset' }}
            >
              Add SIP
            </Button>
          </Box>
          <SIPList sips={sips} onEdit={handleEdit} onDelete={handleDelete} />
        </Grid>
      </Grid>

      {/* Add/Edit form */}
      <SIPForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        investmentTypes={investmentTypes}
        dispatch={dispatch}
        existingEntry={editingEntry}
      />
    </Box>
  );
};

export default InvestmentTracker;
