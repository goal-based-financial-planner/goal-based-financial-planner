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
import { useNumberFormatter } from '../../../../types/util';

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

const FormattedNumber = ({ value }: { value: number }) => {
  const formattedValue = useNumberFormatter(value);
  return <>{formattedValue}</>;
};

const TermWiseProgressBox = ({ data }: TermWiseProgressBoxProps) => {
  const numberOfTermsPresent = Object.keys(data).length;

  return (
    <StyledBox className="financial-progress-box" height="85%">
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
                      <FormattedNumber value={termTypeWiseData.termTypeSum} />
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

                          mb: 1,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </>
          );
        })}
      </Grid>
    </StyledBox>
  );
};

export default TermWiseProgressBox;
