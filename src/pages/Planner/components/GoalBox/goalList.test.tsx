import { render, screen } from '@testing-library/react';
import GoalList from './goalList';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';

vi.mock('../GoalCard', () => ({
  default: function MockGoalCard({
    goal,
    riskStatus,
  }: {
    goal: FinancialGoal;
    riskStatus?: GoalRiskDisplayStatus;
  }) {
    return (
      <div data-testid={`goal-card-${goal.goalName}`} data-risk-status={riskStatus}>
        {goal.goalName}
      </div>
    );
  },
}));

const mockDispatch = vi.fn();

const makeGoal = (goalName: string) =>
  new FinancialGoal(goalName, GoalType.ONE_TIME, '2024-01-01', '2030-01-01', 500000);

describe('GoalList', () => {
  it("passes each goal's looked-up riskStatus from the goalRiskStatuses map to GoalCard", () => {
    const goalA = makeGoal('Goal A');
    const goalB = makeGoal('Goal B');

    render(
      <GoalList
        goals={[goalA, goalB]}
        investmentBreakdownForAllGoals={[]}
        dispatch={mockDispatch}
        goalRiskStatuses={{ [goalA.id]: 'at-risk', [goalB.id]: 'on-track' }}
      />,
    );

    expect(screen.getByTestId('goal-card-Goal A')).toHaveAttribute('data-risk-status', 'at-risk');
    expect(screen.getByTestId('goal-card-Goal B')).toHaveAttribute('data-risk-status', 'on-track');
  });

  it('passes undefined when a goal has no entry in goalRiskStatuses', () => {
    const goal = makeGoal('Untracked Goal');

    render(
      <GoalList
        goals={[goal]}
        investmentBreakdownForAllGoals={[]}
        dispatch={mockDispatch}
        goalRiskStatuses={{}}
      />,
    );

    expect(screen.getByTestId(`goal-card-${goal.goalName}`)).not.toHaveAttribute('data-risk-status');
  });
});
