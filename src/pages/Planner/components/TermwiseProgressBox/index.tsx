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
import { StyledBox } from '../../../../components/StyledBox';

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));

export type TermTypeWiseProgressData = {
  termType: TermType;
  termTypeWiseData: TermTypeWiseData;
};

type TermWiseProgressBoxProps = {
  data: TermTypeWiseProgressData[];
};

type TermTypeWiseData = {
  progressPercent: number;
  termTypeSum: number;
  goalNames: string[];
};

const TermWiseProgressBox = ({ data }: TermWiseProgressBoxProps) => {
  const numberOfTermsPresent = Object.keys(data).length;

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
        {data.map(({ termType, termTypeWiseData }) => {
          return (
            <>
              <Grid size={12 / numberOfTermsPresent} sx={{ padding: 2 }}>
                <Tooltip
                  title={`${termTypeWiseData.progressPercent}%`}
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
                      value={termTypeWiseData.progressPercent}
                      variant="determinate"
                      sx={{
                        [`& .${linearProgressClasses.barColorPrimary}`]: {
                          backgroundColor: 'green',
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
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {termTypeWiseData.termTypeSum.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box mt={3}>
                    {termTypeWiseData.goalNames.map((name) => (
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
          );
        })}
      </Grid>
    </StyledBox>
  );
};

export default TermWiseProgressBox;
