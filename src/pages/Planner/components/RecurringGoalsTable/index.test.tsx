import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecurringGoalsTable from './index';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import * as actions from '../../../../store/plannerDataActions';

// Mock actions
jest.mock('../../../../store/plannerDataActions');

// Mock formatNumber
jest.mock('../../../../types/util', () => ({
  formatNumber: (num: number) => num.toLocaleString('en-US'),
}));

describe('RecurringGoalsTable', () => {
  const mockDispatch = jest.fn();

  const mockRecurringGoals = [
    new FinancialGoal(
      'Monthly Savings',
      GoalType.RECURRING,
      '2024-01-01',
      '2024-12-31',
      5000,
    ),
    new FinancialGoal(
      'Investment SIP',
      GoalType.RECURRING,
      '2024-01-01',
      '2024-12-31',
      10000,
    ),
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render null when no recurring goals', () => {
    const { container } = render(
      <RecurringGoalsTable recurringGoals={[]} dispatch={mockDispatch} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render table with recurring goals', () => {
    render(
      <RecurringGoalsTable
        recurringGoals={mockRecurringGoals}
        dispatch={mockDispatch}
      />,
    );

    expect(screen.getByText('Goal Name')).toBeInTheDocument();
    expect(screen.getByText('Monthly Target')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Monthly Savings')).toBeInTheDocument();
    expect(screen.getByText('Investment SIP')).toBeInTheDocument();
  });

  it('should display formatted amounts', () => {
    render(
      <RecurringGoalsTable
        recurringGoals={mockRecurringGoals}
        dispatch={mockDispatch}
      />,
    );

    expect(screen.getByText('₹5,000')).toBeInTheDocument();
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
  });

  it('should call deleteFinancialGoal when delete button clicked', () => {
    const mockDelete = jest.fn();
    (actions.deleteFinancialGoal as jest.Mock).mockImplementation(mockDelete);

    render(
      <RecurringGoalsTable
        recurringGoals={mockRecurringGoals}
        dispatch={mockDispatch}
      />,
    );

    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).toHaveBeenCalledWith(
      mockDispatch,
      mockRecurringGoals[0].id,
    );
  });

  it('should match snapshot', () => {
    const { container } = render(
      <RecurringGoalsTable
        recurringGoals={mockRecurringGoals}
        dispatch={mockDispatch}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
