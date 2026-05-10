import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import icon from '../../../../../assets/icon.png';

const benefits = [
  { icon: <TrackChangesIcon color="primary" />, text: 'Define financial goals by timeline — short, medium, or long term' },
  { icon: <PieChartIcon color="primary" />, text: 'Get automatic investment allocation suggestions across equity, debt, and gold' },
  { icon: <TrendingUpIcon color="primary" />, text: 'Track progress over time and see exactly how much to invest each month' },
];

const WelcomeStep: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 2 }}>
    <img src={icon} alt="app icon" style={{ width: 56, marginBottom: 16 }} />
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Plan your financial future, goal by goal
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
      A simple, privacy-first planner that lives entirely in your browser — no accounts, no servers.
    </Typography>
    <Stack spacing={2} sx={{ textAlign: 'left' }}>
      {benefits.map((b, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {b.icon}
          <Typography variant="body2">{b.text}</Typography>
        </Box>
      ))}
    </Stack>
  </Box>
);

export default WelcomeStep;
