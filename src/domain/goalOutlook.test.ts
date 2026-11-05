import { deriveGoalOutlook } from './goalOutlook';
import { buildGoalFunding } from './goalFunding';
import { FinancialGoal } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import { InvestmentAllocationsType } from './InvestmentOptions';

const ASOF = '2026-01-01';
const allocations: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [{ investmentName: 'RD', investmentPercentage: 100, expectedReturnPercentage: 0 }],
  [TermType.MEDIUM_TERM]: [],
  [TermType.LONG_TERM]: [{ investmentName: 'RD', investmentPercentage: 100, expectedReturnPercentage: 0 }],
};
const goal = (name: string, start: string, target: string) =>
  new FinancialGoal(name, GoalType.ONE_TIME, start, target, 12000, undefined, 0);
const sip = (monthlyAmount: number) => ({ id: 'rd', name: 'RD', type: 'RD', monthlyAmount, startDate: ASOF });

const outlookFor = (goals: FinancialGoal[], monthly: number) =>
  deriveGoalOutlook(goals, allocations, buildGoalFunding(goals, allocations, [sip(monthly)], ASOF), ASOF);

describe('deriveGoalOutlook', () => {
  it('is on track when the goal’s own SIPs reach its target', () => {
    const trip = goal('Trip', ASOF, '2027-01-01'); // needs 1,000/mo
    const outlook = outlookFor([trip], 1000);
    expect(outlook.statuses[trip.id]).toBe('on-track');
    expect(outlook.healthScore).toBe(100);
  });

  it('marks a later goal at risk when earlier goals take the shared SIP, even if a pooled pot would cover it', () => {
    const trip = goal('Trip', ASOF, '2027-01-01'); // needs 1,000/mo of RD, filled first
    const house = goal('House', ASOF, '2032-01-01'); // needs 166/mo of RD
    const outlook = outlookFor([trip, house], 1050);
    expect(outlook.statuses[trip.id]).toBe('on-track');
    expect(outlook.statuses[house.id]).toBe('at-risk');
    expect(outlook.summary).toEqual({ atRisk: 1, total: 2 });
  });

  it('does not evaluate goals that have not started', () => {
    const later = goal('Later', '2027-06-01', '2030-01-01');
    expect(outlookFor([later], 0).statuses[later.id]).toBe('not-evaluated');
    expect(outlookFor([later], 0).healthScore).toBeNull();
  });
});
