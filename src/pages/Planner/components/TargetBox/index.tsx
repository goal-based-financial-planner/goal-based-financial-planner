import {
  Typography,
  Button,
  AccordionSummary,
  Accordion,
  Box,
} from '@mui/material';
import LiveCounter from '../../../../components/LiveNumberCounter';
import FinancialGoalForm from '../../../Home/components/FinancialGoalForm';
import { useState } from 'react';
import { StyledBox } from '../../../../components/StyledBox';
import TermWiseProgressMobileBox from '../TermwiseProgressBox/mobileIndex';
import { TermTypeWiseProgressData } from '../TermwiseProgressBox';

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

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setShowDrawer(newOpen);
  };

  return (
    <>
      <StyledBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ml: 2,
          my: 2,
        }}
        minHeight={'250px'}
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
        <TermWiseProgressMobileBox data={termTypeWiseProgressData} />
      </StyledBox>
      {isFormOpen ? (
        <FinancialGoalForm
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </>
  );
};

export default TargetBox;
