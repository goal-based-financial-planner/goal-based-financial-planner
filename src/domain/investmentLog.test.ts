import { totalMonthlySIP, buildSIPComparison, buildGrowthProjection, buildPortfolioWithdrawalSeries, GoalSuggestion } from './investmentLog';
import { SIPEntry } from '../types/investmentLog';
import { InvestmentSuggestion } from '../types/planner';
import { FinancialGoal } from './FinancialGoals';
import { GoalType } from '../types/enums';
import dayjs from 'dayjs';

const makeSIP = (overrides: Partial<SIPEntry> = {}): SIPEntry => ({
  id: 'sip-1',
  name: 'Axis Bank Liquid Fund',
  type: 'Liquid Funds',
  monthlyAmount: 10000,
  ...overrides,
});

const makeDatedSIP = (overrides: Partial<SIPEntry> = {}): SIPEntry => ({
  id: 'sip-d1',
  name: 'Index Fund SIP',
  type: 'Index Funds',
  monthlyAmount: 10000,
  startDate: `${new Date().getFullYear() - 2}-01-01`,
  ...overrides,
});

function makeOneTimeGoal(name: string, yearsFromNow: number): FinancialGoal {
  const targetYear = new Date().getFullYear() + yearsFromNow;
  return new FinancialGoal(name, GoalType.ONE_TIME, `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 1000000);
}

const makeSuggestion = (name: string, amount: number): InvestmentSuggestion => ({
  investmentName: name,
  amount,
  expectedReturnPercentage: 12,
});

describe('totalMonthlySIP', () => {
  it('sums all SIP monthly amounts', () => {
    const sips = [
      makeSIP({ id: '1', monthlyAmount: 10000 }),
      makeSIP({ id: '2', monthlyAmount: 20000 }),
      makeSIP({ id: '3', monthlyAmount: 5000 }),
    ];
    expect(totalMonthlySIP(sips)).toBe(35000);
  });

  it('returns 0 for empty array', () => {
    expect(totalMonthlySIP([])).toBe(0);
  });

  it('returns amount for a single SIP', () => {
    expect(totalMonthlySIP([makeSIP({ monthlyAmount: 40000 })])).toBe(40000);
  });
});

describe('buildSIPComparison', () => {
  const suggestions = [
    makeSuggestion('Liquid Funds', 25000),
    makeSuggestion('Index Funds', 50000),
  ];

  it('matches SIPs to suggestion by type and sums amounts', () => {
    const sips = [
      makeSIP({ id: '1', type: 'Liquid Funds', monthlyAmount: 30000 }),
      makeSIP({ id: '2', type: 'Liquid Funds', monthlyAmount: 10000 }),
    ];
    const result = buildSIPComparison(sips, suggestions);
    const liquidRow = result.find((r) => r.type === 'Liquid Funds')!;
    expect(liquidRow.actualAmount).toBe(40000);
    expect(liquidRow.suggestedAmount).toBe(25000);
    expect(liquidRow.difference).toBe(15000);
    expect(liquidRow.sips).toHaveLength(2);
  });

  it('shows 0 actual and negative difference when no SIPs match a type', () => {
    const result = buildSIPComparison([], suggestions);
    const indexRow = result.find((r) => r.type === 'Index Funds')!;
    expect(indexRow.actualAmount).toBe(0);
    expect(indexRow.difference).toBe(-50000);
    expect(indexRow.sips).toHaveLength(0);
  });

  it('returns one row per suggestion', () => {
    const result = buildSIPComparison([], suggestions);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when both sips and suggestions are empty', () => {
    expect(buildSIPComparison([], [])).toEqual([]);
  });

  it('includes custom SIP types not in suggestions with suggestedAmount 0', () => {
    const sips = [
      makeSIP({ id: '1', type: 'PPF', monthlyAmount: 12500 }),
      makeSIP({ id: '2', type: 'PPF', monthlyAmount: 7500 }),
    ];
    const result = buildSIPComparison(sips, suggestions);
    const ppfRow = result.find((r) => r.type === 'PPF')!;
    expect(ppfRow).toBeDefined();
    expect(ppfRow.suggestedAmount).toBe(0);
    expect(ppfRow.actualAmount).toBe(20000);
    expect(ppfRow.difference).toBe(20000);
    expect(ppfRow.sips).toHaveLength(2);
  });

  it('attaches matching SIPs to each comparison row', () => {
    const sips = [
      makeSIP({ id: '1', type: 'Liquid Funds', name: 'Fund A' }),
      makeSIP({ id: '2', type: 'Index Funds', name: 'Fund B' }),
    ];
    const result = buildSIPComparison(sips, suggestions);
    expect(result.find((r) => r.type === 'Liquid Funds')!.sips[0].name).toBe('Fund A');
    expect(result.find((r) => r.type === 'Index Funds')!.sips[0].name).toBe('Fund B');
  });
});

describe('buildGrowthProjection', () => {
  const suggestions = [
    makeSuggestion('Liquid Funds', 10000),
  ];

  it('returns year 0 with value 0', () => {
    const result = buildGrowthProjection([], suggestions, 5);
    expect(result[0]).toEqual({ year: 0, expectedValue: 0, actualValue: 0 });
  });

  it('returns correct number of data points (years + 1)', () => {
    const result = buildGrowthProjection([], suggestions, 5);
    expect(result).toHaveLength(6);
  });

  it('expected value grows over time with compounding', () => {
    const result = buildGrowthProjection([], suggestions, 5);
    expect(result[5].expectedValue).toBeGreaterThan(result[1].expectedValue);
    expect(result[5].expectedValue).toBeGreaterThan(10000 * 60); // more than simple sum
  });

  it('actual value is 0 when no SIPs exist', () => {
    const result = buildGrowthProjection([], suggestions, 5);
    result.forEach((d) => expect(d.actualValue).toBe(0));
  });

  it('uses default return rate for custom SIP types not in suggestions', () => {
    const customSip = makeSIP({ type: 'PPF', monthlyAmount: 10000 });
    const result = buildGrowthProjection([customSip], [], 5);
    // Should still compute a value (using 10% default), not 0
    expect(result[5].actualValue).toBeGreaterThan(0);
  });
});

describe('buildPortfolioWithdrawalSeries', () => {
  it('returns empty series when there are no SIPs', () => {
    const goal = makeOneTimeGoal('House', 5);
    const result = buildPortfolioWithdrawalSeries([], [goal], []);
    expect(result.points).toHaveLength(0);
    expect(result.suggestedPoints).toHaveLength(0);
    expect(result.goalMarkers).toHaveLength(0);
  });

  it('returns empty series when there are no one-time goals', () => {
    const sip = makeDatedSIP();
    const result = buildPortfolioWithdrawalSeries([sip], [], []);
    expect(result.points).toHaveLength(0);
    expect(result.suggestedPoints).toHaveLength(0);
    expect(result.goalMarkers).toHaveLength(0);
  });

  it('generates points spanning from SIP start to one year after last goal', () => {
    const sip = makeDatedSIP();
    const goal = makeOneTimeGoal('House', 5);
    const { points } = buildPortfolioWithdrawalSeries([sip], [goal], []);
    // ~2 years past + 5 future + 1 extra = ~96 months
    expect(points.length).toBeGreaterThanOrEqual(60);
  });

  it('portfolio value increases over time before goal withdrawals', () => {
    const sip = makeDatedSIP({ monthlyAmount: 10000 });
    const goal = makeOneTimeGoal('House', 5);
    const { points } = buildPortfolioWithdrawalSeries([sip], [goal], []);
    // Mid-chart value should exceed the initial value
    const midIdx = Math.floor(points.length / 2);
    expect(points[midIdx].value).toBeGreaterThan(points[0].value);
  });

  it('produces goalMarkers with correct names and positive amounts', () => {
    const sip = makeDatedSIP({ monthlyAmount: 50000 });
    const goal1 = makeOneTimeGoal('Car', 3);
    const goal2 = makeOneTimeGoal('House', 6);
    const { goalMarkers } = buildPortfolioWithdrawalSeries([sip], [goal1, goal2], []);
    const names = goalMarkers.map((m) => m.goalName);
    expect(names).toContain('Car');
    expect(names).toContain('House');
    goalMarkers.forEach((m) => expect(m.amount).toBeGreaterThan(0));
  });

  it('returns empty suggestedPoints when allSuggestions is empty', () => {
    const sip = makeDatedSIP();
    const goal = makeOneTimeGoal('House', 5);
    const { suggestedPoints } = buildPortfolioWithdrawalSeries([sip], [goal], []);
    expect(suggestedPoints).toHaveLength(0);
  });

  it('suggestedPoints matches actual when investing exactly the suggested amount', () => {
    const sip = makeDatedSIP({ monthlyAmount: 10000, type: 'Index Funds' });
    const goal = makeOneTimeGoal('House', 5);
    const suggestion: InvestmentSuggestion = { investmentName: 'Index Funds', amount: 10000, expectedReturnPercentage: 12 };
    const { points, suggestedPoints } = buildPortfolioWithdrawalSeries([sip], [goal], [suggestion]);
    expect(suggestedPoints).toHaveLength(points.length);
    suggestedPoints.forEach((sp, i) => {
      expect(sp.value).toBe(points[i].value);
    });
  });

  it('suggestedPoints exceeds actual when under-investing', () => {
    const sip = makeDatedSIP({ monthlyAmount: 5000, type: 'Index Funds' });
    const goal = makeOneTimeGoal('House', 5);
    const suggestion: InvestmentSuggestion = { investmentName: 'Index Funds', amount: 10000, expectedReturnPercentage: 12 };
    const { points, suggestedPoints } = buildPortfolioWithdrawalSeries([sip], [goal], [suggestion]);
    const lastIdx = points.length - 1;
    expect(suggestedPoints[lastIdx].value).toBeGreaterThan(points[lastIdx].value);
  });

  it('two SIPs of same type are scaled proportionally — no double-counting', () => {
    // Each SIP 5k/mo, total actual 10k = suggested 10k → suggestedPoints should equal actual
    const sip1 = makeDatedSIP({ id: 's1', type: 'Index Funds', monthlyAmount: 5000 });
    const sip2 = makeDatedSIP({ id: 's2', type: 'Index Funds', monthlyAmount: 5000 });
    const goal = makeOneTimeGoal('House', 5);
    const suggestion: InvestmentSuggestion = { investmentName: 'Index Funds', amount: 10000, expectedReturnPercentage: 12 };
    const { points, suggestedPoints } = buildPortfolioWithdrawalSeries([sip1, sip2], [goal], [suggestion]);
    suggestedPoints.forEach((sp, i) => {
      expect(sp.value).toBe(points[i].value);
    });
  });

  it('uses today as chart start when no SIP has a valid startDate', () => {
    const sip = makeDatedSIP({ startDate: undefined });
    const goal = makeOneTimeGoal('House', 5);
    const { points } = buildPortfolioWithdrawalSeries([sip], [goal], []);
    expect(points.length).toBeGreaterThan(0);
    // First point date should be the current month
    const firstDate = new Date(points[0].date);
    const today = new Date();
    expect(firstDate.getFullYear()).toBe(today.getFullYear());
    expect(firstDate.getMonth()).toBe(today.getMonth());
  });
});

describe('buildPortfolioWithdrawalSeries — stop-per-goal mode', () => {
  // SIP with NO startDate, matching the user scenario
  const noDateSIP = (overrides: Partial<SIPEntry> = {}): SIPEntry => ({
    id: 's1',
    name: 'Index Fund',
    type: 'Index Funds',
    monthlyAmount: 10000,
    ...overrides,
  });

  function findMonthIdx(points: { date: Date }[], targetDate: string): number {
    const target = dayjs(targetDate).startOf('month');
    return points.findIndex((p) => dayjs(p.date).isSame(target, 'month'));
  }

  it('after goal date, actual portfolio grows only by compounding (no new contributions)', () => {
    // Small goal so portfolio stays positive for clear comparison
    const targetYear = new Date().getFullYear() + 5;
    const goal = new FinancialGoal('House', GoalType.ONE_TIME,
      `${targetYear - 10}-01-01`, `${targetYear}-01-01`, 50_000);

    const goalWiseSugs: GoalSuggestion[] = [{
      goalStartDate: `${targetYear - 10}-01-01`,
      goalTargetDate: `${targetYear}-01-01`,
      suggestions: [{ investmentName: 'Index Funds', amount: 10000, expectedReturnPercentage: 12 }],
    }];

    const { points: stopPoints } = buildPortfolioWithdrawalSeries(
      [noDateSIP()], [goal], [], goalWiseSugs,
    );
    const { points: continuePoints } = buildPortfolioWithdrawalSeries(
      [noDateSIP()], [goal], [],
    );

    const goalIdx = findMonthIdx(stopPoints, `${targetYear}-01-01`);
    expect(goalIdx).toBeGreaterThan(0);

    // 12 months after the goal, continue mode should be substantially higher
    // because it keeps adding ₹10k/mo; stop mode only compounds the residual
    const afterIdx = goalIdx + 12;
    expect(afterIdx).toBeLessThan(stopPoints.length);
    expect(continuePoints[afterIdx].value).toBeGreaterThan(stopPoints[afterIdx].value + 50_000);
  });

  it('with two goals, first goal portion stops while second continues — growth slows proportionally', () => {
    const year3 = new Date().getFullYear() + 3;
    const year6 = new Date().getFullYear() + 6;
    const goal1 = new FinancialGoal('Short', GoalType.ONE_TIME, `${year3-10}-01-01`, `${year3}-01-01`, 30_000);
    const goal2 = new FinancialGoal('Long',  GoalType.ONE_TIME, `${year6-10}-01-01`, `${year6}-01-01`, 30_000);

    // 40% for goal1, 60% for goal2
    const goalWiseSugs: GoalSuggestion[] = [
      { goalStartDate: `${year3-10}-01-01`, goalTargetDate: `${year3}-01-01`, suggestions: [{ investmentName: 'Index Funds', amount: 4000, expectedReturnPercentage: 12 }] },
      { goalStartDate: `${year6-10}-01-01`, goalTargetDate: `${year6}-01-01`, suggestions: [{ investmentName: 'Index Funds', amount: 6000, expectedReturnPercentage: 12 }] },
    ];

    const { points: stopPoints } = buildPortfolioWithdrawalSeries(
      [noDateSIP()], [goal1, goal2], [], goalWiseSugs,
    );
    const { points: continuePoints } = buildPortfolioWithdrawalSeries(
      [noDateSIP()], [goal1, goal2], [],
    );

    const goal1Idx = findMonthIdx(stopPoints, `${year3}-01-01`);
    expect(goal1Idx).toBeGreaterThan(0);

    // Between goal1 and goal2 dates: stop mode only contributes 60% (₹6k/mo)
    // Continue mode contributes 100% (₹10k/mo)
    // So after 12 months, continue mode should be higher
    const midIdx = goal1Idx + 12;
    expect(midIdx).toBeLessThan(stopPoints.length);
    expect(continuePoints[midIdx].value).toBeGreaterThan(stopPoints[midIdx].value + 20_000);
  });

  it('"if on plan" uses the actual SIP start date, not the goal\'s planned start date', () => {
    // Goal was planned to start being funded 1 year from now, but the SIP wasn't actually
    // logged until 3 years from now — the "if on plan" line should follow the latter.
    const targetYear = new Date().getFullYear() + 6;
    const goalStart = dayjs().add(1, 'year').format('YYYY-MM-DD');
    const goal = new FinancialGoal('Long', GoalType.ONE_TIME, goalStart, `${targetYear}-01-01`, 30_000);

    const equitySip = noDateSIP({ type: 'Equity', monthlyAmount: 6000, startDate: dayjs().add(3, 'year').format('YYYY-MM-DD') });
    const anchorSip = noDateSIP({ id: 's0', type: 'Debt', monthlyAmount: 1000, startDate: dayjs().format('YYYY-MM-DD') });

    const allSuggestions: InvestmentSuggestion[] = [makeSuggestion('Equity', 6000), makeSuggestion('Debt', 1000)];
    const goalWiseSugs: GoalSuggestion[] = [{
      goalStartDate: goalStart,
      goalTargetDate: `${targetYear}-01-01`,
      suggestions: [{ investmentName: 'Equity', amount: 6000, expectedReturnPercentage: 12 }],
    }];

    const { suggestedPoints } = buildPortfolioWithdrawalSeries([anchorSip, equitySip], [goal], allSuggestions, goalWiseSugs);

    // At the goal's planned start (1yr in), the Equity SIP hasn't actually started yet (starts at 3yr) —
    // so the suggested Equity contribution shouldn't have begun compounding either.
    const plannedStartIdx = findMonthIdx(suggestedPoints, dayjs().add(1, 'year').format('YYYY-MM-DD'));
    const actualStartIdx = findMonthIdx(suggestedPoints, dayjs().add(3, 'year').format('YYYY-MM-DD'));
    expect(plannedStartIdx).toBeGreaterThan(0);
    expect(actualStartIdx).toBeGreaterThan(plannedStartIdx);

    // Before the Equity SIP's actual start, only the ₹1000/mo Debt anchor is contributing —
    // 6 months of growth should be modest.
    const growthBeforeActualStart = suggestedPoints[plannedStartIdx + 6].value - suggestedPoints[plannedStartIdx].value;

    // Once the Equity SIP's actual start date passes, its ₹6000/mo suggested contribution kicks
    // in too — the same 6-month window should now grow far more.
    const growthAfterActualStart = suggestedPoints[actualStartIdx + 6].value - suggestedPoints[actualStartIdx].value;

    expect(growthAfterActualStart).toBeGreaterThan(growthBeforeActualStart * 3);
  });

  it('when SIP type has no matching suggestion, it keeps running in stop mode too', () => {
    const targetYear = new Date().getFullYear() + 5;
    const goal = makeOneTimeGoal('House', 5);

    // SIP type "PPF" has no suggestion — should keep contributing forever
    const ppfSip = noDateSIP({ type: 'PPF' });
    const goalWiseSugs: GoalSuggestion[] = [{
      goalStartDate: `${targetYear - 10}-01-01`,
      goalTargetDate: `${targetYear}-01-01`,
      suggestions: [{ investmentName: 'Index Funds', amount: 10000, expectedReturnPercentage: 12 }],
    }];

    const { points: stopPoints } = buildPortfolioWithdrawalSeries(
      [ppfSip], [goal], [], goalWiseSugs,
    );
    const { points: continuePoints } = buildPortfolioWithdrawalSeries(
      [ppfSip], [goal], [],
    );

    // No goal mapping for PPF → both modes behave identically
    expect(stopPoints.length).toBe(continuePoints.length);
    stopPoints.forEach((sp, i) => {
      expect(sp.value).toBe(continuePoints[i].value);
    });
  });
});
