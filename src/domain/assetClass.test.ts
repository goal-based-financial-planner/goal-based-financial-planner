import { assetClassMix, assetClassOf } from './assetClass';

describe('assetClassOf', () => {
  it.each([
    ['Large Cap Mutual Funds', 'Equity'],
    ['Small Cap Equity Mutual Funds', 'Equity'],
    ['Recurring Deposit', 'Debt / RD'],
    ['Bank Fixed Deposits (FD)', 'Debt / RD'],
    ['Public Provident Fund (PPF)', 'Debt / RD'],
    ['Sovereign Gold Bonds (SGBs)', 'Gold'],
    ['Gold', 'Gold'],
    ['Real Estate Funds', 'Real Estate'],
    ['Crypto', 'Other'],
  ])('%s → %s', (name, expected) => {
    expect(assetClassOf(name)).toBe(expected);
  });
});

describe('assetClassMix', () => {
  it('groups amounts by class in a fixed order', () => {
    expect(
      assetClassMix([
        { instrument: 'Gold', amount: 100 },
        { instrument: 'Large Cap Mutual Funds', amount: 600 },
        { instrument: 'Mid Cap Mutual Funds', amount: 150 },
        { instrument: 'Recurring Deposit', amount: 150 },
      ]),
    ).toEqual([
      { assetClass: 'Equity', amount: 750, percent: 75 },
      { assetClass: 'Debt / RD', amount: 150, percent: 15 },
      { assetClass: 'Gold', amount: 100, percent: 10 },
    ]);
  });

  it('is empty with nothing invested', () => {
    expect(assetClassMix([])).toEqual([]);
  });
});
