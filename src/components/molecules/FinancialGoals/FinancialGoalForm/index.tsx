import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { Dispatch, useState } from 'react';
import AddFinancialGoals from '../AddFinancialGoals';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { addFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalDetails from '../FinancialGoalDetails';

const FinancialGoalForm = ({
  label,
  dispatch,
}: {
  label: string;
  dispatch: Dispatch<PlannerDataAction>;
}) => {
  const theme = useTheme();
  const [isEditable, setIsEditable] = useState(false);

  const handleAddGoal = (financialGoal: FinancialGoal) => {
    addFinancialGoal(dispatch, financialGoal);
    setIsEditable(false);
  };

  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ padding: 1 }}>
        {isEditable ? (
          <FinancialGoalDetails onAddGoal={handleAddGoal} />
        ) : (
          <>
            <Box
              onClick={() => setIsEditable(true)}
              sx={{
                minHeight: '180px',
                backgroundColor: '#BCE6FF',
                padding: 2,
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <Box>
                <span
                  className="material-symbols-rounded"
                  style={{
                    fontSize: '50px',
                    color: theme.palette.primary.main,
                  }}
                >
                  add_circle
                </span>
              </Box>

              <Box>
                <Typography sx={{ color: theme.palette.primary.main }}>
                  {label}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ padding: 1, height: '20px' }}></Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialGoalForm;
