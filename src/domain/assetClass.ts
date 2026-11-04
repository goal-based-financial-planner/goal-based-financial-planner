export type AssetClass = 'Equity' | 'Debt / RD' | 'Gold' | 'Real Estate' | 'Other';

const ASSET_CLASS_PATTERNS: [RegExp, AssetClass][] = [
  [/gold|sgb/i, 'Gold'],
  [/real estate|reit/i, 'Real Estate'],
  [/deposit|\bfd\b|\brd\b|ppf|provident|bond|g-sec|securities|debt|liquid/i, 'Debt / RD'],
  [/cap|equity|mutual fund|index|nps|pension|stock|share|elss/i, 'Equity'],
];

export const ASSET_CLASS_ORDER: AssetClass[] = ['Equity', 'Debt / RD', 'Gold', 'Real Estate', 'Other'];

export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  Equity: '#52B788',
  'Debt / RD': '#E8772E',
  Gold: '#F2C94C',
  'Real Estate': '#9AA1B5',
  Other: '#8B5CF6',
};

/** Broad asset class for an instrument name, e.g. "Mid Cap Mutual Funds" → Equity. */
export const assetClassOf = (instrument: string): AssetClass =>
  ASSET_CLASS_PATTERNS.find(([pattern]) => pattern.test(instrument))?.[1] ?? 'Other';

/** Share of each asset class (whole percents) in a set of instrument amounts. */
export function assetClassMix(amounts: { instrument: string; amount: number }[]): { assetClass: AssetClass; percent: number; amount: number }[] {
  const total = amounts.reduce((sum, a) => sum + a.amount, 0);
  if (total <= 0) return [];
  const byClass: Partial<Record<AssetClass, number>> = {};
  amounts.forEach(({ instrument, amount }) => {
    const cls = assetClassOf(instrument);
    byClass[cls] = (byClass[cls] ?? 0) + amount;
  });
  return ASSET_CLASS_ORDER.filter((cls) => (byClass[cls] ?? 0) > 0).map((cls) => ({
    assetClass: cls,
    amount: byClass[cls]!,
    percent: Math.round((byClass[cls]! / total) * 100),
  }));
}
