import {
  Box,
  Typography,
  Grid2 as Grid,
  Chip,
  LinearProgress,
  linearProgressClasses,
  styled,
} from '@mui/material';
import { StyledBox } from '../..';
import { TermType } from '../../../../types/enums';
import { PlannerData } from '../../../../domain/PlannerData';

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 5,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

const TermwiseProgress = ({ plannerData }: { plannerData: PlannerData }) => {
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
  return (
    <>
      <Box sx={{ pl: 2, pt: 2 }}>
        <Typography variant="h4">Financial Progress</Typography>
      </Box>
      <Grid container alignItems="stretch">
        {[TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].map(
          (termType) => {
            return (
              <Grid size={4} sx={{ padding: 2 }}>
                <StyledBox>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body1">{termType}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {getSumByTermType(termType).toLocaleString(
                        navigator.language,
                      )}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <BorderLinearProgress value={75} variant="determinate" />
                  </Box>

                  <Box mt={3}>
                    {getTermBasedGoalNames(termType).map((name) => (
                      <Chip
                        label={name}
                        color="info"
                        size="small"
                        sx={{ width: 'auto', height: '20px', mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </StyledBox>
              </Grid>
            );
          },
        )}
      </Grid>
    </>
  );
};

export default TermwiseProgress;
