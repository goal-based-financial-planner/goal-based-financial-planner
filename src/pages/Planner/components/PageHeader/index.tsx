import React from 'react';
import { Box, Typography } from '@mui/material';

type PageHeaderProps = {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
};

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2,
      mb: 3,
    }}
  >
    <Box>
      <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {actions && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>{actions}</Box>
    )}
  </Box>
);

export default PageHeader;
