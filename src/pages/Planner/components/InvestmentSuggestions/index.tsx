import { Box, Typography, Grid2 as Grid, Modal, Button } from '@mui/material';

import { PlannerData } from '../../../../domain/PlannerData';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { TermType } from '../../../../types/enums';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React, { useState } from 'react';
import InvestmentSuggestionsDoughnutChart from '../InvestmentSuggestionsDoughnutChart';
import InvestmentAllocations from '../InvestmentAllocations';
import InvestmentPieChart from '../InvestmentPieChart';
import CustomLegend from '../CustomLegend';
import { StyledBox } from '../../../../components/StyledBox';

const InvestmentSuggestions = ({
  plannerData,
  dispatch,
  investmentBreakdownBasedOnTermType,
}: {
  plannerData: PlannerData;
  dispatch: React.Dispatch<PlannerDataAction>;
  investmentBreakdownBasedOnTermType: {
    termType: TermType;
    investmentBreakdown: GoalWiseInvestmentSuggestions[];
  }[];
}) => {
  const [termTypeModal, setTermTypeModal] = useState<TermType | null>(null);
  const handleEdit = (termType: TermType) => {
    setTermTypeModal(termType);
  };

  const handleClose = () => setTermTypeModal(null);

  const handleSubmit = () => {
    setTermTypeModal(null);
  };

  return (
    <>
      <Grid container>
        <Grid size={12} sx={{ ml: 2 }}>
          {investmentBreakdownBasedOnTermType
            .filter(({ investmentBreakdown }) =>
              investmentBreakdown.find(
                (ib) => ib.investmentSuggestions.length > 0,
              ),
            )
            .map((term) => (
              <StyledBox mb={2} className="investment-plan-box">
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {term.termType} Investment Plan
                  </Typography>
                  <Button
                    onClick={() => handleEdit(term.termType)}
                    sx={{ color: 'green' }}
                    className="customize-button"
                  >
                    <span className="material-symbols-rounded">tune</span>
                  </Button>
                </Box>
                <Grid container justifyContent={'center'} alignItems={'center'}>
                  <Grid
                    size={3.5}
                    display="flex"
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <InvestmentPieChart
                      allocations={
                        plannerData.investmentAllocations[term.termType]
                      }
                    />
                  </Grid>
                  <Grid
                    size={1}
                    display="flex"
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <span
                      className="material-symbols-rounded"
                      style={{ fontSize: '80px' }}
                    >
                      double_arrow
                    </span>
                  </Grid>

                  <Grid
                    size={3.5}
                    display="flex"
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <InvestmentSuggestionsDoughnutChart
                      suggestions={term.investmentBreakdown}
                    />
                  </Grid>
                  <Grid
                    size={4}
                    display="flex"
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <CustomLegend suggestions={term.investmentBreakdown} />
                  </Grid>
                </Grid>
              </StyledBox>
            ))}
        </Grid>
      </Grid>
      <Modal
        open={termTypeModal !== null}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(1px)',
        }}
      >
        <InvestmentAllocations
          dispatch={dispatch}
          plannerData={plannerData}
          onSubmit={handleSubmit}
          termType={termTypeModal!}
        />
      </Modal>
    </>
  );
};

export default InvestmentSuggestions;
