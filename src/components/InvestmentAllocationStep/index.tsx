import React, { Dispatch } from 'react';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import { TermType } from '../../types/enums';
import { PlannerData } from '../../domain/PlannerData';
import InvestmentAllocation from '../../pages/Planner/components/InvesmentAllocation';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import {
  setShortTermInvestmentPercentage,
  setMidTermInvestmentPercentage,
  setLongTermInvestmentPercentage,
} from '../../store/plannerDataActions';

type InvestmentAllocationProps = {
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
};

export interface ToolTipVisibilityState {
  [TermType.SHORT_TERM]?: boolean;
  [TermType.MEDIUM_TERM]?: boolean;
  [TermType.LONG_TERM]?: boolean;
}

const InvestmentAllocationStep: React.FC<InvestmentAllocationProps> = ({
  plannerData,
  dispatch,
}) => {
  const handlePercentageChangeForTerm = (
    selectedOption: string,
    updatedPercent: number,
    type: TermType,
  ) => {
    switch (type) {
      case TermType.SHORT_TERM:
        return setShortTermInvestmentPercentage(dispatch, {
          id: selectedOption,
          investmentPercentage: updatedPercent,
        });
      case TermType.MEDIUM_TERM:
        return setMidTermInvestmentPercentage(dispatch, {
          id: selectedOption,
          investmentPercentage: updatedPercent,
        });
      case TermType.LONG_TERM:
        return setLongTermInvestmentPercentage(dispatch, {
          id: selectedOption,
          investmentPercentage: updatedPercent,
        });
      default:
        return setShortTermInvestmentPercentage(dispatch, {
          id: selectedOption,
          investmentPercentage: updatedPercent,
        });
    }
  };

  const areGoalsPresentOfType = (column: TermType) => {
    return plannerData
      .getFinancialGoalSummary()
      .some((item) => item.termType === column && item.numberOfGoals > 0);
  };

  const theme = useTheme();

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', padding: 3 }}>
        <Typography variant="h4">Your Investment Allocations </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'top',
          width: '100vw',
          gap: 4,
        }}
      >
        {Object.values(TermType).map((termType) => {
          const shouldHidePieChart = areGoalsPresentOfType(termType);
          if (shouldHidePieChart) {
            return (
              <Card
                sx={{
                  maxWidth: '350px',
                  border: `4px solid ${theme.palette.cardBackGround.main}`,
                }}
              >
                <CardContent>
                  <Box>
                    <Typography variant={'h6'} sx={{ textAlign: 'center' }}>
                      {termType}
                    </Typography>
                    <InvestmentAllocation
                      allocations={plannerData.investmentAllocations[termType]}
                      handlePercentageChange={(
                        selectedOption: string,
                        percent: number,
                      ) =>
                        handlePercentageChangeForTerm(
                          selectedOption,
                          percent,
                          termType,
                        )
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </Box>
    </>
  );
};

export default InvestmentAllocationStep;
