import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentTracker from './index';
import { SIPEntry } from '../../../../../../types/investmentLog';
import { InvestmentSuggestion } from '../../../../../../types/planner';

vi.mock('@mui/x-charts/LineChart', () => ({
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

  it('uses projectionYears in the chart title when provided', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} dispatch={mockDispatch} projectionYears={20} />,
    );
    expect(screen.getByText('Portfolio Growth Projection (20 years)')).toBeInTheDocument();
  });

  it('uses singular "year" when projectionYears is 1', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} dispatch={mockDispatch} projectionYears={1} />,
    );
    expect(screen.getByText('Portfolio Growth Projection (1 year)')).toBeInTheDocument();
  });

  it('shows monthly required and "No SIPs logged yet" when no SIPs', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText('Monthly Required')).toBeInTheDocument();
    expect(screen.getByText('Monthly Investing')).toBeInTheDocument();
    expect(screen.getByText('No SIPs logged yet')).toBeInTheDocument();
  });

  it('shows "short" status when investing less than required', () => {
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={[sip]} dispatch={mockDispatch} />,
    );
    expect(screen.getByText(/short/i)).toBeInTheDocument();
  });

  it('shows "On track" when investing at least as much as required', () => {
    const fullSips: SIPEntry[] = [
      { id: 's1', name: 'Liquid', type: 'Liquid Funds', monthlyAmount: 25000 },
      { id: 's2', name: 'Index', type: 'Index Funds', monthlyAmount: 50000 },
    ];
    render(
      <InvestmentTracker investmentSuggestions={suggestions} sips={fullSips} dispatch={mockDispatch} />,
    );
    expect(screen.getAllByText('On track').length).toBeGreaterThanOrEqual(1);
  });
});
