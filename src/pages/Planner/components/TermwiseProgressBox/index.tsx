import {
  Box,
  Typography,
  Grid2 as Grid,
  Chip,
  LinearProgress,
  linearProgressClasses,
  styled,
  Divider,
  Tooltip,
} from '@mui/material';
import { TermType } from '../../../../types/enums';
import { PlannerData } from '../../../../domain/PlannerData';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { StyledBox } from '../../../../components/StyledBox';

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

const TermwiseProgressBox = ({
  plannerData,
  investmentBreakdownBasedOnTermType,
}: {
  plannerData: PlannerData;
  investmentBreakdownBasedOnTermType: {
    termType: TermType;
    investmentBreakdown: GoalWiseInvestmentSuggestions[];
  }[];
}) => {
  const numberOfTermsPresent = investmentBreakdownBasedOnTermType.filter(
    (a) => a.investmentBreakdown.length > 0,
  ).length;

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
    <StyledBox
      height={'250px'}
      sx={{ mx: 2, my: 2 }}
      className="financial-progress-box"
    >
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
          (termType) => {
            return (
              <>
                {doInvestmentsExistForTermType(termType) ? (
                  <>
                    <Grid size={12 / numberOfTermsPresent} sx={{ padding: 2 }}>
                      <Tooltip
                        title={`${Math.round(progressPercent(termType))}%`}
                        placement="top-end"
                        PopperProps={{
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -10],
                              },
                            },
                          ],
                        }}
                        slotProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: 'transparent',
                              boxShadow: 'none',
                              color: 'black',
                              fontSize: '1rem',
                              padding: 0,
                            },
                          },
                        }}
                      >
                        <Box>
                          <BorderLinearProgress
                            value={Math.round(progressPercent(termType)!)}
                            variant="determinate"
                            sx={{
                              [`& .${linearProgressClasses.barColorPrimary}`]: {
                                backgroundColor:
                                  termType === TermType.SHORT_TERM
                                    ? 'green'
                                    : termType === TermType.MEDIUM_TERM
                                      ? 'green'
                                      : 'green',
                              },
                              [`& .${linearProgressClasses.colorSecondary}`]: {
                                backgroundColor: 'grey',
                              },
                            }}
                          />
                        </Box>
                      </Tooltip>
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
                              size="small"
                              color="success"
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
    </StyledBox>
  );
};

export default TermwiseProgressBox;
