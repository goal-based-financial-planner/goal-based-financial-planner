import { Box, Typography, Grid2 as Grid } from '@mui/material';
import { StyledBox } from '../../components/StyledBox';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useState, useEffect } from 'react';

const CongratulationsPage = ({
  targetAmount,
  goals,
}: {
  targetAmount: number;
  goals: { name: string; amount: number }[];
}) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {showConfetti && <Confetti width={width} height={height} />}
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12, sm: 12, md: 12 }} textAlign="center">
          <Typography variant="h4" color="primary" fontWeight="bold">
            🎉 Congratulations!
          </Typography>
          <Typography mt={2} variant="subtitle1">
            You have successfully completed all your goals
          </Typography>
        </Grid>

        <Grid container size={{ xs: 12, sm: 12, md: 12 }}>
          <StyledBox
            sx={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              flexGrow: 1,
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Your Total Savings
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 'bold', mt: 2 }}
              color="primary"
            >
              {targetAmount.toLocaleString(navigator.language, {
                maximumFractionDigits: 0,
              })}
            </Typography>
          </StyledBox>
          <StyledBox
            sx={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              flexGrow: 1,
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Your Goals
            </Typography>
            <Box sx={{ mt: 2 }}>
              {goals.map((goal) => (
                <Typography key={goal.name} color="primary">
                  <span style={{ fontWeight: 'bold' }}>{goal.name}</span> -{' '}
                  {goal.amount.toLocaleString(navigator.language, {
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              ))}
            </Box>
          </StyledBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CongratulationsPage;
