import { Box, Grid2 as Grid } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React from 'react';
import InvesmentSuggestionCard from './InvesmentSuggestionCard';
import { InvestmentPerOptionType } from '../../../../components/GoalWiseInvestmentSuggestion';

type InvestmentSuggestionsGridProps = {
  suggestions: GoalWiseInvestmentSuggestions[];
};
const InvestmentSuggestionsGrid: React.FC<InvestmentSuggestionsGridProps> = ({
  suggestions,
}) => {
  const investmentOptionWiseSum = suggestions.reduce(
    (acc, goal) => {
      goal.investmentSuggestions.forEach(({ investmentName, amount }) => {
        acc[investmentName] = (acc[investmentName] || 0) + amount;
      });
      return acc;
    },
    {} as { [key: string]: number },
  );

  const investmentAllocationSummary = Object.entries(
    investmentOptionWiseSum,
  ).map(([investmentName, totalValue]) => ({
    investmentName,
    totalValue,
  }));

  const getAmountPerGoalForInvestmentOption = (investmentName: string) => {
    const arr: InvestmentPerOptionType[] = [];
    suggestions.forEach((suggestion) => {
      suggestion.investmentSuggestions.forEach((i) => {
        if (i.investmentName === investmentName) {
          arr.push({ goalName: suggestion.goalName, amount: i.amount });
        }
      });
    });
    return arr;
  };

  return (
    <Grid container rowGap={2} columnGap={2}>
      {investmentAllocationSummary.map((option, index) => (
        <Grid size={1.7} key={index}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
            }}
          >
            <InvesmentSuggestionCard
              investmentName={option.investmentName}
              totalValue={option.totalValue}
              goalDetails={getAmountPerGoalForInvestmentOption(
                option.investmentName,
              )}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default InvestmentSuggestionsGrid;
