import * as React from 'react';
import { ChangeEvent, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Grid2 as Grid, Typography } from '@mui/material';
import { PlannerData } from '../../../../domain/PlannerData';
import useInvestmentCalculator from '../../hooks/useInvestmentCalculator';
import { PieChart } from '@mui/x-charts/PieChart';
import InvestmentSuggestionsGrid from './InvestmentSuggestionsGrid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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

type InvestmentSuggestionsProps = {
  plannerData: PlannerData;
};
const InvestmentSuggestions: React.FC<InvestmentSuggestionsProps> = ({
  plannerData,
}) => {
  const [selectedYear, setSelectedYear] = React.useState(0);

  useEffect(() => {
    const minMaxYears = plannerData.financialGoals.reduce(
      (acc, e) => ({
        minYear: Math.min(acc.minYear, e.getInvestmentStartYear()),
        maxYear: Math.max(acc.maxYear, e.getTargetYear()),
      }),
      { minYear: Infinity, maxYear: 0 },
    );
    // Build an array of values between minYear and maxYear
    const years = [];
    for (let i = minMaxYears.minYear; i <= minMaxYears.maxYear; i++) {
      years.push(i);
    }
    setSelectedYear(years[0]);
  }, [plannerData]);

  const { calculateInvestmentNeededForGoals } =
    useInvestmentCalculator(plannerData);
  const investmentBreakdown = calculateInvestmentNeededForGoals(
    plannerData,
    selectedYear,
  );

  const getAmountPerInvestmentOption = () => {
    const aggregatedAmounts: { [key: string]: number } = {};

    investmentBreakdown.forEach((suggestion) => {
      suggestion.investmentSuggestions.forEach((i) => {
        const investmentOptionId = i.investmentOptionId;
        const amount = i.amount;
        if (aggregatedAmounts.hasOwnProperty(investmentOptionId)) {
          aggregatedAmounts[investmentOptionId] += amount;
        } else {
          aggregatedAmounts[investmentOptionId] = amount;
        }
      });
    });

    return Object.entries(aggregatedAmounts).map(
      ([investmentOptionId, totalAmount]) => {
        const investmentName = plannerData.investmentOptions.find(
          (o) => o.id === investmentOptionId,
        )?.investmentName;
        return { label: investmentName, value: Math.round(totalAmount) };
      },
    );
  };

  return (
    <InvestmentSuggestionsGrid
      suggestions={investmentBreakdown}
      investmentOptions={plannerData.investmentOptions}
    />
  );
};

export default InvestmentSuggestions;
