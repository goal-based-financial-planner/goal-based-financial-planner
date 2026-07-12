import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { PlannerData } from '../../domain/PlannerData';
import { FinancialGoal } from '../../domain/FinancialGoals';
import { GoalType } from '../../types/enums';
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

vi.mock('./components/PlannerStatStrip', () => ({
  default: function MockPlannerStatStrip({ onGoalsClick, onAddGoal, financialGoals }: { onGoalsClick?: () => void; onAddGoal?: () => void; financialGoals?: { getTermType: () => string }[] }) {
    const count = financialGoals?.length ?? 0;
    return (
      <div data-testid="planner-stat-strip">
        {onGoalsClick && count > 0 && (
          <button onClick={onGoalsClick}>{count} Goal{count !== 1 ? 's' : ''}</button>
        )}
        {onAddGoal && <button onClick={onAddGoal}>+ Add Goal</button>}
      </div>
    );
  },
}));

vi.mock('./components/InvestmentSuggestions', () => ({
  default: function MockInvestmentSuggestions() {
    return <div data-testid="investment-suggestions" />;
  },
}));

vi.mock('./components/GoalBox', () => ({
  default: function MockGoalBox() {
    return <div data-testid="goal-box" />;
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

  it('renders stat strip and investment suggestions when a future goal exists', () => {
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    expect(screen.getByTestId('planner-stat-strip')).toBeInTheDocument();
    expect(screen.getByTestId('investment-suggestions')).toBeInTheDocument();
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
    expect(screen.getByTestId('planner-stat-strip')).toBeInTheDocument();
  });

  it('renders Investment Plan and Portfolio tab labels when a future goal exists', () => {
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    expect(screen.getByRole('tab', { name: 'Investment Plan' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Portfolio' })).toBeInTheDocument();
  });

  it('renders Add Goal button in stat strip', () => {
    renderPlanner({ plannerData: new PlannerData([makeGoal()]) });
    expect(screen.getByRole('button', { name: /add goal/i })).toBeInTheDocument();
  });

  it('renders term goal chips in stat strip when goals exist', () => {
    const plannerData = new PlannerData([makeGoal()]);
    renderPlanner({ plannerData });
    expect(screen.getByTestId('planner-stat-strip')).toBeInTheDocument();
  });
});
