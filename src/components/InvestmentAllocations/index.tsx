import React, { Dispatch } from 'react';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import { TermType } from '../../types/enums';
import { PlannerData } from '../../domain/PlannerData';
import InvestmentAllocationPerTerm from '../../pages/Planner/components/InvesmentAllocationPerTerm';
import { Box, Card, Tab, Tabs, Typography } from '@mui/material';
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const InvestmentAllocations: React.FC<InvestmentAllocationProps> = ({
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

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  return (
    <Box>
      <Tabs value={value} onChange={handleChange}>
        {Object.values(TermType).map((termType) => {
          const shouldShowAllocations = areGoalsPresentOfType(termType);
          if (shouldShowAllocations) {
            return <Tab label={termType} />;
          }
          return '';
        })}
      </Tabs>

      {Object.values(TermType)
        .filter((termType) => areGoalsPresentOfType(termType))
        .map((termType, index) => (
          <CustomTabPanel index={index} value={value} key={index}>
            <InvestmentAllocationPerTerm
              allocations={plannerData.investmentAllocations[termType]}
              handlePercentageChange={(
                selectedOption: string,
                percent: number,
              ) =>
                handlePercentageChangeForTerm(selectedOption, percent, termType)
              }
            />
          </CustomTabPanel>
        ))}
    </Box>
  );
};

export default InvestmentAllocations;
