import { Box, Tab, Tabs, Typography } from '@mui/material';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import dayjs from 'dayjs';
import { Dispatch, useMemo, useState } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { StyledBox } from '../../../../components/StyledBox';
import GoalList from './goalList';
import { GoalType } from '../../../../types/enums';

type GoalBoxProps = {
  financialGoals: FinancialGoal[];
  investmentBreakdownForAllGoals: GoalWiseInvestmentSuggestions[];
  selectedDate: string;
  dispatch: Dispatch<PlannerDataAction>;
  useStyledBox: boolean;
};

const GoalBox = ({
  financialGoals,
  selectedDate,
  investmentBreakdownForAllGoals,
  dispatch,
  useStyledBox,
}: GoalBoxProps) => {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const sortedGoals = useMemo(
    () =>
      [...financialGoals].sort((goal1, goal2) => {
        const diffA = dayjs(goal1.getTargetDate()).diff(dayjs(), 'days');
        const diffB = dayjs(goal2.getTargetDate()).diff(dayjs(), 'days');
        return diffA - diffB;
      }),
    [financialGoals],
  );

  const pendingGoals = useMemo(
    () =>
      sortedGoals.filter((goal) => {
        return (
          goal.goalType === GoalType.ONE_TIME &&
          dayjs(selectedDate).isBefore(goal.getTargetDate())
        );
      }),
    [sortedGoals, selectedDate],
  );

  const completedGoals = useMemo(
    () =>
      sortedGoals.filter((goal) => {
        return (
          goal.goalType === GoalType.ONE_TIME &&
          dayjs(selectedDate).isAfter(goal.getTargetDate())
        );
      }),
    [sortedGoals, selectedDate],
  );

  const recurringGoals = useMemo(
    () =>
      sortedGoals.filter((goal) => {
        return goal.goalType === GoalType.RECURRING;
      }),
    [sortedGoals],
  );

  const oneTimeCount = pendingGoals.length + completedGoals.length;
  const recurringCount = recurringGoals.length;

  const content = (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v as 0 | 1)}
        sx={{ mb: 2 }}
      >
        <Tab label={`One Time (${oneTimeCount})`} />
        <Tab label={`Recurring (${recurringCount})`} />
      </Tabs>

      <Box role="tabpanel" hidden={activeTab !== 0}>
        {oneTimeCount === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
            No one-time goals added yet.
          </Typography>
        ) : (
          <>
            {pendingGoals.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold">
                  Financial Goals
                </Typography>
                <GoalList
                  investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
                  goals={pendingGoals}
                  dispatch={dispatch}
                />
              </>
            )}
            {completedGoals.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  Completed Goals
                </Typography>
                <GoalList
                  investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
                  goals={completedGoals}
                  dispatch={dispatch}
                />
              </>
            )}
          </>
        )}
      </Box>

      <Box role="tabpanel" hidden={activeTab !== 1}>
        {recurringCount === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
            No recurring goals added yet.
          </Typography>
        ) : (
          <GoalList
            investmentBreakdownForAllGoals={investmentBreakdownForAllGoals}
            goals={recurringGoals}
            dispatch={dispatch}
          />
        )}
      </Box>
    </Box>
  );

  return useStyledBox ? (
    <StyledBox className="financial-goals-box">{content}</StyledBox>
  ) : (
    content
  );
};

export default GoalBox;
