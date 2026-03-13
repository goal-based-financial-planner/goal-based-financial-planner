import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentTracker from './index';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { InvestmentSuggestion } from '../../../../../../types/planner';

jest.mock('@mui/x-charts/LineChart', () => ({
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
}));

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

  it('renders the growth projection chart', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Growth Projection (10 years)')).toBeInTheDocument();
  });

  it('renders the Add SIP button', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByRole('button', { name: /add sip/i })).toBeInTheDocument();
  });

  it('renders comparison cards for each suggestion type', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[sip]} dispatch={mockDispatch} />,
    );
    expect(screen.getAllByText('Liquid Funds').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Index Funds').length).toBeGreaterThanOrEqual(1);
  });

  it('renders SIP list section when SIPs exist', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[sip]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText('Axis Bank Liquid Fund')).toBeInTheDocument();
  });

  it('shows "Not in plan" chip for custom SIP types', () => {
    const customSip: SIPEntry = { id: 'c1', name: 'PPF', type: 'PPF', monthlyAmount: 12500 };
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[customSip]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText('Not in plan')).toBeInTheDocument();
  });

  it('shows helper text when no SIPs added yet', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText(/add sips to see/i)).toBeInTheDocument();
  });
});
