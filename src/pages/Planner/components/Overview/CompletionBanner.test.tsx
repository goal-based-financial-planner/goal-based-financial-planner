import { render, screen, fireEvent } from '@testing-library/react';
import CompletionBanner from './CompletionBanner';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';

const fund = new FinancialGoal('Emergency Fund', GoalType.ONE_TIME, '2025-02-01', '2026-11-01', 150000);
const trip = new FinancialGoal('Europe Trip', GoalType.ONE_TIME, '2025-02-01', '2028-01-01', 350000);

describe('CompletionBanner', () => {
  it('celebrates the goal and says where its SIP share now goes', () => {
    const onReview = vi.fn();
    const onDismiss = vi.fn();
    render(
      <CompletionBanner
        goal={fund}
        monthsAhead={3}
        redirect={{ freed: 6250, unassigned: 0, recipients: [{ goal: trip, extraMonthly: 6250, coveragePercent: 43 }] }}
        riskStatuses={{ [trip.id]: 'at-risk' }}
        onViewSummary={vi.fn()}
        onReview={onReview}
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText(/Emergency Fund completed — 3 months early/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('now goes to Europe Trip (at risk), covering 43% of its monthly need');
    fireEvent.click(screen.getByRole('button', { name: 'Review Europe Trip' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onReview).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('suggests moving money no other goal needs', () => {
    render(
      <CompletionBanner
        goal={fund}
        monthsAhead={0}
        redirect={{ freed: 2000, unassigned: 2000, recipients: [] }}
        riskStatuses={{}}
        onViewSummary={vi.fn()}
        onReview={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent("isn't needed by any other goal's plan");
    expect(screen.getByRole('button', { name: 'Review SIPs' })).toBeInTheDocument();
  });
});
