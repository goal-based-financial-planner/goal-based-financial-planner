import InvestmentSuggestions from './InvestmentSuggestions';
import React, { useState } from 'react';
import { PlannerData } from '../../../../domain/PlannerData';
import { Box, Modal, Typography } from '@mui/material';
import Header from '../../../../components/Header';
import InvestmentAllocations from '../InvestmentAllocations';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type PortFolioSummaryProps = {
  plannerData: PlannerData;
  dispatch: React.Dispatch<PlannerDataAction>;
};

const PortfolioSummary: React.FC<PortFolioSummaryProps> = ({
  plannerData,
  dispatch,
}) => {
  const [showModal, setShowModal] = useState(false);
  const handleEdit = () => {
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  const handleSubmit = () => {
    setShowModal(false);
  };
  return (
    <>
      <Header
        title="Your Investment Suggestions"
        iconName="edit"
        onAction={handleEdit}
      />

      <Box sx={{ px: 3 }}>
        <InvestmentSuggestions plannerData={plannerData} />
      </Box>
      <Modal
        open={showModal}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(1px)',
        }}
      >
        <Box
          sx={{
            width: '800px',
            height: '60vh',
            overflowY: 'auto',
            backgroundColor: '#E3E1CD',
            padding: 2,
            borderRadius: 2,
            margin: 'auto',
            position: 'absolute',
            boxShadow: 24,
          }}
        >
          <Typography
            sx={{
              fontSize: 30,
              display: 'flex',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            Investment Allocations
          </Typography>

          <Typography
            sx={{
              fontSize: 16,
              p: 2,
              display: 'flex',
            }}
          >
            Customize your investment options here.............
          </Typography>

          <InvestmentAllocations
            dispatch={dispatch}
            plannerData={plannerData}
            onSubmit={handleSubmit}
          />
        </Box>
      </Modal>
    </>
  );
};

export default PortfolioSummary;
