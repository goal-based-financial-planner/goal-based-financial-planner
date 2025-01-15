import {
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Box,
  Drawer,
} from '@mui/material';
import LiveCounter from '../../../../components/LiveNumberCounter';
import FinancialGoalForm from '../../../Home/components/FinancialGoalForm';
import { Dispatch, useState } from 'react';
import { StyledBox } from '../../../../components/StyledBox';
import { RemoveRedEye } from '@mui/icons-material';
import GoalBox from '../GoalBox';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';

type TargetBoxProps = {
  targetAmount: number;
  financialGoals: FinancialGoal[];
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
};

const TargetMobileBox = ({
  targetAmount,
  dispatch,
  financialGoals,
  selectedDate,
  investmentBreakdownForAllGoals,
}: TargetBoxProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleAdd = () => {
    setIsFormOpen(true);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
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
        height={isMobile ? '150px' : '250px'}
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
            Add Goals
          </Button>
          <Button
            sx={{
              width: '20px',
              mt: 4,
              color: 'green',
            }}
            onClick={toggleDrawer(true)}
          >
            <RemoveRedEye />
          </Button>
          <Drawer open={open} onClose={toggleDrawer(false)}>
            <GoalBox
              financialGoals={financialGoals}
              investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
              selectedDate={selectedDate}
              dispatch={dispatch}
            />
          </Drawer>
        </Box>
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

export default TargetMobileBox;
