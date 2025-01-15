import {
  Box,
  Button,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FinancialGoalForm from '../Home/components/FinancialGoalForm';
import image1 from '../../assets/image1.png';
import image2 from '../../assets/image2.png';
import image3 from '../../assets/image3.png';
import image4 from '../../assets/image4.png';
import icon from '../../assets/icon.png';
import { StyledBox } from '../../components/StyledBox';
import { Dispatch, useState } from 'react';
import { PlannerDataAction } from '../../store/plannerDataReducer';

const getImageStyle = (position: string, size: number, rotation: number) => ({
  position: 'absolute',
  width: `${size / 16}rem`, // Convert to rem
  filter: 'brightness(0.98)',
  opacity: 0.9,
  transform: `rotate(${rotation}deg)`,
  ...(position === 'top-left'
    ? { top: '2%', left: '2%' }
    : position === 'top-right'
      ? { top: '5%', right: '1%' }
      : position === 'bottom-left'
        ? { bottom: '3%', left: '-2%' }
        : { bottom: '-3%', right: '2%' }),
});

const LandingPage = ({
  dispatch,
}: {
  dispatch: Dispatch<PlannerDataAction>;
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        p: 2,
      }}
    >
      {/* Main content */}
      <StyledBox
        flexGrow={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#ffffff',
          backgroundImage:
            'radial-gradient(lightgray 10%, transparent 11%),radial-gradient(lightgray 10%, transparent 11%)',
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 3px 3px',
          backgroundRepeat: 'repeat',
        }}
      >
        {!isMobile && (
          <>
            <Paper
              component="img"
              src={image1}
              alt="Reminder"
              sx={getImageStyle('top-left', 300, -15)}
            />
            <Paper
              component="img"
              src={image2}
              alt="Checklist"
              sx={getImageStyle('top-right', 480, 10)}
            />
            <Paper
              component="img"
              src={image3}
              alt="Today's tasks"
              sx={getImageStyle('bottom-right', 260, 4)}
            />
            <Paper
              component="img"
              src={image4}
              alt="Integrations"
              sx={getImageStyle('bottom-left', 500, -10)}
            />
          </>
        )}

        <img src={icon} alt="icon" style={{ width: '60px' }} />
        <Typography variant="h2">Plan your Financial Goals</Typography>
        <Typography variant="h4" color="gray">
          Start by adding your first Goal
        </Typography>
        <Button
          variant="contained"
          onClick={handleAdd}
          sx={{
            border: '1px solid green',
            backgroundColor: 'green',
          }}
        >
          ADD GOAL
        </Button>
      </StyledBox>

      {/* Financial Goal Form */}
      {isFormOpen ? (
        <FinancialGoalForm
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </Box>
  );
};

export default LandingPage;
