import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../../hooks/useInvestmentCalculator';
import React from 'react';
import useInvestmentOptions from '../../../hooks/useInvestmentOptions';
import CustomTooltip from '../../atoms/CustomTooltip';
import GoalWiseInvestmentSuggestion, {
  InvestmentPerOptionType,
} from '../../atoms/GoalWiseInvestmentSuggestion';

type InvestmentSuggestionsTableProps = {
  suggestions: GoalWiseInvestmentSuggestions[];
};
const InvestmentSuggestionsTable: React.FC<InvestmentSuggestionsTableProps> = ({
  suggestions,
}) => {
  const investmentOptions = useInvestmentOptions();

  const investmentOptionWiseSum = suggestions.reduce(
    (acc, goal) => {
      goal.investmentSuggestions.forEach(({ investmentOptionId, amount }) => {
        acc[investmentOptionId] = (acc[investmentOptionId] || 0) + amount;
      });
      return acc;
    },
    {} as { [key: string]: number },
  );

  const assetSumArray = Object.entries(investmentOptionWiseSum).map(
    ([investmentOptionId, totalValue]) => ({
      investmentOptionId,
      totalValue,
    }),
  );

  const getAmountPerGoalForInvestmentOption = (investmentOptionId: string) => {
    const arr: InvestmentPerOptionType[] = [];
    suggestions.forEach((suggestion) => {
      suggestion.investmentSuggestions.forEach((i) => {
        if (i.investmentOptionId === investmentOptionId) {
          arr.push({ goalName: suggestion.goalName, amount: i.amount });
        }
      });
    });
    return arr;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Investment Name</TableCell>
            <TableCell>Amount </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assetSumArray.map((goal, index) => (
            <TableRow key={index}>
              <TableCell>
                {
                  investmentOptions.filter(
                    (o) => o.id === goal.investmentOptionId,
                  )[0].investmentName
                }
              </TableCell>

              <TableCell>
                {goal.totalValue.toLocaleString(navigator.language, {
                  maximumFractionDigits: 0,
                })}
                <CustomTooltip
                  tooltipText={
                    <GoalWiseInvestmentSuggestion
                      investmentPerOption={getAmountPerGoalForInvestmentOption(
                        goal.investmentOptionId,
                      )}
                    />
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvestmentSuggestionsTable;
