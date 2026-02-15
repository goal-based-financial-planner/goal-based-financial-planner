import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentSuggestionsDoughnutChart from './index';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { useMediaQuery } from '@mui/material';

// Mock MUI PieChart
jest.mock('@mui/x-charts', () => ({
  PieChart: ({ series, colors }: any) => (
    <div data-testid="doughnut-chart">
      <div data-testid="chart-colors">{JSON.stringify(colors)}</div>
      <div data-testid="chart-data">{JSON.stringify(series[0].data)}</div>
    </div>
  ),
}));

// Mock useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

// Mock LiveCounter
jest.mock('../../../../components/LiveNumberCounter', () => {
  return function MockLiveCounter({ value }: any) {
    return <div data-testid="live-counter">{value}</div>;
  };
});

describe('InvestmentSuggestionsDoughnutChart', () => {
  const mockSuggestions: GoalWiseInvestmentSuggestions[] = [
    {
      goalName: 'Retirement',
      currentValue: 0,
      investmentSuggestions: [
        {
          investmentName: 'Large Cap Equity',
          amount: 2500000,
          expectedReturnPercentage: 12,
        },
        { investmentName: 'Gold', amount: 500000, expectedReturnPercentage: 8 },
      ],
    },
    {
      goalName: 'House',
      currentValue: 0,
      investmentSuggestions: [
        {
          investmentName: 'Large Cap Equity',
          amount: 1000000,
          expectedReturnPercentage: 12,
        },
        { investmentName: 'PPF', amount: 1000000, expectedReturnPercentage: 7 },
      ],
    },
  ];

  it('should render doughnut chart', () => {
    render(
      <InvestmentSuggestionsDoughnutChart suggestions={mockSuggestions} />,
    );
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
  });

  it('should display total amount in center', () => {
    render(
      <InvestmentSuggestionsDoughnutChart suggestions={mockSuggestions} />,
    );
    const liveCounter = screen.getByTestId('live-counter');
    // Total: 2.5M + 0.5M + 1M + 1M = 5M
    expect(liveCounter.textContent).toBe('5000000');
  });

  it('should aggregate investment amounts', () => {
    render(
      <InvestmentSuggestionsDoughnutChart suggestions={mockSuggestions} />,
    );
    const chartData = screen.getByTestId('chart-data');
    // Large Cap should be aggregated: 2.5M + 1M = 3.5M
    expect(chartData.textContent).toContain('"value":3500000');
  });

  it('should handle empty suggestions', () => {
    render(
      <InvestmentSuggestionsDoughnutChart suggestions={[]} />,
    );
    const liveCounter = screen.getByTestId('live-counter');
    expect(liveCounter.textContent).toBe('0');
  });

  it('should match snapshot', () => {
    const { container } = render(
      <InvestmentSuggestionsDoughnutChart suggestions={mockSuggestions} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render with mobile sizing when on mobile device', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(
      <InvestmentSuggestionsDoughnutChart suggestions={mockSuggestions} />,
    );
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
  });

  it('should render with desktop sizing when on desktop device', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(
      <InvestmentSuggestionsDoughnutChart suggestions={mockSuggestions} />,
    );
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
  });
});
