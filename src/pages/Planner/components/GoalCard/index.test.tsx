import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalCard from './index';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import * as plannerDataActions from '../../../../store/plannerDataActions';

vi.mock('../../../../store/plannerDataActions', () => ({
  deleteFinancialGoal: vi.fn(),
  updateGoalInflationRate: vi.fn(),
}));

vi.mock('../../../../pages/Home/components/FinancialGoalForm', () => ({
  default: ({ initialGoal }: { initialGoal?: { goalName: string } }) => (
    <div data-testid="financial-goal-form">
      {initialGoal?.goalName}
    </div>
  ),
}));

const mockDispatch = vi.fn();

function makeOneTimeGoal(inflationRate?: number): FinancialGoal {
  return new FinancialGoal(
    'Education Fund',
    GoalType.ONE_TIME,
    '2024-01-01',
    '2030-01-01',
    500000,
    undefined,
    inflationRate,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GoalCard', () => {
  it('renders goal name', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText('Education Fund')).toBeInTheDocument();
  });

  it('renders "Original Target: ..." caption', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText(/Original Target:/)).toBeInTheDocument();
  });

  it('renders "Inflation: 5%" when goal has no inflationRate set', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText('Inflation: 5%')).toBeInTheDocument();
  });

  it('renders "Inflation: 8%" when goal has inflationRate=8', () => {
    const goal = makeOneTimeGoal(8);
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText('Inflation: 8%')).toBeInTheDocument();
  });

  it('renders edit button', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('renders delete button', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('clicking delete calls deleteFinancialGoal with the goal id', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    fireEvent.click(screen.getByText('delete'));
    expect(plannerDataActions.deleteFinancialGoal).toHaveBeenCalledWith(
      mockDispatch,
      goal.id,
    );
  });

  it('clicking edit opens dialog containing FinancialGoalForm', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.queryByTestId('financial-goal-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('financial-goal-form')).toBeInTheDocument();
  });

  it('for recurring goals: date range is NOT shown', () => {
    const goal = new FinancialGoal(
      'Monthly Savings',
      GoalType.RECURRING,
      '',
      '',
      50000,
      1,
    );
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={0} />,
    );
    expect(screen.queryByText(/\d{2}\/\d{4} - \d{2}\/\d{4}/)).not.toBeInTheDocument();
  });

  it('for one-time goals: date range IS shown', () => {
    const goal = makeOneTimeGoal();
    render(
      <GoalCard goal={goal} dispatch={mockDispatch} currentValue={50000} />,
    );
    expect(screen.getByText(/01\/2024 - 01\/2030/)).toBeInTheDocument();
  });
});
