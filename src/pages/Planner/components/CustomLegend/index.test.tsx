import React from 'react';
import { render } from '@testing-library/react';
import CustomLegend from './index';
import { GoalWiseInvestmentSuggestions } from '../../hooks/useInvestmentCalculator';

// Mock formatNumber
jest.mock('../../../../types/util', () => ({
  formatNumber: (num: number) => num.toLocaleString('en-US'),
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
    const { getByText } = render(<CustomLegend suggestions={mockSuggestions} />);
    expect(getByText('Large Cap Equity')).toBeInTheDocument();
    expect(getByText('Gold')).toBeInTheDocument();
    expect(getByText('PPF')).toBeInTheDocument();
  });

  it('should aggregate amounts for same investment type', () => {
    const { getByText } = render(<CustomLegend suggestions={mockSuggestions} />);
    // Large Cap should be 3M + 1M = 4M
    expect(getByText('4,000,000')).toBeInTheDocument();
  });

  it('should handle empty suggestions', () => {
    const { container } = render(<CustomLegend suggestions={[]} />);
    expect(container.querySelector('tbody')?.children.length).toBe(0);
  });

  it('should match snapshot', () => {
    const { container } = render(<CustomLegend suggestions={mockSuggestions} />);
    expect(container).toMatchSnapshot();
  });
});
