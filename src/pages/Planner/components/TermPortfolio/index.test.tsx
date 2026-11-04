import { render, screen, fireEvent, within } from '@testing-library/react';
import TermPortfolio from './index';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType, TermType } from '../../../../types/enums';
import { GoalFunding } from '../../../../domain/goalFunding';

vi.mock('@mui/x-charts', () => ({ PieChart: () => <div data-testid="pie" /> }));
vi.mock('../GoalCard/components/LogEntryForm', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="sip-form" /> : null),
}));

const ASOF = '2026-11-01';
const house = new FinancialGoal('House Downpayment', GoalType.ONE_TIME, '2026-01-01', '2034-01-01', 1000000);
const child = new FinancialGoal("Child's Education", GoalType.ONE_TIME, '2026-01-01', '2038-01-01', 2000000);

const hdfc = { id: 'h', name: 'HDFC Top 100', type: 'Large Cap Mutual Funds', monthlyAmount: 6000 };
const rd = { id: 'r', name: 'Post Office RD', type: 'Recurring Deposit', monthlyAmount: 2000 };

const funding: Record<string, GoalFunding> = {
  [house.id]: {
    requiredMonthly: 10000,
    investingMonthly: 8000,
    fundedValue: 840000,
    fundedPercent: 40,
    contributions: [
      { sip: hdfc, monthly: 6000, annualReturnPct: 8, from: '2026-01-01' },
      { sip: rd, monthly: 2000, annualReturnPct: 6, from: '2026-01-01' },
    ],
  },
  [child.id]: { requiredMonthly: 5000, investingMonthly: 0, fundedValue: 0, fundedPercent: 0, contributions: [] },
};

const onGoalClick = vi.fn();
const renderPage = (goals = [house, child]) =>
  render(
    <TermPortfolio
      term={TermType.LONG_TERM}
      goals={goals}
      funding={funding}
      riskStatuses={{ [house.id]: 'on-track', [child.id]: 'at-risk' }}
      termStatus="at-risk"
      idealAllocation={[
        { investmentName: 'Large Cap Mutual Funds', investmentPercentage: 75, expectedReturnPercentage: 8 },
        { investmentName: 'Recurring Deposit', investmentPercentage: 25, expectedReturnPercentage: 6 },
      ]}
      investmentTypes={[]}
      selectedDate={ASOF}
      dispatch={vi.fn()}
      onBack={vi.fn()}
      onGoalClick={onGoalClick}
      onNewGoal={vi.fn()}
    />,
  );

describe('TermPortfolio', () => {
  it('summarises the term and its goals', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Long Term Portfolio' })).toBeInTheDocument();
    expect(screen.getByText(/Blends 2 goals · 5\+ years horizon/)).toBeInTheDocument();
    expect(screen.getByText('Monthly Required').nextSibling).toHaveTextContent('$15,000');
    expect(screen.getByText('Monthly Investing').nextSibling).toHaveTextContent('$8,000');

    fireEvent.click(screen.getByRole('button', { name: "Open Child's Education" }));
    expect(onGoalClick).toHaveBeenCalledWith(child.id);
  });

  it('lists each SIP with its linked goal, share and a weighted return', () => {
    renderPage();
    const row = screen.getByText('HDFC Top 100').closest('tr')!;
    expect(within(row).getByText('Large Cap')).toBeInTheDocument();
    expect(within(row).getByText('House Downpayment')).toBeInTheDocument();
    expect(within(row).getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('~7.5%')).toBeInTheDocument();
  });

  it('says the mix matches the plan and flags goals with no SIP', () => {
    renderPage();
    expect(screen.getByText('Aligned with plan')).toBeInTheDocument();
    expect(screen.getByText(/Child's Education has no SIP counting towards it/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: "Start SIP for Child's Education" }));
    expect(screen.getByTestId('sip-form')).toBeInTheDocument();
  });

  it('compares the mix to the plan on request', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /compare to plan mix/i }));
    const table = screen.getByText('Asset class').closest('table')!;
    expect(within(table).getByText('Equity')).toBeInTheDocument();
  });

  it('shows an empty state for a term with no goals', () => {
    renderPage([]);
    expect(screen.getByText('No long term goals')).toBeInTheDocument();
  });
});
