import { Box, Button, Paper, Typography } from '@mui/material';
import { StyledBox } from '../Planner';
import FinancialGoalForm from '../Planner/components/FinancialGoalForm';
import { PlannerData } from '../../domain/PlannerData';
import image1 from '../../assets/image1.png';
import image2 from '../../assets/image2.png';
import image3 from '../../assets/image3.png';
import image4 from '../../assets/image4.png';
import icon from '../../assets/icon.png';

const getImageStyle = (position: string, size: number, rotation: number) => ({
  position: 'absolute',
  width: size,
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
  isFormOpen,
  plannerData,
  dispatch,
  setIsFormOpen,
  handlAdd,
}: {
  isFormOpen: any;
  plannerData: PlannerData;
  dispatch: any;
  setIsFormOpen: any;
  handlAdd: any;
}) => {
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

        <img src={icon} alt="ghjk" style={{ width: '60px' }} />
        <Typography variant="h2">Plan your Financial Goals</Typography>

        <Typography variant="h4" color="gray">
          Start by adding your first Goal
        </Typography>
        <Button
          variant="contained"
          onClick={handlAdd}
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
          plannerData={plannerData}
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </Box>
  );
};

export default LandingPage;
