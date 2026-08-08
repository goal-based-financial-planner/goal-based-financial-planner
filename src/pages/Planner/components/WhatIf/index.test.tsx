import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WhatIf from './index';
import { PlannerData } from '../../../../domain/PlannerData';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType, TermType } from '../../../../types/enums';
import { SIPEntry } from '../../../../types/investmentLog';

vi.mock('@mui/x-charts/LineChart', () => ({
  LineChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
}));
vi.mock('@mui/x-charts', () => ({
  ChartsReferenceLine: () => <div data-testid="reference-line" />,
}));

function longTermAllocations() {
  return {
    [TermType.SHORT_TERM]: [],
    [TermType.MEDIUM_TERM]: [],
    [TermType.LONG_TERM]: [
      { investmentName: 'Equity', investmentPercentage: 100, expectedReturnPercentage: 0 },
    ],
  };
}

function makeGoal(): FinancialGoal {
  const targetYear = new Date().getFullYear() + 10;
  // inflationRate 0 keeps the target amount exactly 1,000,000 — no need to know DEFAULT_INFLATION_RATE.
  return new FinancialGoal(
    'House', GoalType.ONE_TIME, `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 1_000_000, undefined, 0,
  );
}

// With 0% return, invested value is simply monthlyAmount * months — 8334 * 120 = 1,000,080,
// just over the 1,000,000 target, so the baseline plan is on track with no shortfall warning.
function fundingSIP(startDate: string): SIPEntry[] {
  return [{ id: 'sip-1', name: 'Equity SIP', type: 'Equity', monthlyAmount: 8334, startDate }];
}

describe('WhatIf', () => {
  it('shows an empty-state message when there are no one-time goals', () => {
    const plannerData = new PlannerData([], longTermAllocations());
    render(<WhatIf plannerData={plannerData} />);

    expect(screen.getByText(/add a goal to start exploring what-if scenarios/i)).toBeInTheDocument();
  });

  it('renders an inflation slider per goal and a return slider per investment type', () => {
    const plannerData = new PlannerData([makeGoal()], longTermAllocations());
    render(<WhatIf plannerData={plannerData} />);

    expect(screen.getByLabelText('House inflation rate')).toBeInTheDocument();
    expect(screen.getByLabelText('Equity expected return')).toBeInTheDocument();
  });

  it('shows no shortfall warning and a disabled Reset button by default, when on track', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), fundingSIP(goal.getInvestmentStartDate()));
    render(<WhatIf plannerData={plannerData} />);

    expect(screen.queryByText(/short by/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
  });

  it('shows a shortfall warning under the graph and enables Reset when the inflation slider moves', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), fundingSIP(goal.getInvestmentStartDate()));
    render(<WhatIf plannerData={plannerData} />);

    const slider = screen.getByLabelText('House inflation rate');
    fireEvent.change(slider, { target: { value: '20' } });

    expect(screen.getByText(/short by/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeEnabled();
  });

  it('shows a shortfall warning under the graph and enables Reset when the inflation value input changes', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), fundingSIP(goal.getInvestmentStartDate()));
    render(<WhatIf plannerData={plannerData} />);

    const input = screen.getByLabelText('House inflation rate value');
    fireEvent.change(input, { target: { value: '20' } });

    expect(screen.getByText(/short by/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeEnabled();
  });

  it('resets adjustments back to baseline when Reset is clicked', () => {
    const goal = makeGoal();
    const plannerData = new PlannerData([goal], longTermAllocations(), fundingSIP(goal.getInvestmentStartDate()));
    render(<WhatIf plannerData={plannerData} />);

    const slider = screen.getByLabelText('House inflation rate');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText(/short by/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.queryByText(/short by/i)).not.toBeInTheDocument();
  });
});
