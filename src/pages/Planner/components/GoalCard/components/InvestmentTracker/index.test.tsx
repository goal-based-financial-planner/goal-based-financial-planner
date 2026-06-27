import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentTracker from './index';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { InvestmentSuggestion } from '../../../../../../types/planner';

vi.mock('../../../GoalGrowthChart', () => ({
  default: () => <div data-testid="goal-growth-chart">Growth Chart</div>,
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

  it('renders the growth chart', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByTestId('goal-growth-chart')).toBeInTheDocument();
  });

  it('renders the Add SIP button', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByRole('button', { name: /add sip/i })).toBeInTheDocument();
  });

  it('renders comparison cards for each suggestion type', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[sip]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getAllByText('Liquid Funds').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Index Funds').length).toBeGreaterThanOrEqual(1);
  });

  it('renders SIP list section when SIPs exist', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[sip]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText('Axis Bank Liquid Fund')).toBeInTheDocument();
  });

  it('shows "Not in plan" chip for custom SIP types', () => {
    const customSip: SIPEntry = { id: 'c1', name: 'PPF', type: 'PPF', monthlyAmount: 12500 };
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[customSip]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText('Not in plan')).toBeInTheDocument();
  });

  it('shows monthly required and "No SIPs logged yet" when no SIPs', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText('Monthly Required')).toBeInTheDocument();
    expect(screen.getByText('Monthly Investing')).toBeInTheDocument();
    expect(screen.getByText('No SIPs logged yet')).toBeInTheDocument();
  });

  it('shows "short" status when investing less than required', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[sip]} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText(/short/i)).toBeInTheDocument();
  });

  it('shows "On track" when investing at least as much as required', () => {
    const fullSips: SIPEntry[] = [
      { id: 's1', name: 'Liquid', type: 'Liquid Funds', monthlyAmount: 25000 },
      { id: 's2', name: 'Index', type: 'Index Funds', monthlyAmount: 50000 },
    ];
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={fullSips} goals={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getAllByText('On track').length).toBeGreaterThanOrEqual(1);
  });
});
