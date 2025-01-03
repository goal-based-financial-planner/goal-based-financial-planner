import { Box, Typography, Grid2 as Grid, Modal, Button } from '@mui/material';
import { StyledBox } from '../..';
import { PlannerData } from '../../../../domain/PlannerData';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { TermType } from '../../../../types/enums';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React, { useState } from 'react';
import DoughnutChart from '../../../../components/DoughnutChart';
import InvestmentAllocations from '../../components/InvestmentAllocations';
import InvestmentPieChart from '../../components/InvestmentPieChart';
import CustomLegend from '../Customlegend';

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
              <StyledBox mb={2}>
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
                    variant="outlined"
                  >
                    Customize
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
                    <DoughnutChart suggestions={term.investmentBreakdown} />
                  </Grid>
                  <Grid
                    size={4}
                    display="flex"
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <CustomLegend
                      plannerData={plannerData}
                      termType={term.termType}
                      suggestions={term.investmentBreakdown}
                    />
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
