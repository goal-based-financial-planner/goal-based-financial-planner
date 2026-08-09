import dayjs from 'dayjs';
import { buildPortfolioWhatIfResult, calculateRequiredTopUp, Adjustments } from './whatIf';
import { FinancialGoal } from './FinancialGoals';
import { GoalType, TermType } from '../types/enums';
import { InvestmentAllocationsType } from './InvestmentOptions';
import { SIPEntry } from '../types/investmentLog';

function makeOneTimeGoal(name: string, yearsFromNow: number, targetAmount = 1_000_000): FinancialGoal {
  const targetYear = new Date().getFullYear() + yearsFromNow;
  return new FinancialGoal(
    name,
    GoalType.ONE_TIME,
    `${targetYear - 10}-01-01`,
    `${targetYear}-01-01`,
    targetAmount,
  );
}

function twoInstrumentAllocations(): InvestmentAllocationsType {
  return {
    [TermType.SHORT_TERM]: [],
    [TermType.MEDIUM_TERM]: [],
    [TermType.LONG_TERM]: [
      { investmentName: 'Equity', investmentPercentage: 60, expectedReturnPercentage: 12 },
      { investmentName: 'Debt', investmentPercentage: 40, expectedReturnPercentage: 7 },
    ],
  };
}

function makeSIP(type: string, monthlyAmount: number, startDate: string): SIPEntry {
  return { id: `${type}-${startDate}`, name: type, type, monthlyAmount, startDate };
}

const noAdjustments: Adjustments = { goalInflationRates: {}, investmentReturnRates: {} };

describe('buildPortfolioWhatIfResult', () => {
  it('returns zeroed, empty results for an empty goal list', () => {
    const result = buildPortfolioWhatIfResult([], [], twoInstrumentAllocations(), noAdjustments);

    expect(result.requirementPoints).toEqual([]);
    expect(result.investingPoints).toEqual([]);
    expect(result.markers).toEqual([]);
    expect(result.totalTargetAmount).toBe(0);
    expect(result.totalInvestedValue).toBe(0);
    expect(result.status).toBe('on-track');
  });

  it('produces one marker per one-time goal with its inflation-adjusted target amount', () => {
    const goal1 = makeOneTimeGoal('House', 10, 1_000_000);
    const goal2 = makeOneTimeGoal('Car', 5, 500_000);
    const allocations = twoInstrumentAllocations();

    const result = buildPortfolioWhatIfResult([goal1, goal2], [], allocations, noAdjustments);

    expect(result.markers).toHaveLength(2);
    expect(result.markers.map((m) => m.goalName).sort()).toEqual(['Car', 'House']);
    expect(result.markers.find((m) => m.goalName === 'House')?.amount).toBe(goal1.getInflationAdjustedTargetAmount());
  });

  it('the requirement staircase only counts a goal once its own target date arrives', () => {
    const nearGoal = makeOneTimeGoal('Wedding', 5, 500_000);
    const farGoal = makeOneTimeGoal('Retirement', 25, 5_000_000);
    const allocations = twoInstrumentAllocations();

    const result = buildPortfolioWhatIfResult([nearGoal, farGoal], [], allocations, noAdjustments);

    expect(result.requirementPoints[0].value).toBe(0);
    const lastIdx = result.requirementPoints.length - 1;
    expect(result.requirementPoints[lastIdx].value).toBe(result.totalTargetAmount);

    const nearGoalMarker = result.markers.find((m) => m.goalName === 'Wedding')!;
    const nearGoalIdx = result.requirementPoints.findIndex((p) => p.date === nearGoalMarker.date);
    expect(result.requirementPoints[nearGoalIdx].value).toBe(Math.round(nearGoalMarker.amount));
    expect(result.requirementPoints[nearGoalIdx].value).not.toBe(result.totalTargetAmount);
  });

  it('an inflation adjustment raises the requirement and the resulting withdrawal, without changing growth before that goal is due', () => {
    const goal = makeOneTimeGoal('House', 10);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 10_000, `${new Date().getFullYear() - 10}-01-01`)];

    const baseline = buildPortfolioWhatIfResult([goal], sips, allocations, noAdjustments);
    const highInflation = buildPortfolioWhatIfResult([goal], sips, allocations, {
      goalInflationRates: { [goal.id]: 50 },
      investmentReturnRates: {},
    });

    expect(highInflation.totalTargetAmount).toBeGreaterThan(baseline.totalTargetAmount);

    // The month right before the withdrawal is untouched — same growth, same adjustments elsewhere.
    const withdrawalIdx = baseline.requirementPoints.findIndex((p) => p.value > 0);
    expect(highInflation.investingPoints[withdrawalIdx - 1].value).toBe(baseline.investingPoints[withdrawalIdx - 1].value);

    // The bigger (inflated) withdrawal leaves less behind.
    expect(highInflation.investingPoints[withdrawalIdx].value).toBeLessThan(baseline.investingPoints[withdrawalIdx].value);
  });

  it('a return-rate adjustment changes the investing series without changing the requirement', () => {
    const goal = makeOneTimeGoal('House', 10);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 10_000, `${new Date().getFullYear() - 10}-01-01`)];

    const baseline = buildPortfolioWhatIfResult([goal], sips, allocations, noAdjustments);
    const lowReturn = buildPortfolioWhatIfResult([goal], sips, allocations, {
      goalInflationRates: {},
      investmentReturnRates: { Equity: 1 },
    });

    expect(lowReturn.totalInvestedValue).toBeLessThan(baseline.totalInvestedValue);
    expect(lowReturn.totalTargetAmount).toBe(baseline.totalTargetAmount);
  });

  it('a SIP contributes nothing before its own start date', () => {
    const goal = makeOneTimeGoal('House', 10);
    const allocations = twoInstrumentAllocations();
    const farFutureStart = `${new Date().getFullYear() + 9}-01-01`;
    const sips = [makeSIP('Equity', 10_000, farFutureStart)];

    const result = buildPortfolioWhatIfResult([goal], sips, allocations, noAdjustments);

    expect(result.investingPoints[0].value).toBe(0);
  });

  it('the investing series dips at a goal\'s target date, as if the goal amount were withdrawn', () => {
    // A tiny SIP against a large target keeps that month's own growth negligible relative to
    // the withdrawal, so the dip should land within ~1% of the goal's target amount.
    const goal = makeOneTimeGoal('House', 10, 10_000_000);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 100, `${new Date().getFullYear() - 10}-01-01`)];

    const result = buildPortfolioWhatIfResult([goal], sips, allocations, noAdjustments);

    const withdrawalIdx = result.requirementPoints.findIndex((p) => p.value > 0);
    const before = result.investingPoints[withdrawalIdx - 1].value;
    const after = result.investingPoints[withdrawalIdx].value;
    const dip = before - after;
    expect(after).toBeLessThan(before);
    expect(Math.abs(dip - result.markers[0].amount)).toBeLessThan(result.markers[0].amount * 0.01);
  });

  it('status is at-risk when a withdrawal drives the invested corpus below zero', () => {
    const goal = makeOneTimeGoal('House', 10, 10_000_000);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 100, `${new Date().getFullYear() - 10}-01-01`)];

    const result = buildPortfolioWhatIfResult([goal], sips, allocations, noAdjustments);

    expect(result.status).toBe('at-risk');
    expect(result.totalShortfall).toBeGreaterThan(0);
  });

  it('status stays on-track when every withdrawal is fully covered', () => {
    const goal = makeOneTimeGoal('House', 10, 500_000);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 10_000, `${new Date().getFullYear() - 10}-01-01`)];

    const result = buildPortfolioWhatIfResult([goal], sips, allocations, noAdjustments);

    expect(result.status).toBe('on-track');
    expect(result.totalShortfall).toBe(0);
  });

  it('a goal\'s own saved inflation rate is used when no live override is set', () => {
    const targetYear = new Date().getFullYear() + 10;
    const highBaseRateGoal = new FinancialGoal(
      'House', GoalType.ONE_TIME, `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 1_000_000, undefined, 15,
    );
    const lowBaseRateGoal = new FinancialGoal(
      'House', GoalType.ONE_TIME, `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 1_000_000, undefined, 1,
    );
    const allocations = twoInstrumentAllocations();

    const highResult = buildPortfolioWhatIfResult([highBaseRateGoal], [], allocations, noAdjustments);
    const lowResult = buildPortfolioWhatIfResult([lowBaseRateGoal], [], allocations, noAdjustments);

    expect(highResult.totalTargetAmount).toBeGreaterThan(lowResult.totalTargetAmount);
  });

  it('a SIP\'s own expectedReturnPct is used for types absent from the allocation mix', () => {
    const goal = makeOneTimeGoal('House', 10);
    const allocations = twoInstrumentAllocations(); // no 'Gold' entry
    const startDate = `${new Date().getFullYear() - 10}-01-01`;

    const lowRateResult = buildPortfolioWhatIfResult(
      [goal],
      [{ id: 'g1', name: 'Gold SIP', type: 'Gold', monthlyAmount: 5000, expectedReturnPct: 1, startDate }],
      allocations,
      noAdjustments,
    );
    const highRateResult = buildPortfolioWhatIfResult(
      [goal],
      [{ id: 'g2', name: 'Gold SIP', type: 'Gold', monthlyAmount: 5000, expectedReturnPct: 15, startDate }],
      allocations,
      noAdjustments,
    );

    expect(highRateResult.totalInvestedValue).toBeGreaterThan(lowRateResult.totalInvestedValue);
  });

  it('a live return-rate override takes precedence over a SIP\'s own expectedReturnPct', () => {
    const goal = makeOneTimeGoal('House', 10);
    const allocations = twoInstrumentAllocations();
    const sip: SIPEntry = {
      id: 'g1', name: 'Gold SIP', type: 'Gold', monthlyAmount: 5000, expectedReturnPct: 1,
      startDate: `${new Date().getFullYear() - 10}-01-01`,
    };

    const withoutOverride = buildPortfolioWhatIfResult([goal], [sip], allocations, noAdjustments);
    const withOverride = buildPortfolioWhatIfResult([goal], [sip], allocations, {
      goalInflationRates: {},
      investmentReturnRates: { Gold: 15 },
    });

    expect(withOverride.totalInvestedValue).toBeGreaterThan(withoutOverride.totalInvestedValue);
  });

  it('a marker\'s portfolioValueAfter reflects whether that specific goal was funded', () => {
    // A tiny SIP easily covers the small near-term goal but can't possibly cover the huge
    // far-future one, so the two markers should land on opposite sides of zero.
    const fundedGoal = makeOneTimeGoal('Car', 5, 5_000);
    const underfundedGoal = makeOneTimeGoal('Retirement', 25, 10_000_000);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 100, `${new Date().getFullYear() - 10}-01-01`)];

    const result = buildPortfolioWhatIfResult([fundedGoal, underfundedGoal], sips, allocations, noAdjustments);

    const carMarker = result.markers.find((m) => m.goalName === 'Car')!;
    const retirementMarker = result.markers.find((m) => m.goalName === 'Retirement')!;
    expect(carMarker.portfolioValueAfter).toBeGreaterThanOrEqual(0);
    expect(retirementMarker.portfolioValueAfter).toBeLessThan(0);
  });
});

describe('calculateRequiredTopUp', () => {
  it('returns no top-ups for an empty goal list', () => {
    const result = calculateRequiredTopUp([], [], twoInstrumentAllocations(), noAdjustments);

    expect(result.topUps).toEqual([]);
    expect(result.unresolvable).toBe(false);
  });

  it('returns no top-ups when the plan is already on track', () => {
    const goal = makeOneTimeGoal('House', 10, 500_000);
    const allocations = twoInstrumentAllocations();
    const sips = [makeSIP('Equity', 10_000, `${new Date().getFullYear() - 10}-01-01`)];

    const result = calculateRequiredTopUp([goal], sips, allocations, noAdjustments);

    expect(result.topUps).toEqual([]);
    expect(result.unresolvable).toBe(false);
  });

  it('splits the top-up across instruments in proportion to the current SIP mix, closing the gap', () => {
    const goal = makeOneTimeGoal('House', 10, 10_000_000);
    const allocations = twoInstrumentAllocations();
    const startDate = `${new Date().getFullYear() - 10}-01-01`;
    const sips = [makeSIP('Equity', 6_000, startDate), makeSIP('Debt', 4_000, startDate)];

    const result = calculateRequiredTopUp([goal], sips, allocations, noAdjustments);

    expect(result.unresolvable).toBe(false);
    expect(result.topUps.map((t) => t.investmentName).sort()).toEqual(['Debt', 'Equity']);
    result.topUps.forEach((topUp) => expect(topUp.additionalMonthlyAmount).toBeGreaterThan(0));

    // Roughly matches the 60/40 split the existing SIPs are already contributing in.
    const equity = result.topUps.find((t) => t.investmentName === 'Equity')!.additionalMonthlyAmount;
    const debt = result.topUps.find((t) => t.investmentName === 'Debt')!.additionalMonthlyAmount;
    expect(equity / (equity + debt)).toBeCloseTo(0.6, 1);

    // Applying the suggested top-up (as extra SIPs from the very start) should clear the shortfall.
    const toppedUpSips = [
      ...sips,
      ...result.topUps.map((t) => makeSIP(t.investmentName, t.additionalMonthlyAmount, startDate)),
    ];
    const toppedUpResult = buildPortfolioWhatIfResult([goal], toppedUpSips, allocations, noAdjustments);
    expect(toppedUpResult.status).toBe('on-track');
  });

  it('splits the top-up evenly across the allocation mix when no SIPs have been logged yet', () => {
    const goal = makeOneTimeGoal('House', 10, 5_000_000);
    const allocations = twoInstrumentAllocations();

    const result = calculateRequiredTopUp([goal], [], allocations, noAdjustments);

    expect(result.unresolvable).toBe(false);
    expect(result.topUps).toHaveLength(2);
    const [first, second] = result.topUps;
    expect(first.additionalMonthlyAmount).toBeCloseTo(second.additionalMonthlyAmount, -2);
  });

  it('weights the top-up toward the instrument whose return rate was lowered, not the SIP mix', () => {
    const goal = makeOneTimeGoal('House', 10, 10_000_000);
    const allocations = twoInstrumentAllocations();
    const startDate = `${new Date().getFullYear() - 10}-01-01`;
    // An even 50/50 SIP split — if the top-up just followed the mix, it'd split evenly too.
    const sips = [makeSIP('Equity', 5_000, startDate), makeSIP('Debt', 5_000, startDate)];

    // Only Equity's return rate has been dragged down; Debt is untouched.
    const result = calculateRequiredTopUp([goal], sips, allocations, {
      goalInflationRates: {},
      investmentReturnRates: { Equity: 1 },
    });

    expect(result.unresolvable).toBe(false);
    const equity = result.topUps.find((t) => t.investmentName === 'Equity')?.additionalMonthlyAmount ?? 0;
    const debt = result.topUps.find((t) => t.investmentName === 'Debt')?.additionalMonthlyAmount ?? 0;
    expect(equity).toBeGreaterThan(0);
    // Debt didn't cause any of the shortfall, so it should get little to none of the top-up —
    // nowhere near the 50/50 the SIP mix alone would suggest.
    expect(debt / (equity + debt)).toBeLessThan(0.1);
  });

  it('marks the shortfall unresolvable when a goal is due before any top-up could compound', () => {
    const today = dayjs().format('YYYY-MM-DD');
    const immediateGoal = new FinancialGoal('Emergency', GoalType.ONE_TIME, today, today, 1_000_000);
    const allocations = twoInstrumentAllocations();

    const result = calculateRequiredTopUp([immediateGoal], [], allocations, noAdjustments);

    expect(result.unresolvable).toBe(true);
    expect(result.topUps).toEqual([]);
  });
});
