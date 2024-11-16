import React from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { styled } from '@mui/system';
import loginImage from '../../assets/Image3.jpg';

const LoginPage = () => {
  return (
    <>
      <StyledContainer>
        <BackdropImage />
        <BlackOverlay />
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            px: 2,
            py: 1,
            position: 'absolute',
            top: 100,
            left: 250,
            backgroundColor: 'rgba(250, 250, 250, 0.05)',
            color: '#fff',
            zIndex: 2,
            borderRadius: 10,
          }}
        >
          <Typography
            sx={{
              color: 'orange',
              zIndex: 1,
              backgroundColor: '#fff',
              top: 150,
              left: 250,
              px: 1,
              borderRadius: 10,
              fontWeight: 'bold',
            }}
          >
            Welcome
          </Typography>
          <Typography>Start adding your goals</Typography>
        </Card>
        <Typography
          variant="h1"
          sx={{
            color: '#fff',
            zIndex: 1,
            position: 'absolute',
            top: 150,
            left: 250,
            fontWeight: 'bold',
          }}
        >
          Financial Planner
        </Typography>
        <Typography
          sx={{
            color: '#fff',
            zIndex: 1,
            position: 'absolute',
            top: 290,
            left: 250,
            width: '700px',
          }}
          variant="body2"
        >
          This is to add your future goals and see where you need to invest your
          money in.
        </Typography>
        <Button
          sx={{
            color: '#fff',
            zIndex: 1,
            position: 'absolute',
            top: 400,
            left: 250,
            height: '60px',
            width: '200px',
            backgroundColor: 'Orange',
          }}
          variant="contained"
        >
          {`Get Started --->`}
        </Button>
      </StyledContainer>

      <StyledCardContainer>
        <StyledCard>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ color: 'orange', fontSize: '50px' }}
            >
              add_task
            </span>
            <Typography
              variant="body1"
              sx={{
                color: 'black',
                fontWeight: 'bold',
                p: 3,
              }}
            >
              Add your Goals
            </Typography>
          </Box>
        </StyledCard>

        <StyledCard>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ color: 'orange', fontSize: '50px', paddingLeft: '12px' }}
            >
              ballot
            </span>
            {/* Adjust size and color as needed */}
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', color: 'black', pr: 2 }}
            >
              Add Your Investment Allocations
            </Typography>
          </Box>
        </StyledCard>
        <StyledCard>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ color: 'orange', fontSize: '50px', paddingLeft: '12px' }}
            >
              monitoring
            </span>
            {/* Adjust size and color as needed */}
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', color: 'black', pr: 2 }}
            >
              Check your Invesment Summary{' '}
            </Typography>
          </Box>
        </StyledCard>
      </StyledCardContainer>
    </>
  );
};

export default LoginPage;

const StyledContainer = styled(Box)(({ theme }) => ({
  height: '80vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const BackdropImage = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `url(${loginImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.6,
  animation: 'fadeIn 2s ease-in-out forwards',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
});

const BlackOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
});

const StyledCardContainer = styled(Box)(() => ({
  display: 'flex',
  gap: '16px',
  position: 'absolute',
  bottom: '12%',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  width: '100vw',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: '250px',
  height: '100px',
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
