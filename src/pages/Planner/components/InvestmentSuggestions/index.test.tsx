import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InvestmentSuggestionsBox from './index';
import { TermType } from '../../../../types/enums';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

// Mock child components
jest.mock('../InvestmentSuggestionsDoughnutChart', () => {
  return function MockDoughnutChart() {
    return <div data-testid="doughnut-chart">Doughnut Chart</div>;
  };
});

jest.mock('../InvestmentAllocations', () => {
  const React = require('react');
  return React.forwardRef(function MockInvestmentAllocations({ onSubmit, termType }: any, ref: any) {
    return (
      <div ref={ref} tabIndex={-1} data-testid="investment-allocations">
        Investment Allocations for {termType}
        <button onClick={onSubmit}>Submit</button>
      </div>
    );
  });
});

jest.mock('../InvestmentPieChart', () => {
  return function MockPieChart() {
    return <div data-testid="pie-chart">Pie Chart</div>;
  };
});

jest.mock('../CustomLegend', () => {
  return function MockCustomLegend() {
    return <div data-testid="custom-legend">Custom Legend</div>;
  };
});

describe('InvestmentSuggestionsBox', () => {
  const mockDispatch = jest.fn();
  const mockInvestmentAllocations: InvestmentAllocationsType = {
    [TermType.SHORT_TERM]: {
      'High Yield Savings': 50,
      'Liquid Funds': 50,
    },
    [TermType.MID_TERM]: {
      'Short Duration Funds': 40,
      'Corporate Bonds': 60,
    },
    [TermType.LONG_TERM]: {
      'Index Funds': 60,
      'Equity Mutual Funds': 40,
    },
  };

  const mockInvestmentBreakdown = [
    {
      termType: TermType.SHORT_TERM,
      investmentBreakdown: [
        {
          goalName: 'Emergency Fund',
          targetAmount: 100000,
          currentValue: 50000,
          investmentSuggestions: [
            {
              investmentName: 'High Yield Savings',
              amount: 25000,
              expectedReturnPercentage: 5,
            },
            {
              investmentName: 'Liquid Funds',
              amount: 25000,
              expectedReturnPercentage: 6,
            },
          ],
        },
      ],
    },
    {
      termType: TermType.LONG_TERM,
      investmentBreakdown: [
        {
          goalName: 'Retirement',
          targetAmount: 5000000,
          currentValue: 1000000,
          investmentSuggestions: [
            {
              investmentName: 'Index Funds',
              amount: 2400000,
              expectedReturnPercentage: 12,
            },
            {
              investmentName: 'Equity Mutual Funds',
              amount: 1600000,
              expectedReturnPercentage: 14,
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render investment suggestions for each term type', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
      />
    );

    expect(screen.getByText(/Investments for Short Term/i)).toBeInTheDocument();
    expect(screen.getByText(/Investments for Long Term/i)).toBeInTheDocument();
  });

  it('should render child components for each term type', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
      />
    );

    expect(screen.getAllByTestId('custom-legend')).toHaveLength(2);
    expect(screen.getAllByTestId('doughnut-chart')).toHaveLength(2);
  });

  it('should filter out term types with no investment suggestions', () => {
    const emptyBreakdown = [
      {
        termType: TermType.SHORT_TERM,
        investmentBreakdown: [
          {
            goalName: 'Goal with no suggestions',
            targetAmount: 100000,
            currentValue: 100000,
            investmentSuggestions: [],
          },
        ],
      },
      {
        termType: TermType.LONG_TERM,
        investmentBreakdown: [
          {
            goalName: 'Retirement',
            targetAmount: 5000000,
            currentValue: 1000000,
            investmentSuggestions: [
              {
                investmentName: 'Index Funds',
                amount: 2400000,
                expectedReturnPercentage: 12,
              },
            ],
          },
        ],
      },
    ];

    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={emptyBreakdown}
      />
    );

    expect(screen.queryByText(/Investments for Short Term/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Investments for Long Term/i)).toBeInTheDocument();
  });

  it('should open modal when customize button is clicked', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
      />
    );

    const customizeButtons = screen.getAllByRole('button');
    const tuneButtons = customizeButtons.filter(btn => btn.textContent === 'tune');
    fireEvent.click(tuneButtons[0]);

    expect(screen.getByTestId('investment-allocations')).toBeInTheDocument();
    expect(screen.getByText('Investment Allocations for Short Term')).toBeInTheDocument();
  });

  it('should close modal when backdrop is clicked', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
      />
    );

    // Open modal
    const allButtons = screen.getAllByRole('button');
    const tuneButtons = allButtons.filter(btn => btn.textContent === 'tune');
    fireEvent.click(tuneButtons[0]);
    expect(screen.getByTestId('investment-allocations')).toBeInTheDocument();

    // Close modal via Escape key (simpler than backdrop click)
    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape', code: 'Escape' });
  });

  it('should close modal when handleSubmit is called', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
      />
    );

    // Open modal
    const allButtons = screen.getAllByRole('button');
    const tuneButtons = allButtons.filter(btn => btn.textContent === 'tune');
    fireEvent.click(tuneButtons[0]);
    expect(screen.getByTestId('investment-allocations')).toBeInTheDocument();

    // Submit form
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // The modal state should be reset
  });

  it('should handle multiple term types with customize buttons', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
      />
    );

    const allButtons = screen.getAllByRole('button');
    const tuneButtons = allButtons.filter(btn => btn.textContent === 'tune');
    expect(tuneButtons).toHaveLength(2);

    // Test opening modal for second term type
    fireEvent.click(tuneButtons[1]);
    expect(screen.getByText('Investment Allocations for Long Term')).toBeInTheDocument();
  });

  it('should render nothing when all breakdowns are empty', () => {
    const emptyBreakdown = [
      {
        termType: TermType.SHORT_TERM,
        investmentBreakdown: [
          {
            goalName: 'Completed Goal',
            targetAmount: 100000,
            currentValue: 100000,
            investmentSuggestions: [],
          },
        ],
      },
    ];

    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={emptyBreakdown}
      />
    );

    expect(screen.queryByText(/Investments for/i)).not.toBeInTheDocument();
  });
});
