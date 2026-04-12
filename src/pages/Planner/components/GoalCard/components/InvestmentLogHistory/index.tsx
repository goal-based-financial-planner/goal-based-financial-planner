import { Box, Chip, IconButton, Typography } from '@mui/material';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { formatCurrency } from '../../../../../../types/util';

type Props = {
  sips: SIPEntry[];
  onEdit: (entry: SIPEntry) => void;
  onDelete: (entryId: string) => void;
};

const SIPList = ({ sips, onEdit, onDelete }: Props) => {
  if (sips.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No SIPs added yet — use the button above to start tracking.
      </Typography>
    );
  }

  // Group by type
  const groups: Record<string, SIPEntry[]> = {};
  for (const sip of sips) {
    if (!groups[sip.type]) groups[sip.type] = [];
    groups[sip.type].push(sip);
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Your SIPs
      </Typography>
      {Object.entries(groups).map(([type, entries]) => {
        const groupTotal = entries.reduce((sum, s) => sum + s.monthlyAmount, 0);
        return (
          <Box key={type} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: 'text.secondary' }}
              >
                {type}
              </Typography>
              <Chip
                label={`${formatCurrency(groupTotal)}/mo`}
                size="small"
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
            </Box>
            {entries.map((sip) => (
              <Box
                key={sip.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.25,
                  pl: 1,
                }}
              >
                <Typography variant="caption" sx={{ flex: 1, minWidth: 0 }} noWrap>
                  {sip.name}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ mx: 1, whiteSpace: 'nowrap' }}
                >
                  {formatCurrency(sip.monthlyAmount)}/mo
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onEdit(sip)}
                  aria-label="edit"
                  sx={{ p: 0.25 }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                    edit
                  </span>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(sip.id)}
                  aria-label="delete"
                  sx={{ p: 0.25, color: 'error.main' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                    delete
                  </span>
                </IconButton>
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default SIPList;
