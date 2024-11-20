import React from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { styled } from '@mui/system';
import loginImage from '../../assets/Image3.jpg';

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

const StyledCardDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: 1,
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  padding: '4px 8px',
  position: 'absolute',
  top: 120,
  left: 250,
  backgroundColor: 'rgba(250, 250, 250, 0.08)',
  color: '#fff',
  zIndex: 2,
  borderRadius: '30px',
}));

const LoginPage = () => {
  return (
    <>
      <StyledContainer>
        <BackdropImage />
        <BlackOverlay />
        <WelcomeCard>
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
        </WelcomeCard>
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
        {[
          { icon: 'add_task', text: 'Add your Goals' },
          { icon: 'ballot', text: 'Add Your Investment Allocations' },
          { icon: 'monitoring', text: 'Check  Investment Summary' },
        ].map(({ icon, text }) => (
          <StyledCard key={text}>
            <StyledCardDetails>
              <span
                className="material-symbols-rounded"
                style={{
                  color: 'orange',
                  fontSize: '50px',
                  paddingLeft: '12px',
                }}
              >
                {icon}
              </span>
              <Typography sx={{ fontWeight: 'bold', color: 'black', px: 1 }}>
                {text}
              </Typography>
            </StyledCardDetails>
          </StyledCard>
        ))}
      </StyledCardContainer>
    </>
  );
};

export default LoginPage;
