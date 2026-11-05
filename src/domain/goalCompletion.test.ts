import dayjs from 'dayjs';
import {
  buildCompletionSummary,
  buildRedirect,
  findNewlyReachedGoals,
  isGoalDone,
  monthsAhead,
} from './goalCompletion';
import { buildGoalFunding } from './goalFunding';
import { FinancialGoal } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import { InvestmentAllocationsType } from './InvestmentOptions';

const allocations: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [{ investmentName: 'RD', investmentPercentage: 100, expectedReturnPercentage: 0 }],
  [TermType.MEDIUM_TERM]: [],
  [TermType.LONG_TERM]: [{ investmentName: 'RD', investmentPercentage: 100, expectedReturnPercentage: 0 }],
};
const goal = (name: string, start: string, target: string, amount = 12000) =>
  new FinancialGoal(name, GoalType.ONE_TIME, start, target, amount, undefined, 0);
const rd = (monthlyAmount: number, startDate = '2026-01-01') => ({ id: 'rd', name: 'RD', type: 'RD', monthlyAmount, startDate });

describe('findNewlyReachedGoals', () => {
  it('finds a goal whose own SIPs reached the target early, with the month it happened', () => {
    const fund = goal('Emergency', '2026-01-01', '2027-01-01'); // needs 1,000/mo, investing 2,000
    const today = '2026-09-15';
    const funding = buildGoalFunding([fund], allocations, [rd(2000)], today);
    const [reached] = findNewlyReachedGoals([fund], allocations, funding, today);
    expect(reached.goal).toBe(fund);
    expect(reached.at).toBe('2026-07-01'); // 6 × 2,000 = 12,000
    expect(reached.value).toBe(12000);
  });

  it('leaves goals that are short, reopened or already recorded alone', () => {
    const short = goal('Short', '2026-01-01', '2027-01-01');
    const reopened = goal('Reopened', '2026-01-01', '2027-01-01');
    reopened.reopened = true;
    const funding = buildGoalFunding([short, reopened], allocations, [rd(1000)], '2026-06-01');
    expect(findNewlyReachedGoals([short, reopened], allocations, funding, '2026-06-01')).toEqual([]);
  });
});

describe('completed goal state', () => {
  it('counts as done from its completion day, and stops needing investment after it', () => {
    const fund = goal('Emergency', '2026-01-01', '2027-01-01');
    fund.completion = { at: '2026-07-01', value: 12000 };
    expect(isGoalDone(fund, '2026-06-30')).toBe(false);
    expect(isGoalDone(fund, '2026-07-01')).toBe(true);
    expect(monthsAhead(fund)).toBe(6);
    const after = buildGoalFunding([fund], allocations, [rd(2000)], '2026-08-01');
    expect(after[fund.id].investingMonthly).toBe(0);
  });

  it('summarises what a finished goal achieved', () => {
    const fund = goal('Emergency', '2026-01-01', '2027-01-01');
    fund.completion = { at: '2026-07-01', value: 12000 };
    const summary = buildCompletionSummary(fund, [fund], allocations, [rd(2000)]);
    expect(summary).toMatchObject({
      finalValue: 12000,
      contributed: 12000,
      returns: 0,
      monthsInvested: 6,
      monthsAhead: 6,
      surplus: 0,
      reachedTarget: true,
      monthlySip: 2000,
    });
    expect(summary.milestones.map((m) => m.date)).toEqual(['2026-03-01', '2026-04-01', '2026-06-01', '2026-07-01']);
  });

  it('reports where a finished goal’s SIP share goes next', () => {
    const fund = goal('Emergency', '2026-01-01', '2027-01-01');
    const trip = goal('Trip', '2026-01-01', '2028-01-01', 24000); // needs 1,000/mo
    fund.completion = { at: '2026-07-01', value: 12000 };
    const redirect = buildRedirect(fund, [fund, trip], allocations, [rd(1500)], dayjs('2026-08-01').format('YYYY-MM-DD'));
    expect(redirect.freed).toBe(1000);
    expect(redirect.recipients).toHaveLength(1);
    expect(redirect.recipients[0]).toMatchObject({ goal: trip, extraMonthly: 1000, coveragePercent: 100 });
  });
});
