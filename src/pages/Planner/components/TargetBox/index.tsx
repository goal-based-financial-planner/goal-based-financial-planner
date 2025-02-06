import { useState } from 'react';
import { Typography, Button, Box, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LiveCounter from '../../../../components/LiveNumberCounter';
import FinancialGoalForm from '../../../Home/components/FinancialGoalForm';
import { StyledBox } from '../../../../components/StyledBox';
import { TermTypeWiseProgressData } from '../TermwiseProgressBox';
import TermWiseProgressBarChart from '../TermwiseProgressBox/terwiseProgressBarChart';

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
          ml: 2,
          my: 2,
          mr: {
            xs: 2,
            md: 0,
          },
          position: 'relative',
          minHeight: {
            xs: '200px',
          },
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
            variant="outlined"
            sx={{
              width: '120px',
              mt: 4,
              color: 'green',
              border: '1px solid green',
            }}
            onClick={handleAdd}
          >
            Add Goal
          </Button>
          <Button
            className="view-goals-button"
            variant="text"
            sx={{
              width: '120px',
              mt: 4,
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
            mt: 2,
          }}
        >
          {isExpanded && (
            <TermWiseProgressBarChart data={termTypeWiseProgressData} />
          )}
        </Box>
      </StyledBox>

      {isFormOpen && (
        <FinancialGoalForm
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      )}
    </>
  );
};

export default TargetBox;
