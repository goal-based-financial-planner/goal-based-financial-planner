import { Box, Card, Grid2 as Grid, Typography } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React from 'react';
import { InvestmentPerOptionType } from '../../../../components/GoalWiseInvestmentSuggestion';
import { DEFAULT_INVESTMENT_OPTIONS } from '../../../../domain/constants';

type InvestmentSuggestionsGridProps = {
  suggestions: GoalWiseInvestmentSuggestions[];
};
const InvestmentSuggestionsGrid: React.FC<InvestmentSuggestionsGridProps> = ({
  suggestions,
}) => {
  const colorPalette = [
    '#E1E0D0',
    '#CBC5B5',
    '#CDB3A1',
    '#AFAEA0',
    '#636667',
    '#F3EDD8',
    '#F6B7AA',
    '#6D7B7B',
    '#E3E1CD',
    '#B4C1B0',
    '#BDBEAB',
    '#DDDBCA',
    '#B3B4AD',
    '#A9A696',
  ];

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
      {
        // Design a card which shows an icon and the investment name, return percentage and amount. The card should show icon in the middle and the text content at the bottom. The card should be clickable and should flip on click to show some dummy text. Keep 4 cards per row in the grid
        investmentAllocationSummary.map((option, index) => (
          <Grid size={2} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',

                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  height: '150px',
                  backgroundColor: colorPalette[index % colorPalette.length],
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: '64px', color: '#000000' }}
                  >
                    {DEFAULT_INVESTMENT_OPTIONS.find(
                      (o) => o.investmentName === option.investmentName,
                    )?.materialIconName || 'account_balance'}
                  </span>
                </Box>
              </Box>

              <Box sx={{ padding: 1, height: '50px' }}>
                <Typography
                  sx={{
                    fontSize: '16px',
                  }}
                >
                  {option.investmentName || ''}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  px: 1,
                  pb: 1,
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '20px' }}>
                  {option.totalValue.toLocaleString(navigator.language, {
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))
      }
    </Grid>
    // <TableContainer component={Paper}>
    //   <Table>
    //     <TableHead>
    //       <TableRow>
    //         <TableCell>Investment Name</TableCell>
    //         <TableCell>Amount </TableCell>
    //       </TableRow>
    //     </TableHead>
    //     <TableBody>
    //       {investmentOptionSummary.map((goal, index) => (
    //         <TableRow key={index}>
    //           <TableCell>
    //             {
    //               investmentOptions.filter(
    //                 (o) => o.id === goal.investmentOptionId,
    //               )[0].investmentName
    //             }
    //           </TableCell>

    //           <TableCell>
    //             {goal.totalValue.toLocaleString(navigator.language, {
    //               maximumFractionDigits: 0,
    //             })}
    //             {/* <Tooltip title={undefined}>
    //               <GoalWiseInvestmentSuggestion
    //                 investmentPerOption={getAmountPerGoalForInvestmentOption(
    //                   goal.investmentOptionId,
    //                 )}
    //               />
    //             </Tooltip> */}

    //             {/* <CustomTooltip
    //               tooltipText={
    //                 <GoalWiseInvestmentSuggestion
    //                   investmentPerOption={getAmountPerGoalForInvestmentOption(
    //                     goal.investmentOptionId,
    //                   )}
    //                 />
    //               }
    //             /> */}
    //           </TableCell>
    //         </TableRow>
    //       ))}
    //     </TableBody>
    //   </Table>
    // </TableContainer>
  );
};

export default InvestmentSuggestionsGrid;
