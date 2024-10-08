import React, { Dispatch } from 'react';
import { PlannerDataAction } from '../../../store/plannerDataReducer';
import Step from '../../molecules/Step';
import { TermType } from '../../../types/enums';
import { PlannerData } from '../../../domain/PlannerData';
import InvestmentAllocation from '../../molecules/InvestmentAllocation/InvesmentAllocation';
import { Grid } from '@mui/material';
import {
  setShortTermInvestmentPercentage,
  setMidTermInvestmentPercentage,
  setLongTermInvestmentPercentage,
} from '../../../store/plannerDataActions';

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

  return (
    <Step title={'Investment Allocation'}>
      <Grid container>
        {Object.values(TermType).map((termType) => {
          return (
            <Grid xs={4}>
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
            </Grid>
          );
        })}
      </Grid>
    </Step>
  );
};

export default InvestmentAllocationStep;
