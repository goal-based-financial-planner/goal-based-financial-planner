import { Box, Typography, Grid2 as Grid } from '@mui/material';
import { StyledBox } from '../..';
import { PlannerData } from '../../../../domain/PlannerData';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { TermType } from '../../../../types/enums';
import useInvestmentCalculator from '../../hooks/useInvestmentCalculator';
import React from 'react';
import DoughnutChart from '../../../../components/DoughtnutCHart';

const InvestmentSuggestions = ({
  plannerData,
  dispatch,
  selectedYear,
}: {
  plannerData: PlannerData;
  dispatch: React.Dispatch<PlannerDataAction>;
  selectedYear: number;
}) => {
  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);

  const investmentBreakdownBasedOnTermType = [
    TermType.SHORT_TERM,
    TermType.MEDIUM_TERM,
    TermType.LONG_TERM,
  ].map((termType) => {
    const investmentBreakdown = calculateInvestmentNeededForGoals(
      plannerData,
      Number(selectedYear),
      termType,
    );
    return { termType, investmentBreakdown };
  });

  return (
    <>
      <Box
        sx={{
          pl: 2,
          pt: 2,
          display: 'flex',
          flexDirection: 'row',
          gap: 3,
        }}
      >
        <Typography variant="h4">Investment Plan</Typography>
        <Box
          ml={3}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              transform: 'scale(1.05)',
            },
          }}
        >
          <span
            className="material-symbols-rounded dashboard-widget"
            style={{
              fontSize: '40px',
              transition: 'color 0.3s ease',
              fontWeight: 'bold',
            }}
          >
            edit
          </span>
        </Box>
      </Box>
      <Grid container>
        <Grid size={12} sx={{ padding: 2 }}>
          {investmentBreakdownBasedOnTermType.map((term) => (
            <StyledBox mb={2}>
              <Box>
                <Typography variant="h6">{term.termType}</Typography>
              </Box>
              <DoughnutChart suggestions={term.investmentBreakdown} />
            </StyledBox>
          ))}
        </Grid>
      </Grid>
    </>
  );
};

export default InvestmentSuggestions;
