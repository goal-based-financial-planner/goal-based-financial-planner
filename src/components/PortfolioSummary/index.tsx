import InvestmentSuggestions from '../../pages/Planner/components/PortFolioSummary/InvestmentSuggestions';
import React, { useState } from 'react';
import { PlannerData } from '../../domain/PlannerData';
import { Box, Button, Modal, Typography } from '@mui/material';
import Header from '../Header';
import InvestmentAllocations from '../InvestmentAllocations';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import { updateInvestmentAllocation } from '../../store/plannerDataActions';

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
    updateInvestmentAllocation(dispatch, plannerData.investmentAllocations);
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
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#B401B0',
              }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PortfolioSummary;
