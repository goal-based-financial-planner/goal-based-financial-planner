import GoalCard from '../GoalCard';
import { Box, Divider } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { Dispatch } from 'react';

type GoalListProps = {
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  goals: FinancialGoal[];
  dispatch: Dispatch<PlannerDataAction>;
};

const GoalList = ({
  investmentBreakdownForAllGoals,
  goals,
  dispatch,
}: GoalListProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        '& .divider': {
          display: 'block',
        },
        '& .divider:last-child': {
          display: 'none',
        },
      }}
    >
      {goals.map((goal: FinancialGoal) => {
        return (
          <>
            <GoalCard
              goal={goal}
              dispatch={dispatch}
              currentValue={
                investmentBreakdownForAllGoals.find(
                  (ib) => ib.goalName === goal.getGoalName(),
                )?.currentValue!
              }
            />
            <Divider className="divider" />
          </>
        );
      })}
    </Box>
  );
};

export default GoalList;
