import { deriveGoalRiskStatuses, summarizeGoalRisk } from './goalRiskStatus';
import { FinancialGoal } from './FinancialGoals';
import { GoalType } from '../types/enums';
import { PortfolioWhatIfResult, WhatIfGoalMarker } from './whatIf';

const makeGoal = (goalType: GoalType, goalName = 'Goal') =>
  new FinancialGoal(goalName, goalType, '2024-01-01', '2030-01-01', 1_000_000);

const makeMarker = (goalId: string, portfolioValueAfter: number): WhatIfGoalMarker => ({
  goalId,
  goalName: 'Goal',
  date: '2030-01-01',
  amount: 1_000_000,
  portfolioValueAfter,
});

const makeBaseline = (markers: WhatIfGoalMarker[]): PortfolioWhatIfResult => ({
  totalTargetAmount: 0,
  totalInvestedValue: 0,
  totalShortfall: 0,
  status: 'on-track',
  requirementPoints: [],
  investingPoints: [],
  markers,
});

describe('goalRiskStatus', () => {
  describe('deriveGoalRiskStatuses', () => {
    it('marks a one-time goal on-track when its marker has a non-negative portfolioValueAfter', () => {
      const goal = makeGoal(GoalType.ONE_TIME);
      const baseline = makeBaseline([makeMarker(goal.id, 50_000)]);

      expect(deriveGoalRiskStatuses([goal], baseline)).toEqual({ [goal.id]: 'on-track' });
    });

    it('marks a one-time goal at-risk when its marker has a negative portfolioValueAfter', () => {
      const goal = makeGoal(GoalType.ONE_TIME);
      const baseline = makeBaseline([makeMarker(goal.id, -20_000)]);

      expect(deriveGoalRiskStatuses([goal], baseline)).toEqual({ [goal.id]: 'at-risk' });
    });

    it('always marks a recurring goal not-evaluated, regardless of markers', () => {
      const goal = makeGoal(GoalType.RECURRING);
      // Even if a marker happened to exist under this goal's id, it must not be consulted.
      const baseline = makeBaseline([makeMarker(goal.id, -1)]);

      expect(deriveGoalRiskStatuses([goal], baseline)).toEqual({ [goal.id]: 'not-evaluated' });
    });

    it('marks both goals at-risk when they share a withdrawal month that overdraws the corpus', () => {
      const goalA = makeGoal(GoalType.ONE_TIME, 'Goal A');
      const goalB = makeGoal(GoalType.ONE_TIME, 'Goal B');
      // Both goals' markers land on the same shared, now-negative corpus reading.
      const baseline = makeBaseline([makeMarker(goalA.id, -5_000), makeMarker(goalB.id, -5_000)]);

      expect(deriveGoalRiskStatuses([goalA, goalB], baseline)).toEqual({
        [goalA.id]: 'at-risk',
        [goalB.id]: 'at-risk',
      });
    });

    it('returns an empty map for an empty goal list', () => {
      const baseline = makeBaseline([]);

      expect(deriveGoalRiskStatuses([], baseline)).toEqual({});
    });
  });

  describe('summarizeGoalRisk', () => {
    it('returns zero/zero for an empty statuses map', () => {
      expect(summarizeGoalRisk({})).toEqual({ atRisk: 0, total: 0 });
    });

    it('excludes not-evaluated goals from both the numerator and denominator', () => {
      const statuses = {
        a: 'at-risk' as const,
        b: 'on-track' as const,
        c: 'not-evaluated' as const,
      };

      expect(summarizeGoalRisk(statuses)).toEqual({ atRisk: 1, total: 2 });
    });

    it('returns zero/zero for an all-recurring plan (no one-time goals evaluated)', () => {
      const statuses = { a: 'not-evaluated' as const, b: 'not-evaluated' as const };

      expect(summarizeGoalRisk(statuses)).toEqual({ atRisk: 0, total: 0 });
    });
  });
});
