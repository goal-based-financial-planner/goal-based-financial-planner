import { Box, Card, Grid2 as Grid, Typography } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import React from 'react';
import { InvestmentPerOptionType } from '../../../../components/GoalWiseInvestmentSuggestion';
import { InvestmentOptionType } from '../../../../domain/InvestmentOptions';

type InvestmentSuggestionsGridProps = {
  suggestions: GoalWiseInvestmentSuggestions[];
  investmentOptions: InvestmentOptionType[];
};
const InvestmentSuggestionsGrid: React.FC<InvestmentSuggestionsGridProps> = ({
  suggestions,
  investmentOptions,
}) => {
  const colorPalette = [
    '#E1E0D0',
    '#CBC5B5',
    '#CDB3A1',
    '#AFAEA0',
    '#A9A899',
    '#ACA392',
    '#A6A191',
    '#A29F91',
    '#928F86',
    '#636667',
  ];

  const investmentOptionWiseSum = suggestions.reduce(
    (acc, goal) => {
      goal.investmentSuggestions.forEach(({ investmentOptionId, amount }) => {
        acc[investmentOptionId] = (acc[investmentOptionId] || 0) + amount;
      });
      return acc;
    },
    {} as { [key: string]: number },
  );

  const investmentAllocationSummary = Object.entries(
    investmentOptionWiseSum,
  ).map(([investmentOptionId, totalValue]) => ({
    investmentOptionId,
    totalValue,
  }));

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
                    {investmentOptions.find(
                      (o) => o.id === option.investmentOptionId,
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
                  {investmentOptions.find(
                    (o) => o.id === option.investmentOptionId,
                  )?.investmentName || ''}
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
                <Typography sx={{ fontSize: '12px', fontWeight: 'italic' }}>
                  @
                  {investmentOptions.find(
                    (o) => o.id === option.investmentOptionId,
                  )?.expectedReturnPercentage || 0}
                  %
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