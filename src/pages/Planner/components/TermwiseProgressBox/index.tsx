import {
  Box,
  Typography,
  Grid2 as Grid,
  Chip,
  LinearProgress,
  linearProgressClasses,
  styled,
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

const getChips = (termTypeWiseData: TermTypeWiseData) => {
  return (
    <Box mt={3} gap={0.3} display="flex" flexWrap="wrap">
      {termTypeWiseData.goalNames.map((name) => (
        <Chip
          key={name}
          label={name}
          size="small"
          color="success"
          sx={{
            width: 'auto',
            height: '20px',
            mb: 1,
          }}
        />
      ))}
    </Box>
  );
};
const TermWiseProgressBox = ({ data }: TermWiseProgressBoxProps) => {
  const numberOfTermsPresent = Object.keys(data).length;

  return (
    <StyledBox className="financial-progress-box">
      <Typography variant="h6" fontWeight="bold">
        Financial Progress
      </Typography>

      <Grid container pt={1}>
        {data.map(({ termType, termTypeWiseData }, idx) => {
          const isLastGrid = idx === data.length - 1;
          return (
            <>
              <Grid
                size={12 / numberOfTermsPresent}
                sx={{
                  padding: 2,
                  borderRight: isLastGrid ? 'none' : '1px dashed grey',
                }}
              >
                {termTypeWiseData.progressPercent === 100 ? (
                  <>
                    <Typography>{termType}</Typography>
                    <Typography variant="h6" color="primary">
                      🎉 Goals Acheived
                    </Typography>
                    {getChips(termTypeWiseData)}
                  </>
                ) : (
                  <>
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
                    <Box sx={{ paddingTop: '16px' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body1">{termType}</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                            }}
                          >
                            {termTypeWiseData.termTypeSum.toLocaleString(
                              navigator.language,
                              { maximumFractionDigits: 0 },
                            )}
                          </Typography>
                        </Typography>
                      </Box>

                      {getChips(termTypeWiseData)}
                    </Box>
                  </>
                )}
              </Grid>
            </>
          );
        })}
      </Grid>
    </StyledBox>
  );
};

export default TermWiseProgressBox;
