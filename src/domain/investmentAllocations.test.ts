import investmentNames from './investmentAllocations';

describe('investmentAllocations', () => {
  it('should export an array of investment names', () => {
    expect(Array.isArray(investmentNames)).toBe(true);
    expect(investmentNames.length).toBeGreaterThan(0);
  });

  it('should include common investment types', () => {
    expect(investmentNames).toContain('Large Cap Equity Mutual Funds');
    expect(investmentNames).toContain('Public Provident Fund (PPF)');
    expect(investmentNames).toContain('Gold');
  });

  it('should have unique investment names', () => {
    const uniqueNames = new Set(investmentNames);
    expect(uniqueNames.size).toBe(investmentNames.length);
  });

  it('should match expected investment options', () => {
    expect(investmentNames).toMatchSnapshot();
  });
});
