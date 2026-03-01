import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InvestmentSuggestionsBox from './index';
import { TermType } from '../../../../types/enums';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

// Mock child components
jest.mock('../GoalCard/components/InvestmentTracker', () => {
  return function MockInvestmentTracker() {
    return <div data-testid="investment-tracker">Investment Tracker</div>;
  };
});

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
    [TermType.SHORT_TERM]: [
      { investmentName: 'High Yield Savings', investmentPercentage: 50, expectedReturnPercentage: 5 },
      { investmentName: 'Liquid Funds', investmentPercentage: 50, expectedReturnPercentage: 6 },
    ],
    [TermType.MEDIUM_TERM]: [
      { investmentName: 'Short Duration Funds', investmentPercentage: 40, expectedReturnPercentage: 7 },
      { investmentName: 'Corporate Bonds', investmentPercentage: 60, expectedReturnPercentage: 8 },
    ],
    [TermType.LONG_TERM]: [
      { investmentName: 'Index Funds', investmentPercentage: 60, expectedReturnPercentage: 12 },
      { investmentName: 'Equity Mutual Funds', investmentPercentage: 40, expectedReturnPercentage: 14 },
    ],
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
            { investmentName: 'High Yield Savings', amount: 25000, expectedReturnPercentage: 5 },
            { investmentName: 'Liquid Funds', amount: 25000, expectedReturnPercentage: 6 },
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
            { investmentName: 'Index Funds', amount: 2400000, expectedReturnPercentage: 12 },
            { investmentName: 'Equity Mutual Funds', amount: 1600000, expectedReturnPercentage: 14 },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Suggestions and My Portfolio tabs', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    expect(screen.getByRole('tab', { name: /suggestions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /my portfolio/i })).toBeInTheDocument();
  });

  it('should show suggestions tab content by default', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    expect(screen.getByText(/Investments for Short Term/i)).toBeInTheDocument();
    expect(screen.getByText(/Investments for Long Term/i)).toBeInTheDocument();
  });

  it('should show My Portfolio tab when clicked', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: /my portfolio/i }));
    expect(screen.getByTestId('investment-tracker')).toBeInTheDocument();
  });

  it('should open modal when customize button is clicked', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    const tuneButtons = screen.getAllByRole('button').filter(btn => btn.textContent === 'tune');
    fireEvent.click(tuneButtons[0]);
    expect(screen.getByTestId('investment-allocations')).toBeInTheDocument();
  });

  it('should close modal when handleSubmit is called', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    const tuneButtons = screen.getAllByRole('button').filter(btn => btn.textContent === 'tune');
    fireEvent.click(tuneButtons[0]);
    expect(screen.getByTestId('investment-allocations')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Submit'));
  });

  it('should filter out term types with no investment suggestions', () => {
    const emptyBreakdown = [
      {
        termType: TermType.SHORT_TERM,
        investmentBreakdown: [
          { goalName: 'Goal', targetAmount: 100000, currentValue: 100000, investmentSuggestions: [] },
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
              { investmentName: 'Index Funds', amount: 2400000, expectedReturnPercentage: 12 },
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
        investmentLogs={[]}
      />
    );
    expect(screen.queryByText(/Investments for Short Term/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Investments for Long Term/i)).toBeInTheDocument();
  });

  it('should show empty state when all breakdowns have no suggestions', () => {
    const emptyBreakdown = [
      {
        termType: TermType.SHORT_TERM,
        investmentBreakdown: [
          { goalName: 'Goal', targetAmount: 100000, currentValue: 100000, investmentSuggestions: [] },
        ],
      },
    ];

    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={emptyBreakdown}
        investmentLogs={[]}
      />
    );
    expect(screen.getByText(/Add financial goals to see investment suggestions/i)).toBeInTheDocument();
  });
});
