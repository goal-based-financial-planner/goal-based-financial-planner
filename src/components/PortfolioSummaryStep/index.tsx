import InvestmentSuggestions from '../../pages/Planner/components/PortFolioSummary/InvestmentSuggestions';
import React from 'react';
import { PlannerData } from '../../domain/PlannerData';
import { Box } from '@mui/material';
import Header from '../Header';

type PortFolioSummaryProps = {
  plannerData: PlannerData;
};

const PortfolioSummary: React.FC<PortFolioSummaryProps> = ({ plannerData }) => {
  return (
    <>
      <Box sx={{ padding: 3, width: '100%' }}>
        <Header title="Your Investment Suggestions" />
      </Box>
      <Box sx={{ px: 3 }}>
        <InvestmentSuggestions plannerData={plannerData} />
      </Box>
    </>
  );
};

export default PortfolioSummary;
