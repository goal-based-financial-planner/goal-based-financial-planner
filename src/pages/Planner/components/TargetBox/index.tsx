import { useState } from 'react';
import { Typography, Button, Box, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LiveCounter from '../../../../components/LiveNumberCounter';
import { StyledBox } from '../../../../components/StyledBox';
import { TermTypeWiseProgressData } from '../TermwiseProgressBox';
import TermWiseProgressBarChart from '../TermwiseProgressBox/termWiseProgressBarChart';
import AddGoalPopup from '../../../Home/components/AddGoalPopup';

type TargetBoxProps = {
  targetAmount: number;
  dispatch: any;
  termTypeWiseProgressData: TermTypeWiseProgressData[];
  setShowDrawer(showDrawer: boolean): void;
};

const TargetBox = ({
  targetAmount,
  dispatch,
  termTypeWiseProgressData,
  setShowDrawer,
}: TargetBoxProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setShowDrawer(newOpen);
  };

  const handleExpandClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      <StyledBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          flexGrow: 1,
        }}
        className="target-box"
      >
        <Typography variant="h6" fontWeight="bold">
          Your Target
        </Typography>
        <LiveCounter value={targetAmount} duration={500} />
        <Box display="flex" flexDirection="row" alignItems="center" gap={4}>
          <Button
            className="add-goals-button"
            variant="contained"
            sx={{
              mt: 2,
            }}
            onClick={handleAdd}
          >
            Add Goal
          </Button>
          <Button
            className="view-goals-button"
            variant="outlined"
            sx={{
              mt: 2,
              color: 'green',
              display: { xs: 'block', md: 'none' },
            }}
            onClick={toggleDrawer(true)}
          >
            View Goals
          </Button>
        </Box>

        <IconButton
          onClick={handleExpandClick}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'absolute',
            bottom: '-14px',
            width: '40px',
            height: '40px',
            left: '50%',
            transform: isExpanded
              ? 'translateX(-50%) rotate(180deg)'
              : 'translateX(-50%) rotate(0deg)',
            transition:
              'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s ease, border 0.3s ease', // Added cubic-bezier easing
            borderRadius: '50%',
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <ExpandMoreIcon fontSize="medium" />
        </IconButton>

        <Box
          sx={{
            transition: 'height 0.3s ease-in-out',
            mb: 5,
            display: { xs: 'block', sm: 'block', md: 'none', lg: 'none' },
          }}
        >
          {isExpanded && (
            <TermWiseProgressBarChart data={termTypeWiseProgressData} />
          )}
        </Box>
      </StyledBox>

      <AddGoalPopup
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        dispatch={dispatch}
      />
    </>
  );
};

export default TargetBox;
