import { Dispatch, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SIPEntry } from '../../../../types/investmentLog';
import { formatCurrency } from '../../../../types/util';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { deleteInvestmentLogEntry } from '../../../../store/plannerDataActions';
import SIPForm from '../GoalCard/components/LogEntryForm';
import { cardSx } from './styles';

type ActiveSipsCardProps = {
  sips: SIPEntry[];
  investmentTypes: string[];
  dispatch: Dispatch<PlannerDataAction>;
};

const DEPOSIT_PATTERN = /deposit|\bfd\b|ppf|nps|bond|g-sec|provident|pension/i;

/** "Large Cap Equity Mutual Funds" → "Large Cap" for the compact caption. */
const shortType = (type: string) =>
  type.replace(/\s*(Equity\s+)?Mutual Funds?$/i, '').trim() || type;

const ActiveSipsCard = ({ sips, investmentTypes, dispatch }: ActiveSipsCardProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SIPEntry | undefined>(undefined);

  const openForm = (entry?: SIPEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  return (
    <Box sx={cardSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: 17, mr: 'auto' }}>
          Active SIPs
        </Typography>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11 }}>
          {sips.length} linked
        </Typography>
      </Box>

      {sips.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No SIPs logged yet. Link an investment to track it against your plan.
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: 0, pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflowY: 'auto' }}
        >
          {sips.map((sip) => {
            const isDeposit = DEPOSIT_PATTERN.test(sip.type);
            return (
              <Box
                component="li"
                key={sip.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDeposit ? 'warning.main' : 'primary.main',
                  }}
                >
                  {isDeposit ? <AccountBalanceIcon sx={{ fontSize: 18 }} /> : <ShowChartIcon sx={{ fontSize: 18 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={sip.name}>
                    {sip.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    title={sip.type}
                    sx={{ display: 'block', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.3 }}
                  >
                    {shortType(sip.type)} · Monthly
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                  {formatCurrency(sip.monthlyAmount)}
                </Typography>
                <IconButton size="small" aria-label={`Edit ${sip.name}`} onClick={() => openForm(sip)} sx={{ color: 'text.disabled' }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={`Delete ${sip.name}`}
                  onClick={() => deleteInvestmentLogEntry(dispatch, sip.id)}
                  sx={{ color: 'text.disabled', ml: -1, '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      )}

      <Box
        component="button"
        type="button"
        onClick={() => openForm(undefined)}
        sx={{
          all: 'unset',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'block',
          width: '100%',
          textAlign: 'center',
          mt: 2,
          py: 1,
          borderRadius: 2.5,
          border: '1px dashed',
          borderColor: '#D4D4D2',
          fontSize: 13,
          fontWeight: 500,
          color: 'text.secondary',
          '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        + Link Another Investment
      </Box>

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

export default ActiveSipsCard;
