import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

const terms = [
  {
    label: 'Short Term',
    color: '#e3f2fd',
    chipColor: 'info' as const,
    timeline: 'Up to 3 years',
    examples: 'Emergency fund, vacation, gadget purchase',
    allocation: 'Mostly debt instruments — lower risk, stable returns',
  },
  {
    label: 'Medium Term',
    color: '#f3e5f5',
    chipColor: 'secondary' as const,
    timeline: '3 – 7 years',
    examples: 'Car, home down payment, higher education',
    allocation: 'Balanced mix of equity and debt',
  },
  {
    label: 'Long Term',
    color: '#e8f5e9',
    chipColor: 'success' as const,
    timeline: '7+ years',
    examples: 'Retirement, child\'s education, buying a home',
    allocation: 'Mostly equity — higher growth potential over time',
  },
];

const ConceptsStep: React.FC = () => (
  <Box sx={{ py: 1 }}>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      How goals and allocations work
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Every goal belongs to a term category based on when you need the money. The app uses this to suggest how to split your investment across equity, debt, and gold.
    </Typography>
    <Stack spacing={2}>
      {terms.map((t) => (
        <Box
          key={t.label}
          sx={{
            bgcolor: t.color,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Chip label={t.label} color={t.chipColor} size="small" />
            <Typography variant="body2" color="text.secondary">
              {t.timeline}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Examples:</strong> {t.examples}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t.allocation}
          </Typography>
        </Box>
      ))}
    </Stack>
  </Box>
);

export default ConceptsStep;
