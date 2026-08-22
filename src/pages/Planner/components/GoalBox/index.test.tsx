import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalBox from './index';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import { GoalRiskDisplayStatus } from '../../../../domain/goalRiskStatus';

// Mock child components to keep tests focused on GoalBox tab behavior
vi.mock('./goalList', () => ({
  default: function MockGoalList({
    goals,
    goalRiskStatuses,
  }: {
    goals: FinancialGoal[];
    goalRiskStatuses: Record<string, GoalRiskDisplayStatus>;
  }) {
    return (
      <div data-testid="goal-list">
        {goals.map((g) => (
          <div
            key={g.id}
            data-testid={`goal-${g.goalName}`}
            data-risk-status={goalRiskStatuses[g.id]}
          >
            {g.goalName}
          </div>
        ))}
      </div>
    );
  },
}));

describe('GoalBox', () => {
  const mockDispatch = jest.fn();

  const futureDate = '2099-12-31';
  const pastDate = '2020-01-01';
  const selectedDate = '2026-02-22';

  const pendingGoal = new FinancialGoal(
    'House Fund',
    GoalType.ONE_TIME,
    '2024-01-01',
    futureDate,
    5000000,
  );

  const completedGoal = new FinancialGoal(
    'Car Fund',
    GoalType.ONE_TIME,
    '2019-01-01',
    pastDate,
    800000,
  );

  const recurringGoal = new FinancialGoal(
    'Monthly Savings',
    GoalType.RECURRING,
    '2024-01-01',
    futureDate,
    120000,
  );

  const defaultProps = {
    investmentBreakdownForAllGoals: [],
    selectedDate,
    dispatch: mockDispatch,
    useStyledBox: false,
    goalRiskStatuses: {},
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Tab rendering', () => {
    it('should render "One Time" and "Recurring" tabs', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, recurringGoal]}
        />,
      );

      expect(screen.getByRole('tab', { name: /One Time/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Recurring/i })).toBeInTheDocument();
    });

    it('should show goal counts in tab labels', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, completedGoal, recurringGoal]}
        />,
      );

      expect(screen.getByRole('tab', { name: 'One Time (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Recurring (1)' })).toBeInTheDocument();
    });

    it('should default to the "One Time" tab on load', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, recurringGoal]}
        />,
      );

      const oneTimeTab = screen.getByRole('tab', { name: /One Time/i });
      expect(oneTimeTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('One Time tab content', () => {
    it('should show pending goals', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal]}
        />,
      );

      expect(screen.getByTestId('goal-House Fund')).toBeInTheDocument();
    });

    it('should show completed goals under "Completed Goals" heading', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[completedGoal]}
        />,
      );

      expect(screen.getByText('Completed Goals')).toBeInTheDocument();
      expect(screen.getByTestId('goal-Car Fund')).toBeInTheDocument();
    });

    it('should show empty state when no one-time goals exist', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[recurringGoal]}
        />,
      );

      expect(screen.getByText('No one-time goals added yet.')).toBeInTheDocument();
    });
  });

  describe('Recurring tab content', () => {
    it('should show recurring goals when Recurring tab is clicked', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, recurringGoal]}
        />,
      );

      fireEvent.click(screen.getByRole('tab', { name: /Recurring/i }));

      expect(screen.getByTestId('goal-Monthly Savings')).toBeInTheDocument();
    });

    it('should hide one-time goals when Recurring tab is active', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, recurringGoal]}
        />,
      );

      fireEvent.click(screen.getByRole('tab', { name: /Recurring/i }));

      expect(screen.queryByTestId('goal-House Fund')).not.toBeVisible();
    });

    it('should show empty state when no recurring goals exist', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal]}
        />,
      );

      fireEvent.click(screen.getByRole('tab', { name: /Recurring/i }));

      expect(screen.getByText('No recurring goals added yet.')).toBeInTheDocument();
    });
  });

  describe('Tab switching', () => {
    it('should switch content when tabs are clicked', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, recurringGoal]}
        />,
      );

      // Default: One Time tab active
      expect(screen.getByRole('tab', { name: /One Time/i })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // Click Recurring tab
      fireEvent.click(screen.getByRole('tab', { name: /Recurring/i }));

      expect(screen.getByRole('tab', { name: /Recurring/i })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: /One Time/i })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });
  });

  describe('goalRiskStatuses forwarding', () => {
    it('forwards the goalRiskStatuses map it is given down to GoalList unchanged', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[pendingGoal, recurringGoal]}
          goalRiskStatuses={{ [pendingGoal.id]: 'at-risk', [recurringGoal.id]: 'not-evaluated' }}
        />,
      );

      expect(screen.getByTestId('goal-House Fund')).toHaveAttribute('data-risk-status', 'at-risk');

      fireEvent.click(screen.getByRole('tab', { name: /Recurring/i }));
      expect(screen.getByTestId('goal-Monthly Savings')).toHaveAttribute(
        'data-risk-status',
        'not-evaluated',
      );
    });
  });

  describe('Empty goals', () => {
    it('should render tabs even when no goals exist at all', () => {
      render(
        <GoalBox
          {...defaultProps}
          financialGoals={[]}
        />,
      );

      expect(screen.getByRole('tab', { name: 'One Time (0)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Recurring (0)' })).toBeInTheDocument();
      expect(screen.getByText('No one-time goals added yet.')).toBeInTheDocument();
    });
  });
});
