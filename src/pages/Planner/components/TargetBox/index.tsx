import { useState, Dispatch } from 'react';
import { Typography, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import LiveCounter from '../../../../components/LiveNumberCounter';
import { StyledBox } from '../../../../components/StyledBox';
import { TermTypeWiseProgressData } from '../../../../types/planner';
import AddGoalPopup from '../../../Home/components/AddGoalPopup';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type TargetBoxProps = {
  targetAmount: number;
  dispatch: Dispatch<PlannerDataAction>;
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

  const totalGoals = termTypeWiseProgressData.reduce(
    (sum, d) => sum + d.termTypeWiseData.goalNames.length,
    0,
  );

  return (
    <>
      <StyledBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100%',
        }}
        className="target-box"
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1.5, fontSize: '0.65rem', lineHeight: 1.4 }}
        >
          Total Goal Target
        </Typography>

        <LiveCounter value={targetAmount} duration={500} />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {totalGoals > 0
            ? `across ${totalGoals} goal${totalGoals !== 1 ? 's' : ''}`
            : 'No goals added yet'}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            className="add-goals-button"
            variant="contained"
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => setIsFormOpen(true)}
          >
            Add Goal
          </Button>
          <Button
            className="view-goals-button"
            variant="outlined"
            size="small"
            startIcon={<ListIcon fontSize="small" />}
            sx={{ display: { xs: 'flex', md: 'none' } }}
            onClick={() => setShowDrawer(true)}
          >
            Goals
          </Button>
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
