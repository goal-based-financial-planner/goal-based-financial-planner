import { Box, Button, Chip, Grid2 as Grid, Typography } from '@mui/material';
import { Dispatch } from 'react';
import { useState } from 'react';
import { PlannerDataAction } from '../../../../../../store/plannerDataReducer';
import { deleteInvestmentLogEntry } from '../../../../../../store/plannerDataActions';
import { InvestmentSuggestion } from '../../../../../../types/planner';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { FinancialGoal } from '../../../../../../domain/FinancialGoals';
import { buildSIPComparison } from '../../../../../../domain/investmentLog';
import { formatCurrency } from '../../../../../../types/util';
import SIPForm from '../LogEntryForm';
import SIPList from '../InvestmentLogHistory';
import GoalGrowthChart from '../../../GoalGrowthChart';

type Props = {
  investmentSuggestions: InvestmentSuggestion[];
  sips: SIPEntry[];
  goals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};

const InvestmentTracker = ({
  investmentSuggestions,
  sips = [],
  goals = [],
  dispatch,
}: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SIPEntry | undefined>(undefined);

  const investmentTypes = investmentSuggestions.map((s) => s.investmentName);
  const comparison = buildSIPComparison(sips, investmentSuggestions);

  const totalRequired = Math.round(comparison.reduce((sum, r) => sum + r.suggestedAmount, 0));
  const totalInvesting = Math.round(comparison.reduce((sum, r) => sum + r.actualAmount, 0));

  const handleEdit = (entry: SIPEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleDelete = (entryId: string) => {
    deleteInvestmentLogEntry(dispatch, entryId);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monthly summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', lineHeight: 1.4, display: 'block' }}>
              Monthly Required
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {formatCurrency(totalRequired)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              /month across all goals
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: totalInvesting >= totalRequired ? 'success.main' : 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', lineHeight: 1.4, display: 'block' }}>
              Monthly Investing
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color={totalInvesting >= totalRequired ? 'success.main' : totalInvesting > 0 ? 'warning.main' : 'text.secondary'}
            >
              {formatCurrency(totalInvesting)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalInvesting === 0 ? 'No SIPs logged yet' : totalInvesting >= totalRequired ? 'On track' : `${formatCurrency(totalRequired - totalInvesting)} short`}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Portfolio growth chart with withdrawal simulation */}
      <GoalGrowthChart sips={sips} goals={goals} allSuggestions={investmentSuggestions} />

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
                const isCustom = row.suggestedAmount === 0;
                const fillPct = isCustom
                  ? 100
                  : Math.min((row.actualAmount / row.suggestedAmount) * 100, 100);
                const isExceeding = !isCustom && row.actualAmount > row.suggestedAmount;
                const isMet = !isCustom && row.actualAmount >= row.suggestedAmount * 0.9;
                const barColor = isCustom
                  ? '#FF9800'
                  : isExceeding
                  ? '#2196F3'
                  : isMet
                  ? '#4CAF50'
                  : '#F44336';

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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '60%' }}>
                        {row.type}
                      </Typography>
                      {isCustom ? (
                        <Chip
                          label="Not in plan"
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem', backgroundColor: 'warning.light', color: 'warning.contrastText' }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: barColor, fontWeight: 600 }}>
                          {isExceeding ? 'Exceeding' : isMet ? 'On track' : `${Math.round(fillPct)}% met`}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {formatCurrency(row.actualAmount)}/mo
                        {!isCustom && (
                          <Box component="span" sx={{ color: 'text.disabled' }}>
                            {' '}/ {formatCurrency(row.suggestedAmount)}
                          </Box>
                        )}
                      </Typography>
                      {!isCustom && row.difference !== 0 && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.65rem', color: isExceeding ? 'success.main' : 'error.main' }}
                        >
                          {isExceeding ? '+' : ''}{formatCurrency(row.difference)}/mo
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ height: 5, borderRadius: 2, backgroundColor: 'action.hover', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${fillPct}%`,
                          height: '100%',
                          borderRadius: 2,
                          backgroundColor: barColor,
                          transition: 'width 0.4s ease',
                        }}
                      />
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
