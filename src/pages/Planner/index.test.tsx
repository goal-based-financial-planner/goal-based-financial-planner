import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { PlannerData } from '../../domain/PlannerData';
import { FinancialGoal } from '../../domain/FinancialGoals';
import { GoalType } from '../../types/enums';
import { DEFAULT_INVESTMENT_ALLOCATIONS } from '../../domain/constants';
import Planner from './index';

// ---------------------------------------------------------------------------
// Child component mocks
// ---------------------------------------------------------------------------

vi.mock('./components/Pagetour', () => ({
  default: function MockPageTour({ run, onDone }: { run?: boolean; onDone?: () => void }) {
    return (
      <div
        data-testid="page-tour"
        data-run={String(run ?? false)}
        onClick={onDone}
      />
    );
  },
}));

vi.mock('./components/Overview/OverviewStatCards', () => ({
  default: function MockOverviewStatCards({ termsPresent }: { termsPresent: string[] }) {
    return <div data-testid="overview-stat-cards" data-terms={termsPresent.join(',')} />;
  },
}));

vi.mock('./components/Overview/AllocationPlanCard', () => ({
  default: function MockAllocationPlanCard({ goalCount, onViewGoals }: { goalCount: number; onViewGoals: () => void }) {
    return (
      <div data-testid="allocation-plan-card">
        <button onClick={onViewGoals}>View All {goalCount} Goals</button>
      </div>
    );
  },
}));

vi.mock('./components/InvestmentSuggestions', () => ({
  default: function MockInvestmentSuggestions() {
    return <div data-testid="investment-suggestions" />;
  },
}));

vi.mock('./components/MyGoals', () => ({
  default: function MockMyGoals({
    goals,
    funding,
    onViewDetails,
  }: {
    goals: { id: string }[];
    funding: Record<string, { fundedPercent: number }>;
    onViewDetails: (id: string) => void;
  }) {
    return (
      <div data-testid="my-goals" data-goal-count={Object.keys(funding).length}>
        <button onClick={() => onViewDetails(goals[0].id)}>View Details</button>
      </div>
    );
  },
}));

vi.mock('./components/TermPortfolio', () => ({
  default: function MockTermPortfolio({
    term,
    goals,
    onBack,
  }: {
    term: string;
    goals: unknown[];
    onBack: () => void;
  }) {
    return (
      <div data-testid="term-portfolio" data-term={term} data-goals={goals.length}>
        <button onClick={onBack}>Back to Overview</button>
      </div>
    );
  },
}));

vi.mock('./components/GoalDetail', () => ({
  default: function MockGoalDetail({ goal, onBack }: { goal: { goalName: string }; onBack: () => void }) {
    return (
      <div data-testid="goal-detail">
        {goal.goalName}
        <button onClick={onBack}>Back to My Goals</button>
      </div>
    );
  },
}));

vi.mock('./components/GoalGrowthChart', () => ({
  default: function MockGoalGrowthChart() {
    return <div data-testid="goal-growth-chart" />;
  },
}));

vi.mock('./components/PrintableReport', () => ({
  default: function MockPrintableReport() {
    return <div data-testid="printable-report" />;
  },
}));

vi.mock('../CongratulationsPage', () => ({
  default: function MockCongratulationsPage() {
    return <div data-testid="congratulations" />;
  },
}));

vi.mock('../Home/components/AddGoalPopup', () => ({
  default: function MockAddGoalPopup() {
    return null;
  },
}));

vi.mock('../../components/DatePicker', () => ({
  default: React.forwardRef(function MockDatePicker(props: { onChange?: (val: ReturnType<typeof dayjs>) => void }) {
    return (
      <input
        data-testid="date-picker"
        onChange={(e) => {
          props.onChange?.(dayjs(e.target.value));
        }}
      />
    );
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeGoal = () =>
  new FinancialGoal(
    'Education',
    GoalType.ONE_TIME,
    dayjs().toString(),
    dayjs().add(5, 'year').toString(),
    1_000_000,
  );

const makePastGoal = () =>
  new FinancialGoal(
    'Past Goal',
    GoalType.ONE_TIME,
    dayjs().subtract(10, 'year').toString(),
    dayjs().subtract(1, 'year').toString(),
    500_000,
  );

const mockDispatch = vi.fn();

function renderPlanner(props: Partial<React.ComponentProps<typeof Planner>> = {}) {
  return render(
    <Planner
      plannerData={new PlannerData()}
      dispatch={mockDispatch}
      {...props}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Planner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show CongratulationsPage when there are no goals', () => {
    renderPlanner({ plannerData: new PlannerData() });
    expect(screen.queryByTestId('congratulations')).not.toBeInTheDocument();
  });

  it('lands on the Overview with stat cards and the allocation plan when a future goal exists', () => {
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByTestId('overview-stat-cards')).toBeInTheDocument();
    expect(screen.getByTestId('allocation-plan-card')).toBeInTheDocument();
    expect(screen.getByText('Goal Progress')).toBeInTheDocument();
    expect(screen.getByText('Active SIPs')).toBeInTheDocument();
  });

  it('passes runTour=true to PageTour', () => {
    renderPlanner({ runTour: true });
    expect(screen.getByTestId('page-tour')).toHaveAttribute('data-run', 'true');
  });

  it('passes runTour=false (default) to PageTour', () => {
    renderPlanner();
    expect(screen.getByTestId('page-tour')).toHaveAttribute('data-run', 'false');
  });

  it('calls onTourDone when PageTour mock is clicked', () => {
    const onTourDone = vi.fn();
    renderPlanner({ onTourDone });
    fireEvent.click(screen.getByTestId('page-tour'));
    expect(onTourDone).toHaveBeenCalledTimes(1);
  });

  it('renders headerRight when provided', () => {
    renderPlanner({
      plannerData: new PlannerData([makeGoal()]),
      headerRight: <button data-testid="header-right-btn">Save</button>,
    });
    expect(screen.getByTestId('header-right-btn')).toBeInTheDocument();
  });

  it('always mounts PrintableReport', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    expect(screen.getByTestId('printable-report')).toBeInTheDocument();
  });

  it('renders PrintableReport even with no goals', () => {
    renderPlanner({ plannerData: new PlannerData() });
    expect(screen.getByTestId('printable-report')).toBeInTheDocument();
  });

  it('renders CongratulationsPage when all goals have past target dates', () => {
    const plannerData = new PlannerData([makePastGoal()]);
    renderPlanner({ plannerData });
    expect(screen.getByTestId('congratulations')).toBeInTheDocument();
  });

  it('does not render CongratulationsPage when a future goal exists', () => {
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    expect(screen.queryByTestId('congratulations')).not.toBeInTheDocument();
  });

  it('handleChange: changing the date picker updates state without error', () => {
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    fireEvent.change(screen.getByTestId('date-picker'), {
      target: { value: '2026-06-01' },
    });
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  it('navigates between sidebar sections', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    fireEvent.click(screen.getByRole('button', { name: 'Investments' }));
    expect(screen.getByTestId('investment-suggestions')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Portfolio' }));
    expect(screen.getByTestId('goal-growth-chart')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'My Goals' }));
    expect(screen.getByTestId('my-goals')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.getByTestId('overview-stat-cards')).toBeInTheDocument();
  });

  it('opens My Goals from the allocation plan "View All" button', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    fireEvent.click(screen.getByRole('button', { name: /view all 1 goals/i }));
    expect(screen.getByTestId('my-goals')).toBeInTheDocument();
  });

  it('shows My Goals with its own New Goal button and per-goal funding', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    fireEvent.click(screen.getByRole('button', { name: 'My Goals' }));
    expect(screen.getByRole('heading', { name: 'My Goals' })).toBeInTheDocument();
    expect(screen.getByTestId('my-goals')).toHaveAttribute('data-goal-count', '1');
    expect(screen.getAllByRole('button', { name: /new goal/i })).toHaveLength(2);
  });

  it('opens a goal detail page from My Goals and returns to the list', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    fireEvent.click(screen.getByRole('button', { name: 'My Goals' }));
    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    expect(screen.getByTestId('goal-detail')).toHaveTextContent('Education');
    fireEvent.click(screen.getByRole('button', { name: 'Back to My Goals' }));
    expect(screen.getByTestId('my-goals')).toBeInTheDocument();
  });

  it('opens a term portfolio from the term switcher and returns to the Overview', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    fireEvent.click(screen.getByRole('tab', { name: 'Mid-term' }));
    expect(screen.getByTestId('term-portfolio')).toHaveAttribute('data-term', 'Medium Term');
    expect(screen.getByTestId('term-portfolio')).toHaveAttribute('data-goals', '1');
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('tab', { name: 'Summary' }));
    expect(screen.getByTestId('overview-stat-cards')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Long-term' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Overview' }));
    expect(screen.getByTestId('overview-stat-cards')).toBeInTheDocument();
  });

  it('marks a goal complete once its own SIPs reach the target', () => {
    const dispatch = vi.fn();
    const goal = new FinancialGoal(
      'Education',
      GoalType.ONE_TIME,
      dayjs().subtract(1, 'month').toString(),
      dayjs().add(5, 'year').toString(),
      1_000_000,
    );
    const plan = new PlannerData(
      [goal],
      DEFAULT_INVESTMENT_ALLOCATIONS,
      DEFAULT_INVESTMENT_ALLOCATIONS[goal.getTermType()].map((a, i) => ({
        id: `sip-${i}`,
        name: a.investmentName,
        type: a.investmentName,
        monthlyAmount: 10_000_000,
        startDate: dayjs(goal.startDate).format('YYYY-MM-DD'),
      })),
    );
    render(<Planner plannerData={plan} dispatch={dispatch} />);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_GOAL_STATUS',
        payload: expect.objectContaining({ id: goal.id, completion: expect.any(Object) }),
      }),
    );
  });

  it('shows the completion banner for a goal finished early', () => {
    const goal = makeGoal();
    goal.completion = { at: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), value: 1_200_000 };
    renderPlanner({ plannerData: new PlannerData([goal, makeGoal()], DEFAULT_INVESTMENT_ALLOCATIONS) });
    expect(screen.getByRole('status')).toHaveTextContent(/Education completed/);
  });

  it('renders the New Goal button in the sidebar', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    expect(screen.getByRole('button', { name: /new goal/i })).toBeInTheDocument();
  });

  it('passes the terms present to the stat cards', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    expect(screen.getByTestId('overview-stat-cards')).toHaveAttribute('data-terms', 'Medium Term');
  });

  it('shows the health score with an unfunded one-time goal counted at risk', () => {
    // makeGoal() is a one-time goal with no logged SIPs (default empty investmentLogs) — its
    // shared corpus can't cover its target amount, so it must be counted at-risk.
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('1 of 1 goal at risk')).toBeInTheDocument();
  });

  it('hides the health score when there are no one-time goals', () => {
    renderPlanner({ plannerData: new PlannerData() });
    expect(screen.queryByText('Health Score')).not.toBeInTheDocument();
  });

  it('recomputes goal risk live when investmentLogs change, without remounting', () => {
    const goal = makeGoal();
    const { rerender } = renderPlanner({
      plannerData: new PlannerData([goal], DEFAULT_INVESTMENT_ALLOCATIONS),
    });

    expect(screen.getByText('1 of 1 goal at risk')).toBeInTheDocument();

    // Log SIPs in every instrument the goal's plan uses, generously — same goal, same instance.
    const funded = new PlannerData(
      [goal],
      DEFAULT_INVESTMENT_ALLOCATIONS,
      DEFAULT_INVESTMENT_ALLOCATIONS[goal.getTermType()].map((a, i) => ({
        id: `sip-${i}`,
        name: a.investmentName,
        type: a.investmentName,
        monthlyAmount: 30_000,
        startDate: dayjs().format('YYYY-MM-DD'),
      })),
    );
    rerender(<Planner plannerData={funded} dispatch={mockDispatch} />);

    expect(screen.getByText('0 of 1 goal at risk')).toBeInTheDocument();
  });
});
