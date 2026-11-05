import { render, screen, fireEvent, within } from '@testing-library/react';
import GoalDetail from './index';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import { DEFAULT_INVESTMENT_ALLOCATIONS } from '../../../../domain/constants';
import { GoalFunding } from '../../../../domain/goalFunding';

vi.mock('@mui/x-charts/LineChart', () => ({ LineChart: () => <div data-testid="chart" /> }));
vi.mock('../../../Home/components/FinancialGoalForm', () => ({
  default: () => <div data-testid="goal-form" />,
}));
vi.mock('../GoalCard/components/LogEntryForm', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="sip-form" /> : null),
}));
const deleteSpy = vi.fn();
vi.mock('../../../../store/plannerDataActions', () => ({
  deleteFinancialGoal: (...args: unknown[]) => deleteSpy(...args),
}));

const goal = new FinancialGoal('House Downpayment', GoalType.ONE_TIME, '2026-01-01', '2033-03-01', 2500000);
const sip = { id: 's1', name: 'HDFC Top 100', type: 'Large Cap Mutual Funds', monthlyAmount: 6000 };
const funding: GoalFunding = {
  requiredMonthly: 16155,
  investingMonthly: 5635,
  fundedValue: 300000,
  fundedPercent: 12,
  contributions: [{ sip, monthly: 5635, annualReturnPct: 12, from: '2026-09-01' }],
};

const onBack = vi.fn();
const renderDetail = () =>
  render(
    <GoalDetail
      goal={goal}
      funding={funding}
      riskStatus="on-track"
      investmentAllocations={DEFAULT_INVESTMENT_ALLOCATIONS}
      investmentTypes={[]}
      selectedDate="2026-11-01"
      dispatch={vi.fn()}
      onBack={onBack}
    />,
  );

describe('GoalDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the header, stats and linked SIPs with this goal’s share', () => {
    renderDetail();
    expect(screen.getByRole('heading', { name: 'House Downpayment' })).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
    expect(screen.getByText('Long Term goal · Started Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('$16,155')).toBeInTheDocument();
    expect(screen.getByText('6 yrs')).toBeInTheDocument();
    expect(screen.getByText('1 linked')).toBeInTheDocument();
    expect(screen.getByText(/of \$6,000/)).toBeInTheDocument();
  });

  it('lists implied monthly instalments up to the selected month, newest first', () => {
    renderDetail();
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(3); // Sep, Oct, Nov
    expect(within(rows[0]).getByText('Nov 1, 2026')).toBeInTheDocument();
  });

  it('goes back and opens the edit form', () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: /back to my goals/i }));
    expect(onBack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Edit goal' }));
    expect(screen.getByTestId('goal-form')).toBeInTheDocument();
  });

  it('deletes only after confirming', () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: 'Delete goal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteSpy).toHaveBeenCalledWith(expect.anything(), goal.id);
  });
});
