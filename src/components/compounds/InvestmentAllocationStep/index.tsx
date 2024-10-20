import React, { Dispatch } from 'react';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step from '../../molecules/Step';
import { TermType } from '../../../types/enums';
import { PlannerData } from '../../../domain/PlannerData';
import InvestmentAllocation from '../../molecules/InvestmentAllocation/InvesmentAllocation';
import { Grid, Paper, Typography } from '@mui/material';
import {
  setShortTermInvestmentPercentage,
  setMidTermInvestmentPercentage,
  setLongTermInvestmentPercentage,
} from '../../../store/plannerDataActions';
import CustomPaper from '../../atoms/CustomPaper';

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

  return (
    <Step title={'Investment Allocation'}>
      <Grid container columnGap={1}>
        {Object.values(TermType).map((termType) => {
          const shouldHidePieChart = areGoalsPresentOfType(termType);
          if (shouldHidePieChart) {
            return (
              <Grid xs={3.9}>
                <Paper>
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
                </Paper>
              </Grid>
            );
          }
          return null;
        })}
      </Grid>
    </Step>
  );
};

export default InvestmentAllocationStep;
