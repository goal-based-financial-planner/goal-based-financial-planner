import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InvestmentSuggestionsBox from './index';
import { TermType } from '../../../../types/enums';
import { InvestmentAllocationsType } from '../../../../domain/InvestmentOptions';

vi.mock('../GoalCard/components/InvestmentTracker', () => ({
  default: function MockInvestmentTracker() {
    return <div data-testid="investment-tracker">Investment Tracker</div>;
  },
}));

vi.mock('../InvestmentAllocations', async () => {
  const React = await import('react');
  return {
    default: React.forwardRef(function MockInvestmentAllocations(
      { onSubmit, termType }: { onSubmit?: () => void; termType?: string },
      ref: React.Ref<HTMLDivElement>,
    ) {
      return (
        <div ref={ref} tabIndex={-1} data-testid="investment-allocations">
          Investment Allocations for {termType}
          <button onClick={onSubmit}>Submit</button>
        </div>
      );
    }),
  };
});

vi.mock('../CustomLegend', () => ({
  default: function MockCustomLegend({ label, onCustomize }: { label?: string; onCustomize?: () => void }) {
    return (
      <div data-testid="custom-legend">
        {label && <span>{label}</span>}
        {onCustomize && <button onClick={onCustomize}>tune</button>}
      </div>
    );
  },
}));

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

  it('renders both Allocation Plan and Investment Tracker sections simultaneously', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    expect(screen.getByText(/allocation plan/i)).toBeInTheDocument();
    expect(screen.getByTestId('investment-tracker')).toBeInTheDocument();
  });

  it('shows term type headings in the allocation column', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    expect(screen.getByText(TermType.SHORT_TERM)).toBeInTheDocument();
    expect(screen.getByText(TermType.LONG_TERM)).toBeInTheDocument();
  });

  it('renders the Investment Tracker without any tab click', () => {
    render(
      <InvestmentSuggestionsBox
        dispatch={mockDispatch}
        investmentAllocations={mockInvestmentAllocations}
        investmentBreakdownBasedOnTermType={mockInvestmentBreakdown}
        investmentLogs={[]}
      />
    );
    expect(screen.getByTestId('investment-tracker')).toBeInTheDocument();
  });

  it('opens modal when customize button is clicked', () => {
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

  it('closes modal when handleSubmit is called', () => {
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

  it('filters out term types with no investment suggestions', () => {
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
    expect(screen.queryByText(TermType.SHORT_TERM)).not.toBeInTheDocument();
    expect(screen.getByText(TermType.LONG_TERM)).toBeInTheDocument();
  });

  it('shows empty state when all breakdowns have no suggestions', () => {
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
