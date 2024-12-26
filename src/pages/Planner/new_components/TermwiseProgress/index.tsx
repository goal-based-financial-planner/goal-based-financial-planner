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
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
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

        <DatePicker
          label={'"month" and "year"'}
          views={['month', 'year']}
          sx={{ width: '160px' }}
          defaultValue={dayjs()}
          slotProps={{
            textField: {
              variant: 'standard',
              label: '',
              InputProps: {
                disableUnderline: true,
              },
            },
          }}
        />
      </Box>
      <Grid container pt={1}>
        {[TermType.SHORT_TERM, TermType.MEDIUM_TERM, TermType.LONG_TERM].map(
          (termType) => {
            return (
              <>
                <Grid size={4} sx={{ padding: 2 }}>
                  <Box mb={2}>
                    <BorderLinearProgress
                      value={75}
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
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
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
                          sx={{ width: 'auto', height: '20px', mr: 1, mb: 1 }}
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
            );
          },
        )}
      </Grid>
    </>
  );
};

export default TermwiseProgress;
