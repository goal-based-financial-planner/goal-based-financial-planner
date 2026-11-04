import { render, screen, fireEvent } from '@testing-library/react';
import CompletedGoalSummary from './CompletedGoalSummary';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';
import { CompletionSummary } from '../../../../domain/goalCompletion';

vi.mock('@mui/x-charts/LineChart', () => ({ LineChart: () => <div data-testid="chart" /> }));
vi.mock('@mui/x-charts', () => ({ ChartsReferenceLine: () => null }));
const reopenSpy = vi.fn();
const archiveSpy = vi.fn();
vi.mock('../../../../store/plannerDataActions', () => ({
  reopenGoal: (...a: unknown[]) => reopenSpy(...a),
  setGoalArchived: (...a: unknown[]) => archiveSpy(...a),
}));

const goal = new FinancialGoal('Emergency Fund', GoalType.ONE_TIME, '2025-02-01', '2026-11-01', 150000, undefined, 0);
goal.completion = { at: '2026-08-12', value: 158400 };

const summary: CompletionSummary = {
  doneAt: '2026-08-12',
  target: 150000,
  finalValue: 158400,
  contributed: 146250,
  returns: 12150,
  monthsInvested: 18,
  monthsAhead: 3,
  surplus: 8400,
  reachedTarget: true,
  monthlySip: 6250,
  points: [],
  milestones: [
    { fraction: 0.25, date: '2025-07-01', value: 37500 },
    { fraction: 0.5, date: '2025-11-01', value: 75000 },
    { fraction: 0.75, date: '2026-04-01', value: 112500 },
    { fraction: 1, date: '2026-08-01', value: 150000 },
  ],
};

describe('CompletedGoalSummary', () => {
  it('shows what was achieved', () => {
    render(<CompletedGoalSummary goal={goal} summary={summary} dispatch={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'You fully funded your Emergency Fund' })).toBeInTheDocument();
    expect(screen.getByText(/3 months ahead/)).toBeInTheDocument();
    expect(screen.getByText('+$12,150')).toBeInTheDocument();
    expect(screen.getByText('Halfway there')).toBeInTheDocument();
    expect(screen.getByText('Short Term goal · Feb 2025 → Aug 2026 · 18 months')).toBeInTheDocument();
  });

  it('reopens and archives', () => {
    const onBack = vi.fn();
    render(<CompletedGoalSummary goal={goal} summary={summary} dispatch={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /reopen goal/i }));
    expect(reopenSpy).toHaveBeenCalledWith(expect.anything(), goal.id);
    fireEvent.click(screen.getByRole('button', { name: /archive/i }));
    expect(archiveSpy).toHaveBeenCalledWith(expect.anything(), goal.id, true);
    expect(onBack).toHaveBeenCalled();
  });
});
