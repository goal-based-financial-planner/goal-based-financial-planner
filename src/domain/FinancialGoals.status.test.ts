import { FinancialGoal, restoreGoalStatus } from './FinancialGoals';
import { GoalType } from '../types/enums';

describe('restoreGoalStatus', () => {
  const fresh = () => new FinancialGoal('Fund', GoalType.ONE_TIME, '2026-01-01', '2027-01-01', 1000);

  it('round-trips completion, reopened and archived through JSON', () => {
    const saved = fresh();
    saved.completion = { at: '2026-08-01', value: 1060, acknowledged: true };
    saved.archived = true;
    const restored = restoreGoalStatus(fresh(), JSON.parse(JSON.stringify(saved)));
    expect(restored.completion).toEqual({ at: '2026-08-01', value: 1060, acknowledged: true });
    expect(restored.archived).toBe(true);
    expect(restored.reopened).toBeUndefined();
  });

  it('ignores malformed status from older or hand-edited files', () => {
    const restored = restoreGoalStatus(fresh(), { completion: { at: 'not a date', value: 'x' } } as never);
    expect(restored.completion).toBeUndefined();
  });
});
