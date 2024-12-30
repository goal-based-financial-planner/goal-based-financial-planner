import {
  Box,
  Typography,
  Grid2 as Grid,
  Chip,
  LinearProgress,
  linearProgressClasses,
  styled,
  Divider,
} from '@mui/material';
import { TermType } from '../../../../types/enums';
import { PlannerData } from '../../../../domain/PlannerData';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

const TermwiseProgress = ({
  plannerData,
  investmentBreakdownBasedOnTermType,
}: {
  plannerData: PlannerData;
  investmentBreakdownBasedOnTermType: {
    termType: TermType;
    investmentBreakdown: GoalWiseInvestmentSuggestions[];
  }[];
}) => {
  const getSumByTermType = (termType: TermType) => {
    return plannerData.financialGoals
      .filter((goal) => goal.getTermType() === termType)
      .reduce((sum, goal) => sum + goal.getInflationAdjustedTargetAmount(), 0);
  };

  const getTermBasedGoalNames = (termType: TermType) => {
    return plannerData.financialGoals
      .filter((term) => term.getTermType() === termType)
      .map((term) => term.goalName);
  };

  const doInvestmentsExistForTermType = (termType: TermType) => {
    return (
      investmentBreakdownBasedOnTermType.find((ib) => ib.termType === termType)!
        .investmentBreakdown.length > 0
    );
  };

  const progressPercent = (termType: TermType) => {
    const termTypeAmount =
      getSumByTermType(termType) === 0 ? 1 : getSumByTermType(termType);
    return (
      (investmentBreakdownBasedOnTermType
        .find((term) => term.termType === termType)
        ?.investmentBreakdown.reduce((acc, val) => acc + val.currentValue, 0)! /
        termTypeAmount) *
      100
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'start',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Financial Progress
        </Typography>
      </Box>
      <Grid container pt={1}>
        {[TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].map(
          (termType, index, array) => {
            return (
              <>
                {doInvestmentsExistForTermType(termType) ? (
                  <>
                    <Grid size={4} sx={{ padding: 2 }}>
                      <Box mb={2}>
                        <BorderLinearProgress
                          value={Math.round(progressPercent(termType)!)}
                          variant="determinate"
                          sx={{
                            [`& .${linearProgressClasses.barColorPrimary}`]: {
                              backgroundColor:
                                termType === TermType.SHORT_TERM
                                  ? 'orange'
                                  : termType === TermType.MEDIUM_TERM
                                    ? 'blue'
                                    : 'green',
                            },
                            [`& .${linearProgressClasses.colorSecondary}`]: {
                              backgroundColor: 'grey',
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ padding: '16px' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="body1">{termType}</Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {getSumByTermType(termType).toLocaleString(
                              navigator.language,
                            )}
                          </Typography>
                        </Box>

                        <Box mt={3}>
                          {getTermBasedGoalNames(termType).map((name) => (
                            <Chip
                              key={name}
                              label={name}
                              color="info"
                              size="small"
                              sx={{
                                width: 'auto',
                                height: '20px',
                                mr: 1,
                                mb: 1,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        borderStyle: 'dashed',
                        marginX: -1,
                      }}
                    />
                  </>
                ) : null}
              </>
            );
          },
        )}
      </Grid>
    </>
  );
};

export default TermwiseProgress;
