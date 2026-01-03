import GoalCard from '../GoalCard';
import RecurringGoalsTable from '../RecurringGoalsTable';
import { Box, Divider } from '@mui/material';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { GoalType } from '../../../../types/enums';
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
  // Separate recurring goals from one-time goals
  const recurringGoals = goals.filter(
    (goal) => goal.goalType === GoalType.RECURRING,
  );
  const oneTimeGoals = goals.filter(
    (goal) => goal.goalType === GoalType.ONE_TIME,
  );

  return (
    <Box>
      {/* Recurring Goals Table */}
      {recurringGoals.length > 0 && (
        <RecurringGoalsTable
          recurringGoals={recurringGoals}
          dispatch={dispatch}
        />
      )}

      {/* One-time Goals Cards */}
      {oneTimeGoals.length > 0 && (
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
          {oneTimeGoals.map((goal: FinancialGoal) => {
            const investmentBreakdown = investmentBreakdownForAllGoals.find(
              (ib) => ib.goalName === goal.getGoalName(),
            );

            return (
              <div key={goal.id}>
                <GoalCard
                  goal={goal}
                  dispatch={dispatch}
                  currentValue={investmentBreakdown?.currentValue!}
                  investmentSuggestions={investmentBreakdown?.investmentSuggestions}
                />
                <Divider className="divider" />
              </div>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default GoalList;
