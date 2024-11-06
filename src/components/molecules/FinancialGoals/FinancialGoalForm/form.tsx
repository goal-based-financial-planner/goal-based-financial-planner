import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { Dispatch, useState } from 'react';
import { keyframes } from '@emotion/react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { addFinancialGoal } from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import FinancialGoalDetails from '../FinancialGoalDetails';

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Form = ({
  label,
  dispatch,
  closePopup,
}: {
  label: string;
  dispatch: Dispatch<PlannerDataAction>;
  closePopup: () => void;
}) => {
  const [isEditable, setIsEditable] = useState(false);

  const handleAddGoal = (financialGoal: FinancialGoal) => {
    addFinancialGoal(dispatch, financialGoal);
    setIsEditable(false);
    closePopup();
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        animation: isEditable ? `${fadeInAnimation} 0.5s ease-out` : 'none', // Apply fade-in animation
      }}
    >
      <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1.3 } }}>
        {/* {isEditable ? ( */}
        <Box
          sx={{
            animation: `${fadeInAnimation} 0.5s ease-out`, // Fade in FinancialGoalDetails
          }}
        >
          <FinancialGoalDetails onAddGoal={handleAddGoal} />
        </Box>
        {/* ) : ( */}
        {/* <>
            <Box
              onClick={() => setIsEditable(true)}
              sx={{
                minHeight: '90px',
                backgroundColor: theme.palette.cardBackGround.main,
                padding: 1,
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, background-color 0.3s ease',
                '&:hover': {
                  cursor: 'pointer',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  animation: `${bounceAnimation} 1s ease-in-out infinite`, // Bounce animation on hover
                }}
              >
                <span
                  className="material-symbols-rounded"
                  style={{
                    fontSize: '50px',
                    color: theme.palette.primary.main,
                    transition: 'color 0.3s ease',
                  }}
                >
                  add_circle
                </span>
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: theme.palette.primary.main,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ padding: 1, height: '12.5px' }} />
          </> */}
        {/* )} */}
      </CardContent>
    </Card>
  );
};

export default Form;
