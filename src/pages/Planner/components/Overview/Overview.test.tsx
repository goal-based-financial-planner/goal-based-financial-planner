import { render, screen, fireEvent, within } from '@testing-library/react';
import { TermType } from '../../../../types/enums';
import { SIPEntry } from '../../../../types/investmentLog';
import OverviewStatCards from './OverviewStatCards';
import AllocationPlanCard from './AllocationPlanCard';
import GoalProgressCard from './GoalProgressCard';
import ActiveSipsCard from './ActiveSipsCard';
import PlanVsSipsCard from './PlanVsSipsCard';

vi.mock('@mui/x-charts', () => ({ PieChart: () => <div data-testid="pie" /> }));

const deleteSpy = vi.fn();
vi.mock('../../../../store/plannerDataActions', () => ({
  deleteInvestmentLogEntry: (...args: unknown[]) => deleteSpy(...args),
}));
vi.mock('../GoalCard/components/LogEntryForm', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="sip-form" /> : null),
}));

const sip = (id: string, type: string, monthlyAmount: number): SIPEntry => ({
  id,
  name: `${type} fund`,
  type,
  monthlyAmount,
});

const ideal = [
  {
    termType: TermType.SHORT_TERM,
    total: 1000,
    slices: [{ investmentName: 'Bank Recurring Deposits (FD)', amount: 1000, percentage: 100 }],
  },
  {
    termType: TermType.LONG_TERM,
    total: 2000,
    slices: [{ investmentName: 'Large Cap Equity Mutual Funds', amount: 2000, percentage: 100 }],
  },
];

describe('OverviewStatCards', () => {
  it('shows the share of the monthly requirement met and chips for present terms', () => {
    const onTermClick = vi.fn();
    render(
      <OverviewStatCards
        targetAmount={100000}
        totalRequired={1000}
        totalInvesting={250}
        termsPresent={[TermType.LONG_TERM, TermType.SHORT_TERM]}
        onTermClick={onTermClick}
      />,
    );
    expect(screen.getByText('25% met')).toBeInTheDocument();
    expect(screen.queryByText('Mid')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open long term portfolio/i }));
    expect(onTermClick).toHaveBeenCalledWith(TermType.LONG_TERM);
  });
});

describe('AllocationPlanCard', () => {
  const renderCard = () =>
    render(
      <AllocationPlanCard
        idealAllocations={ideal}
        termStatuses={{ [TermType.SHORT_TERM]: 'at-risk', [TermType.LONG_TERM]: 'on-track' }}
        goalCount={2}
        emptyMessage="Nothing active"
        onCustomize={vi.fn()}
        onOpenTerm={onOpenTerm}
        onViewGoals={vi.fn()}
      />,
    );
  const onOpenTerm = vi.fn();

  it('opens a term portfolio from the term name', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Open Long Term portfolio' }));
    expect(onOpenTerm).toHaveBeenCalledWith(TermType.LONG_TERM);
  });

  it('shows each term of the plan with its status', () => {
    renderCard();
    expect(screen.getByText('Short Term')).toBeInTheDocument();
    expect(screen.getByText('At risk')).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Current' })).not.toBeInTheDocument();
  });

  it('filters to a single term', () => {
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Long' }));
    expect(screen.queryByText('Short Term')).not.toBeInTheDocument();
    expect(screen.getByText('Long Term')).toBeInTheDocument();
  });

  it('shows the empty message when nothing is planned', () => {
    render(
      <AllocationPlanCard
        idealAllocations={[]}
        termStatuses={{}}
        goalCount={1}
        emptyMessage="Nothing active"
        onCustomize={vi.fn()}
        onOpenTerm={vi.fn()}
        onViewGoals={vi.fn()}
      />,
    );
    expect(screen.getByText('Nothing active')).toBeInTheDocument();
  });
});

describe('PlanVsSipsCard', () => {
  const planned = [
    { investmentName: 'Bank Recurring Deposits (FD)', amount: 1000, expectedReturnPercentage: 6 },
    { investmentName: 'Large Cap Equity Mutual Funds', amount: 151, expectedReturnPercentage: 12 },
  ];

  it('compares SIPs to the plan per instrument', () => {
    render(
      <PlanVsSipsCard
        planned={planned}
        sips={[
          sip('1', 'Large Cap Equity Mutual Funds', 1000),
          sip('2', 'Bank Recurring Deposits (FD)', 500),
          sip('3', 'Crypto', 300),
        ]}
      />,
    );
    const large = screen.getByText('Large Cap Equity Mutual Funds').closest('li')!;
    expect(within(large).getByText('Exceeding')).toBeInTheDocument();
    expect(within(large).getByText('$1,000 of $151/mo')).toBeInTheDocument();
    expect(within(large).getByText('$849 over')).toBeInTheDocument();

    const rd = screen.getByText('Bank Recurring Deposits (FD)').closest('li')!;
    expect(within(rd).getByText('50% met')).toBeInTheDocument();
    expect(within(rd).getByText('$500 short')).toBeInTheDocument();

    const crypto = screen.getByText('Crypto').closest('li')!;
    expect(within(crypto).getByText('Not in plan')).toBeInTheDocument();
  });

  it('shows every planned instrument at 0% met when no SIPs are logged', () => {
    render(<PlanVsSipsCard planned={planned} sips={[]} />);
    expect(screen.getAllByText('0% met')).toHaveLength(2);
  });
});

describe('GoalProgressCard', () => {
  it('lists each goal with its progress and opens a goal on click', () => {
    const onGoalClick = vi.fn();
    render(
      <GoalProgressCard
        goals={[{ id: 'a', name: 'House', progress: 12 }, { id: 'b', name: 'Trip', progress: 0 }]}
        onViewGoals={vi.fn()}
        onGoalClick={onGoalClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'House' }));
    expect(onGoalClick).toHaveBeenCalledWith('a');
    expect(screen.getByRole('progressbar', { name: 'House progress' })).toHaveAttribute('aria-valuenow', '12');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

describe('ActiveSipsCard', () => {
  it('lists SIPs with a shortened type caption, deletes and opens the form', () => {
    render(
      <ActiveSipsCard
        sips={[sip('1', 'Large Cap Equity Mutual Funds', 3300)]}
        investmentTypes={[]}
        dispatch={vi.fn()}
      />,
    );
    const item = screen.getByRole('listitem');
    expect(within(item).getByText('Large Cap · Monthly')).toBeInTheDocument();
    expect(screen.getByText('1 linked')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(deleteSpy).toHaveBeenCalledWith(expect.anything(), '1');

    fireEvent.click(screen.getByRole('button', { name: /link another investment/i }));
    expect(screen.getByTestId('sip-form')).toBeInTheDocument();
  });
});
