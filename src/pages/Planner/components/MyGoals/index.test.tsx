import { render, screen, fireEvent, within } from '@testing-library/react';
import dayjs from 'dayjs';
import MyGoals from './index';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';

const ASOF = '2026-11-01';
const goal = (name: string, start: string, target: string, type = GoalType.ONE_TIME) =>
  new FinancialGoal(name, type, start, target, 100000, type === GoalType.RECURRING ? 2 : undefined, 0);

const funding = (fundedPercent = 12, investingMonthly = 2000) => ({
  requiredMonthly: 9950,
  investingMonthly,
  fundedValue: 0,
  fundedPercent,
});

const goals = [
  goal('Europe Trip', '2026-01-01', '2028-01-01'),
  goal('Car Upgrade', '2026-01-01', '2030-06-01'),
  goal('Retirement', '2026-01-01', '2046-01-01'),
  goal('Child Education', '2027-06-01', '2040-01-01'),
  goal('Old Laptop', '2024-01-01', '2025-01-01'),
  goal('Insurance', '', '', GoalType.RECURRING),
];

const onViewDetails = vi.fn();
const onOpenTerm = vi.fn();
const laptopSummary = {
  doneAt: '2024-11-01',
  target: 100000,
  finalValue: 106000,
  contributed: 98000,
  returns: 8000,
  monthsInvested: 10,
  monthsAhead: 2,
  surplus: 6000,
  reachedTarget: true,
  monthlySip: 9800,
  points: [],
  milestones: [],
};

const renderPage = () =>
  render(
    <MyGoals
      goals={goals}
      funding={Object.fromEntries(goals.map((g, i) => [g.id, funding(12, i === 0 ? 0 : 2000)]))}
      riskStatuses={{ [goals[0].id]: 'at-risk', [goals[1].id]: 'on-track' }}
      selectedDate={ASOF}
      completionSummaries={{ [goals[4].id]: laptopSummary }}
      onViewDetails={onViewDetails}
      onOpenTerm={onOpenTerm}
    />,
  );

describe('MyGoals', () => {
  it('groups goals into term and recurring sections, keeping finished goals in their term', () => {
    renderPage();
    const section = (name: string) => screen.getByRole('region', { name: `${name} goals` });
    expect(within(section('Short Term')).getByText('Europe Trip')).toBeInTheDocument();
    expect(within(section('Medium Term')).getByText('Car Upgrade')).toBeInTheDocument();
    expect(within(section('Long Term')).getByText('Retirement')).toBeInTheDocument();
    expect(within(section('Recurring')).getByText('Insurance')).toBeInTheDocument();
    // Finished goals stay in their term
    expect(within(section('Short Term')).getByText('Old Laptop')).toBeInTheDocument();
    expect(within(section('Short Term')).getByText(/2 goals · 1 completed/)).toBeInTheDocument();
    expect(within(section('Short Term')).getByText('0 – 3 Years')).toBeInTheDocument();
  });

  it('shows status, time left, funding and monthly figures on each card', () => {
    renderPage();
    const trip = screen.getByRole('article', { name: 'Europe Trip' });
    expect(within(trip).getByText('At risk')).toBeInTheDocument();
    expect(within(trip).getByText('1 year left')).toBeInTheDocument();
    expect(within(trip).getByText('12% funded')).toBeInTheDocument();
    expect(within(trip).getByText('$0/mo')).toBeInTheDocument();

    const education = screen.getByRole('article', { name: 'Child Education' });
    expect(within(education).getByText('Not started')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Insurance' })).queryByText('Not started')).not.toBeInTheDocument();
    expect(screen.getByText(`Starts ${dayjs('2027-06-01').format('MMM YYYY')}`)).toBeInTheDocument();
  });

  it('shows what a finished goal achieved', () => {
    renderPage();
    const laptop = screen.getByRole('article', { name: 'Old Laptop' });
    expect(within(laptop).getByText('Completed')).toBeInTheDocument();
    expect(within(laptop).getByText('Done Nov 2024 · 2 mo early')).toBeInTheDocument();
    expect(within(laptop).getByText('106% funded')).toBeInTheDocument();
    expect(within(laptop).getByRole('button', { name: /view summary/i })).toBeInTheDocument();
    expect(within(laptop).queryByText(/Required:/)).not.toBeInTheDocument();
  });

  it('hides archived goals until asked', () => {
    goals[4].archived = true;
    renderPage();
    expect(screen.queryByText('Old Laptop')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show archived goals (1)' }));
    expect(within(screen.getByRole('region', { name: 'Archived goals' })).getByText('Old Laptop')).toBeInTheDocument();
    delete goals[4].archived;
  });

  it('opens a term portfolio from its section header', () => {
    renderPage();
    const medium = screen.getByRole('region', { name: 'Medium Term goals' });
    fireEvent.click(within(medium).getByRole('button', { name: /view portfolio/i }));
    expect(onOpenTerm).toHaveBeenCalledWith('Medium Term');
    expect(within(screen.getByRole('region', { name: 'Recurring goals' })).queryByRole('button', { name: /view portfolio/i })).not.toBeInTheDocument();
  });

  it('opens the goal details page', () => {
    renderPage();
    const trip = screen.getByRole('article', { name: 'Europe Trip' });
    fireEvent.click(within(trip).getByRole('button', { name: /view details/i }));
    expect(onViewDetails).toHaveBeenCalledWith(goals[0].id);
  });
});
