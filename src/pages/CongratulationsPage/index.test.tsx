import React from 'react';
import { render, screen } from '@testing-library/react';
import CongratulationsPage from './index';

// Mock react-confetti to avoid animation in tests
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti">Confetti</div>;
  };
});

// Mock react-use/lib/useWindowSize hook
jest.mock('react-use/lib/useWindowSize', () => () => ({ width: 1920, height: 1080 }));

// Mock formatNumber for deterministic snapshots
jest.mock('../../types/util', () => ({
  formatNumber: (num: number) => num.toLocaleString('en-US'),
}));

describe('CongratulationsPage', () => {
  const mockGoals = [
    { name: 'Retirement', amount: 5000000 },
    { name: 'House', amount: 2000000 },
    { name: 'Education', amount: 1000000 },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should render congratulations message', () => {
    render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/successfully completed all your goals/i)
    ).toBeInTheDocument();
  });

  it('should display total savings amount', () => {
    render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(screen.getByText(/Your Total Savings/i)).toBeInTheDocument();
    expect(screen.getByText('8,000,000')).toBeInTheDocument();
  });

  it('should render all goal details', () => {
    render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(screen.getByText('Retirement')).toBeInTheDocument();
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  it('should show confetti initially', () => {
    render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(screen.getByTestId('confetti')).toBeInTheDocument();
  });

  it('should match snapshot of congratulations content', () => {
    const { container } = render(
      <CongratulationsPage targetAmount={5000000} goals={mockGoals} />
    );

    expect(container).toMatchSnapshot();
  });

  it('should handle empty goals list', () => {
    render(
      <CongratulationsPage targetAmount={0} goals={[]} />
    );

    expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
  });

  it('should handle single goal', () => {
    render(
      <CongratulationsPage
        targetAmount={1000000}
        goals={[{ name: 'Vacation', amount: 1000000 }]}
      />
    );

    expect(screen.getByText('Vacation')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });
});
