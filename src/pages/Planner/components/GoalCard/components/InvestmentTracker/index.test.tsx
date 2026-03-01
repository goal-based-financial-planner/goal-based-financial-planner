import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentTracker from './index';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { InvestmentSuggestion } from '../../../../../../types/planner';

const mockDispatch = jest.fn();

const suggestions: InvestmentSuggestion[] = [
  { investmentName: 'Liquid Funds', amount: 25000, expectedReturnPercentage: 6 },
  { investmentName: 'Index Funds', amount: 50000, expectedReturnPercentage: 12 },
];

const sip: SIPEntry = {
  id: 'sip-1',
  name: 'Axis Bank Liquid Fund',
  type: 'Liquid Funds',
  monthlyAmount: 40000,
};

describe('InvestmentTracker', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders the Add SIP button', () => {
    render(
      <InvestmentTracker
        investmentSuggestions={suggestions}
        sips={[]}
        dispatch={mockDispatch}
      />,
    );
    expect(screen.getByRole('button', { name: /add sip/i })).toBeInTheDocument();
  });

  it('renders summary totals section', () => {
    render(
      <InvestmentTracker
        investmentSuggestions={suggestions}
        sips={[sip]}
        dispatch={mockDispatch}
      />,
    );
    expect(screen.getByText('Your Monthly SIPs')).toBeInTheDocument();
    expect(screen.getByText('Monthly Suggested')).toBeInTheDocument();
    expect(screen.getByText('Difference')).toBeInTheDocument();
  });

  it('shows a comparison table row for each suggestion type', () => {
    render(
      <InvestmentTracker
        investmentSuggestions={suggestions}
        sips={[sip]}
        dispatch={mockDispatch}
      />,
    );
    expect(screen.getByText('Comparison by instrument type')).toBeInTheDocument();
    expect(screen.getAllByText('Liquid Funds').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Index Funds')).toBeInTheDocument();
  });

  it('renders SIP list when SIPs exist', () => {
    render(
      <InvestmentTracker
        investmentSuggestions={suggestions}
        sips={[sip]}
        dispatch={mockDispatch}
      />,
    );
    expect(screen.getByText('Your SIPs')).toBeInTheDocument();
    expect(screen.getByText('Axis Bank Liquid Fund')).toBeInTheDocument();
  });

  it('does not render SIP list when no SIPs exist', () => {
    render(
      <InvestmentTracker
        investmentSuggestions={suggestions}
        sips={[]}
        dispatch={mockDispatch}
      />,
    );
    expect(screen.queryByText('Your SIPs')).not.toBeInTheDocument();
  });
});
