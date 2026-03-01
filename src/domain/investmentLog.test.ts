import { totalMonthlySIP, buildSIPComparison } from './investmentLog';
import { SIPEntry } from '../types/investmentLog';
import { InvestmentSuggestion } from '../types/planner';

const makeSIP = (overrides: Partial<SIPEntry> = {}): SIPEntry => ({
  id: 'sip-1',
  name: 'Axis Bank Liquid Fund',
  type: 'Liquid Funds',
  monthlyAmount: 10000,
  ...overrides,
});

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
