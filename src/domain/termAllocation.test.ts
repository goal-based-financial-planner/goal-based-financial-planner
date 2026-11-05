import { buildIdealTermAllocations } from './termAllocation';
import { TermType } from '../types/enums';

const suggestion = (investmentName: string, amount: number) => ({
  investmentName,
  amount,
  expectedReturnPercentage: 8,
});

const ideal = buildIdealTermAllocations([
  {
    termType: TermType.SHORT_TERM,
    investmentBreakdown: [{ investmentSuggestions: [suggestion('RD', 1000)] }],
  },
  {
    termType: TermType.LONG_TERM,
    investmentBreakdown: [
      { investmentSuggestions: [suggestion('RD', 1000), suggestion('Large Cap', 2000)] },
      { investmentSuggestions: [suggestion('Large Cap', 1000)] },
    ],
  },
]);

describe('buildIdealTermAllocations', () => {
  it('sums suggestions per instrument within each term', () => {
    expect(ideal[1]).toEqual({
      termType: TermType.LONG_TERM,
      total: 4000,
      slices: [
        { investmentName: 'RD', amount: 1000, percentage: 25 },
        { investmentName: 'Large Cap', amount: 3000, percentage: 75 },
      ],
    });
  });
});
