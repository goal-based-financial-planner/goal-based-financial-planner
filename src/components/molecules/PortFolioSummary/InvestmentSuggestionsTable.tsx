import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../../hooks/useInvestmentCalculator';
import React from 'react';
import GoalWiseInvestmentSuggestion, {
  InvestmentPerOptionType,
} from '../../compounds/GoalWiseInvestmentSuggestion';
import { InvestmentOptionType } from '../../../domain/InvestmentOptions';

type InvestmentSuggestionsTableProps = {
  suggestions: GoalWiseInvestmentSuggestions[];
  investmentOptions: InvestmentOptionType[];
};
const InvestmentSuggestionsTable: React.FC<InvestmentSuggestionsTableProps> = ({
  suggestions,
  investmentOptions,
}) => {
  const investmentOptionWiseSum = suggestions.reduce(
    (acc, goal) => {
      goal.investmentSuggestions.forEach(({ investmentOptionId, amount }) => {
        acc[investmentOptionId] = (acc[investmentOptionId] || 0) + amount;
      });
      return acc;
    },
    {} as { [key: string]: number },
  );

  const investmentOptionSummary = Object.entries(investmentOptionWiseSum).map(
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
          {investmentOptionSummary.map((goal, index) => (
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
                <Tooltip title={undefined}>
                  <GoalWiseInvestmentSuggestion
                    investmentPerOption={getAmountPerGoalForInvestmentOption(
                      goal.investmentOptionId,
                    )}
                  />
                </Tooltip>

                {/* <CustomTooltip
                  tooltipText={
                    <GoalWiseInvestmentSuggestion
                      investmentPerOption={getAmountPerGoalForInvestmentOption(
                        goal.investmentOptionId,
                      )}
                    />
                  }
                /> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvestmentSuggestionsTable;
