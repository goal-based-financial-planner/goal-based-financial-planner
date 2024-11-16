import InvestmentSuggestions from '../../molecules/PortFolioSummary/InvestmentSuggestions';
import Step from '../../molecules/Step';
import React from 'react';
import { PlannerData } from '../../../domain/PlannerData';
import { Box, Typography } from '@mui/material';

type PortFolioSummaryProps = {
  plannerData: PlannerData;
};

const PortfolioSummaryStep: React.FC<PortFolioSummaryProps> = ({
  plannerData,
}) => {
  return (
    <Box sx={{ padding: 3, width: '100%' }}>
      <Typography variant="h4">Your Investment Suggestions </Typography>
      <InvestmentSuggestions plannerData={plannerData} />
    </Box>
  );
};

export default PortfolioSummaryStep;
