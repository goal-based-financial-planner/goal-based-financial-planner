import React from 'react';
import { render, screen } from '@testing-library/react';
import GoalGrowthChart from './index';
import { SIPEntry } from '../../../../types/investmentLog';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import { InvestmentSuggestion } from '../../../../types/planner';

vi.mock('@mui/x-charts/LineChart', () => ({
  LineChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
}));
vi.mock('@mui/x-charts', () => ({
  ChartsReferenceLine: ({ label }: { label?: string }) => (
    <div data-testid="reference-line">{label}</div>
  ),
}));

function makeGoal(name: string, yearsFromNow: number): FinancialGoal {
  const targetYear = new Date().getFullYear() + yearsFromNow;
  return new FinancialGoal(name, GoalType.ONE_TIME, `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 100000);
}

const suggestions: InvestmentSuggestion[] = [
  { investmentName: 'Index Funds', amount: 10000, expectedReturnPercentage: 12 },
];

const sip: SIPEntry = {
  id: 's1',
  name: 'Index Fund SIP',
  type: 'Index Funds',
  monthlyAmount: 10000,
  startDate: `${new Date().getFullYear() - 2}-01-01`,
};

describe('GoalGrowthChart', () => {
  it('shows no-SIPs empty state when SIPs array is empty', () => {
    const goal = makeGoal('House', 5);
    render(<GoalGrowthChart sips={[]} goals={[goal]} allSuggestions={suggestions} />);
    expect(screen.getByText(/log your sips/i)).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('shows no-goals empty state when no one-time goals are provided', () => {
    render(<GoalGrowthChart sips={[sip]} goals={[]} allSuggestions={suggestions} />);
    expect(screen.getByText(/one-time financial goals/i)).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders chart when SIPs and one-time goals are present', () => {
    const goal = makeGoal('House', 5);
    render(<GoalGrowthChart sips={[sip]} goals={[goal]} allSuggestions={suggestions} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders a reference line labeled with each goal name', () => {
    const goal1 = makeGoal('House', 5);
    const goal2 = makeGoal('Car', 3);
    render(<GoalGrowthChart sips={[sip]} goals={[goal1, goal2]} allSuggestions={suggestions} />);
    const refLines = screen.getAllByTestId('reference-line');
    const goalLines = refLines.filter(
      (el) => el.textContent?.includes('House') || el.textContent?.includes('Car'),
    );
    expect(goalLines.length).toBe(2);
  });

  it('skips recurring goals and shows empty state when only recurring goals exist', () => {
    const recurring = new FinancialGoal(
      'Monthly Bills',
      GoalType.RECURRING,
      '2020-01-01',
      `${new Date().getFullYear() + 5}-01-01`,
      50000,
      1,
    );
    render(<GoalGrowthChart sips={[sip]} goals={[recurring]} allSuggestions={suggestions} />);
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    expect(screen.getByText(/one-time financial goals/i)).toBeInTheDocument();
  });

  it('renders the accessible aria-label container', () => {
    const goal = makeGoal('Retirement', 10);
    render(<GoalGrowthChart sips={[sip]} goals={[goal]} allSuggestions={suggestions} />);
    const container = document.querySelector('[aria-label="Portfolio growth projection chart"]');
    expect(container).not.toBeNull();
  });

  it('shows shortfall warning when portfolio goes negative after a goal withdrawal', () => {
    // Tiny SIP vs enormous goal → portfolio deeply negative → shortfall
    const tinyGoal = new FinancialGoal(
      'Mansion',
      GoalType.ONE_TIME,
      `${new Date().getFullYear() - 8}-01-01`,
      `${new Date().getFullYear() + 3}-01-01`,
      10_000_000,
    );
    const tinySip: SIPEntry = { ...sip, monthlyAmount: 500 };
    render(<GoalGrowthChart sips={[tinySip]} goals={[tinyGoal]} allSuggestions={[]} />);
    expect(screen.getByText(/portfolio short by/i)).toBeInTheDocument();
  });

  it('renders chart without "If on plan" series when allSuggestions is empty', () => {
    const goal = makeGoal('House', 5);
    render(<GoalGrowthChart sips={[sip]} goals={[goal]} allSuggestions={[]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
