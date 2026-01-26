import React from 'react';
import { render } from '@testing-library/react';
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
    const { getByText } = render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(getByText(/Congratulations!/i)).toBeInTheDocument();
    expect(
      getByText(/successfully completed all your goals/i)
    ).toBeInTheDocument();
  });

  it('should display total savings amount', () => {
    const { getByText } = render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(getByText(/Your Total Savings/i)).toBeInTheDocument();
    expect(getByText('8,000,000')).toBeInTheDocument();
  });

  it('should render all goal details', () => {
    const { getByText } = render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(getByText('Retirement')).toBeInTheDocument();
    expect(getByText('House')).toBeInTheDocument();
    expect(getByText('Education')).toBeInTheDocument();
  });

  it('should show confetti initially', () => {
    const { getByTestId } = render(
      <CongratulationsPage targetAmount={8000000} goals={mockGoals} />
    );

    expect(getByTestId('confetti')).toBeInTheDocument();
  });

  it('should match snapshot of congratulations content', () => {
    const { container } = render(
      <CongratulationsPage targetAmount={5000000} goals={mockGoals} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should handle empty goals list', () => {
    const { getByText } = render(
      <CongratulationsPage targetAmount={0} goals={[]} />
    );

    expect(getByText(/Congratulations!/i)).toBeInTheDocument();
  });

  it('should handle single goal', () => {
    const { getByText } = render(
      <CongratulationsPage
        targetAmount={1000000}
        goals={[{ name: 'Vacation', amount: 1000000 }]}
      />
    );

    expect(getByText('Vacation')).toBeInTheDocument();
    expect(getByText('1,000,000')).toBeInTheDocument();
  });
});
