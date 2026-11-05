import dayjs from 'dayjs';
import { buildGoalFunding } from './goalFunding';
import { FinancialGoal } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { SIPEntry } from '../types/investmentLog';

const ASOF = '2026-11-01';

const allocations: InvestmentAllocationsType = {
  [TermType.SHORT_TERM]: [{ investmentName: 'RD', investmentPercentage: 100, expectedReturnPercentage: 0 }],
  [TermType.MEDIUM_TERM]: [],
  [TermType.LONG_TERM]: [
    { investmentName: 'RD', investmentPercentage: 50, expectedReturnPercentage: 0 },
    { investmentName: 'Equity', investmentPercentage: 50, expectedReturnPercentage: 0 },
  ],
};

const goal = (name: string, start: string, months: number, amount = 120000) =>
  new FinancialGoal(name, GoalType.ONE_TIME, start, dayjs(start).add(months, 'month').format('YYYY-MM-DD'), amount, undefined, 0);

const sip = (type: string, monthlyAmount: number, startDate?: string): SIPEntry => ({
  id: `${type}-${monthlyAmount}`,
  name: type,
  type,
  monthlyAmount,
  startDate,
});

describe('buildGoalFunding', () => {
  it('fills the goal with the earliest target date first, up to what it needs', () => {
    const short = goal('Trip', '2026-01-01', 12); // needs 10,000/mo of RD
    const long = goal('Retire', '2026-01-01', 120); // needs 500/mo RD + 500/mo Equity
    const funding = buildGoalFunding([long, short], allocations, [sip('RD', 10300), sip('Equity', 200)], ASOF);

    expect(funding[short.id].requiredMonthly).toBe(10000);
    expect(funding[short.id].investingMonthly).toBe(10000);
    expect(funding[long.id].investingMonthly).toBe(500); // RD 300 left over + Equity 200
  });

  it('gives a goal its full plan when the SIPs were sized for it, even if a later goal shares the instruments', () => {
    // The reported case: SIPs sized exactly for a medium-term goal shouldn't leak to a long-term one.
    const mid = goal('Mid', '2026-07-01', 48);
    const long = goal('Sample', '2026-07-01', 96);
    const midNeeds = buildGoalFunding([mid], allocations, [], ASOF)[mid.id].requiredMonthly;
    const funding = buildGoalFunding(
      [mid, long],
      { ...allocations, [TermType.MEDIUM_TERM]: allocations[TermType.LONG_TERM] },
      [sip('RD', midNeeds / 2), sip('Equity', midNeeds / 2)],
      ASOF,
    );
    expect(funding[mid.id].investingMonthly).toBe(midNeeds);
    expect(funding[long.id].investingMonthly).toBe(0);
  });

  it('shares anything beyond every goal\'s need in proportion to need', () => {
    const short = goal('Trip', '2026-01-01', 12); // needs 10,000 RD
    const long = goal('Retire', '2026-01-01', 120); // needs 500 RD
    const funding = buildGoalFunding([short, long], allocations, [sip('RD', 12600)], ASOF);
    // 2,100 extra split 10,000 : 500
    expect(funding[short.id].investingMonthly).toBe(12000);
    expect(funding[long.id].investingMonthly).toBe(600);
  });

  it('grows the attributed SIP from the later of its own and the goal start', () => {
    const short = goal('Trip', '2026-01-01', 12);
    const funding = buildGoalFunding([short], allocations, [sip('RD', 1000, '2026-05-01')], ASOF);
    // 6 months at 0% return, against a 120,000 target
    expect(funding[short.id].fundedValue).toBe(6000);
    expect(funding[short.id].fundedPercent).toBe(5);
  });

  it('attributes nothing to a goal that has not started yet, but still reports what it will need', () => {
    const later = goal('Later', '2027-06-01', 12);
    const funding = buildGoalFunding([later], allocations, [sip('RD', 1000)], ASOF);
    expect(funding[later.id]).toMatchObject({ investingMonthly: 0, fundedValue: 0, requiredMonthly: 10000, contributions: [] });
  });

  it('ignores SIP types no active goal plans for', () => {
    const short = goal('Trip', '2026-01-01', 12);
    const funding = buildGoalFunding([short], allocations, [sip('Crypto', 5000)], ASOF);
    expect(funding[short.id].investingMonthly).toBe(0);
  });
});
