import { buildGoalProjection } from './goalProjection';
import { FinancialGoal } from './FinancialGoals';
import { GoalType } from '../types/enums';

const goal = new FinancialGoal('Trip', GoalType.ONE_TIME, '2026-01-01', '2027-01-01', 12000, undefined, 0);
const sip = { id: '1', name: 'RD', type: 'RD', monthlyAmount: 1000 };

describe('buildGoalProjection', () => {
  it('builds monthly points from start to target with required and projected corpus', () => {
    const { points } = buildGoalProjection(
      goal,
      [{ investmentName: 'RD', amount: 1000, expectedReturnPercentage: 0 }],
      [{ sip, monthly: 500, annualReturnPct: 0, from: '2026-01-01' }],
    );
    expect(points).toHaveLength(13);
    expect(points[12]).toMatchObject({ required: 12000, projected: 6000 });
  });

  it('estimates when the projected corpus reaches the target', () => {
    const { estimatedCompletion } = buildGoalProjection(goal, [], [
      { sip, monthly: 500, annualReturnPct: 0, from: '2026-01-01' },
    ]);
    expect(estimatedCompletion?.format('YYYY-MM')).toBe('2028-01');
  });

  it('has no estimate without contributions', () => {
    expect(buildGoalProjection(goal, [], []).estimatedCompletion).toBeNull();
  });

  it('reaches the target when the goal starts mid-month and the SIP matches the plan exactly', () => {
    const midMonth = new FinancialGoal('Phone', GoalType.ONE_TIME, '2026-03-15', '2027-09-01', 30000, undefined, 5);
    const suggestions = [{ investmentName: 'RD', amount: 0, expectedReturnPercentage: 7 }];
    // Size the SIP from the required line so both use the same assumptions.
    const required = buildGoalProjection(midMonth, [{ ...suggestions[0], amount: 1000 }], []).points;
    const perRupee = required[required.length - 1].required / 1000;
    const monthly = midMonth.getInflationAdjustedTargetAmount() / perRupee;

    const { points } = buildGoalProjection(
      midMonth,
      [{ ...suggestions[0], amount: monthly }],
      [{ sip, monthly, annualReturnPct: 7, from: '2026-03-15' }],
    );
    const last = points[points.length - 1];
    expect(last.projected).toBe(last.required);
  });

  it('falls short when the SIP started after the goal, even at the required amount', () => {
    const { points } = buildGoalProjection(
      goal,
      [{ investmentName: 'RD', amount: 1000, expectedReturnPercentage: 0 }],
      [{ sip, monthly: 1000, annualReturnPct: 0, from: '2026-03-01' }],
    );
    expect(points[12]).toMatchObject({ required: 12000, projected: 10000 });
  });
});
