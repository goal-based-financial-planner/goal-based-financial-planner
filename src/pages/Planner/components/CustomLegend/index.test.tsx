import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomLegend from './index';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';
import { useMediaQuery } from '@mui/material';

// Mock formatNumber
jest.mock('../../../../types/util', () => ({
  formatNumber: (num: number) => num.toLocaleString('en-US'),
}));

// Mock useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

describe('CustomLegend', () => {
  const mockSuggestions: GoalWiseInvestmentSuggestions[] = [
    {
      goalName: 'Retirement',
      currentValue: 0,
      investmentSuggestions: [
        {
          investmentName: 'Large Cap Equity',
          amount: 3000000,
          expectedReturnPercentage: 12,
        },
        { investmentName: 'Gold', amount: 1000000, expectedReturnPercentage: 8 },
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

  it('should render legend with investment summary', () => {
    render(<CustomLegend suggestions={mockSuggestions} />);
    expect(screen.getByText('Large Cap Equity')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('PPF')).toBeInTheDocument();
  });

  it('should aggregate amounts for same investment type', () => {
    render(<CustomLegend suggestions={mockSuggestions} />);
    // Large Cap should be 3M + 1M = 4M
    expect(screen.getByText('4,000,000')).toBeInTheDocument();
  });

  it('should handle empty suggestions', () => {
    render(<CustomLegend suggestions={[]} />);
    const tbody = screen.queryByRole('rowgroup');
    expect(tbody).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(<CustomLegend suggestions={mockSuggestions} />);
    expect(container).toMatchSnapshot();
  });

  it('should render with mobile sizing when on mobile device', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<CustomLegend suggestions={mockSuggestions} />);
    expect(screen.getByText('Large Cap Equity')).toBeInTheDocument();
  });

  it('should render with desktop sizing when on desktop device', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<CustomLegend suggestions={mockSuggestions} />);
    expect(screen.getByText('Large Cap Equity')).toBeInTheDocument();
  });
});
