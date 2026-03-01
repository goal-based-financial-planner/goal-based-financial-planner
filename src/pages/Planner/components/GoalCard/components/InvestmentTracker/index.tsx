import {
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Dispatch, useState } from 'react';
import { PlannerDataAction } from '../../../../../../store/plannerDataReducer';
import { deleteInvestmentLogEntry } from '../../../../../../store/plannerDataActions';
import { InvestmentSuggestion } from '../../../../../../types/planner';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { buildSIPComparison, totalMonthlySIP } from '../../../../../../domain/investmentLog';
import { formatNumber } from '../../../../../../types/util';
import SIPForm from '../LogEntryForm';
import SIPList from '../InvestmentLogHistory';

type Props = {
  investmentSuggestions: InvestmentSuggestion[];
  sips: SIPEntry[];
  dispatch: Dispatch<PlannerDataAction>;
};

const InvestmentTracker = ({
  investmentSuggestions,
  sips = [],
  dispatch,
}: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SIPEntry | undefined>(undefined);

  const monthlyTotal = totalMonthlySIP(sips);
  const monthlyTarget = investmentSuggestions.reduce((sum, s) => sum + s.amount, 0);
  const totalDiff = monthlyTotal - monthlyTarget;

  const comparison = buildSIPComparison(sips, investmentSuggestions);
  const investmentTypes = investmentSuggestions.map((s) => s.investmentName);

  const handleOpenAdd = () => {
    setEditingEntry(undefined);
    setFormOpen(true);
  };

  const handleEdit = (entry: SIPEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleDelete = (entryId: string) => {
    deleteInvestmentLogEntry(dispatch, entryId);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Summary row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          p: 1.5,
          borderRadius: 1,
          backgroundColor: 'action.hover',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Your Monthly SIPs
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            ₹{formatNumber(monthlyTotal)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Monthly Suggested
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            ₹{formatNumber(monthlyTarget)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Difference
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color={totalDiff >= 0 ? 'success.main' : 'error.main'}
          >
            {totalDiff >= 0 ? '+' : ''}₹{formatNumber(Math.abs(totalDiff))}
          </Typography>
        </Box>
      </Box>

      {/* Add SIP button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenAdd}
          startIcon={<span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>}
        >
          Add SIP
        </Button>
      </Box>

      {/* Comparison table */}
      {comparison.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Comparison by instrument type
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', pl: 0 }}>
                  Type
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Suggested
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Actual
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.7rem', color: 'text.secondary', pr: 0 }}>
                  Diff
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparison.map((row) => (
                <TableRow key={row.type}>
                  <TableCell sx={{ fontSize: '0.7rem', pl: 0, maxWidth: 110, wordBreak: 'break-word' }}>
                    {row.type}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.7rem' }}>
                    ₹{formatNumber(row.suggestedAmount)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.7rem' }}>
                    ₹{formatNumber(row.actualAmount)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: '0.7rem',
                      pr: 0,
                      color: row.difference >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {row.difference >= 0 ? '+' : ''}₹{formatNumber(Math.abs(row.difference))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* SIP list */}
      {sips.length > 0 && (
        <>
          <Divider sx={{ mb: 1.5 }} />
          <SIPList sips={sips} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      )}

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
