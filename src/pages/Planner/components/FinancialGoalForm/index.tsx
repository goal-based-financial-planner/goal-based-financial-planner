import { keyframes, styled } from '@mui/material/styles';
import { Box, Card, CardContent, SxProps, Theme } from '@mui/material';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { Dispatch } from 'react';
import { PlannerData } from '../../../../domain/PlannerData';
import FinancialGoalDetails from '../FinancialGoalDetails';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { addFinancialGoal } from '../../../../store/plannerDataActions';

const StyledBackdrop = styled('div')(({ theme }) => ({
  zIndex: theme.zIndex.modal + 1,
  color: '#fff',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}));

const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FinancialGoalForm = ({
  sx,
  dispatch,
  close,
}: {
  sx?: SxProps<Theme>;
  dispatch: Dispatch<PlannerDataAction>;
  plannerData: PlannerData;
  close: () => void;
}) => {
  const handleAddGoal = (financialGoal: FinancialGoal) => {
    addFinancialGoal(dispatch, financialGoal);
    close();
  };

  return (
    <StyledBackdrop sx={sx} onClick={close}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            animation: `${fadeInAnimation} 0.5s ease-out`,
            width: '300px',
          }}
        >
          <CardContent
            sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}
          >
            <Box
              sx={{
                animation: `${fadeInAnimation} 0.5s ease-out`,
              }}
            >
              <FinancialGoalDetails onAddGoal={handleAddGoal} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </StyledBackdrop>
  );
};

export default FinancialGoalForm;

FinancialGoalForm.defaultProps = {
  sx: {},
};
