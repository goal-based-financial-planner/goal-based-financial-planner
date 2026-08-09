import { render, screen } from '@testing-library/react';
import WhatIfChart from './index';
import { WhatIfGoalMarker, WhatIfProjectionPoint, WhatIfTopUpResult } from '../../../../../domain/whatIf';

const noTopUp: WhatIfTopUpResult = { topUps: [], unresolvable: false };

vi.mock('@mui/x-charts/LineChart', () => ({
  LineChart: ({ series, children }: { series?: { label?: string }[]; children?: React.ReactNode }) => (
    <div data-testid="line-chart">
      {series?.map((s) => (
        <div key={s.label} data-testid="chart-series">
          {s.label}
        </div>
      ))}
      {children}
    </div>
  ),
}));

vi.mock('@mui/x-charts', () => ({
  ChartsReferenceLine: ({ label }: { label?: string }) => <div data-testid="reference-line">{label}</div>,
}));

const makePoints = (values: number[]): WhatIfProjectionPoint[] =>
  values.map((value, i) => ({ date: `2026-${String(i + 1).padStart(2, '0')}-01`, value }));

describe('WhatIfChart', () => {
  it('renders an empty-state message when there is no requirement series', () => {
    render(<WhatIfChart requirement={[]} investing={[]} markers={[]} requiredTopUp={noTopUp} />);

    expect(screen.getByText(/add a goal to see the what-if comparison/i)).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders "My Investments" as the only line series — the requirement is conveyed by the dashed reference lines instead', () => {
    render(
      <WhatIfChart
        requirement={makePoints([100, 100, 100])}
        investing={makePoints([0, 40, 100])}
        markers={[]}
        requiredTopUp={noTopUp}
      />,
    );

    const seriesLabels = screen.getAllByTestId('chart-series').map((el) => el.textContent);
    expect(seriesLabels).toEqual(['My Investments']);
  });

  it('renders one dashed reference line per goal marker', () => {
    const markers: WhatIfGoalMarker[] = [
      { goalId: '1', goalName: 'House', date: '2026-02-01', amount: 100, portfolioValueAfter: 40 },
      { goalId: '2', goalName: 'Car', date: '2026-03-01', amount: 50, portfolioValueAfter: 100 },
    ];

    render(
      <WhatIfChart
        requirement={makePoints([100, 100, 100])}
        investing={makePoints([0, 40, 100])}
        markers={markers}
        requiredTopUp={noTopUp}
      />,
    );

    expect(screen.getAllByTestId('reference-line')).toHaveLength(2);
  });

  it('shows a shortfall warning only for goals whose withdrawal leaves the corpus negative', () => {
    const markers: WhatIfGoalMarker[] = [
      { goalId: '1', goalName: 'House', date: '2026-02-01', amount: 100, portfolioValueAfter: 40 },
      { goalId: '2', goalName: 'Car', date: '2026-03-01', amount: 50, portfolioValueAfter: -20 },
    ];

    render(
      <WhatIfChart
        requirement={makePoints([100, 100, 100])}
        investing={makePoints([0, 40, -20])}
        markers={markers}
        requiredTopUp={noTopUp}
      />,
    );

    const warnings = screen.getAllByText(/short by/i);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toHaveTextContent('Car');
    expect(warnings[0]).not.toHaveTextContent('House');
  });

  it('shows the per-instrument top-up suggestion under a shortfall warning', () => {
    const markers: WhatIfGoalMarker[] = [
      { goalId: '1', goalName: 'Car', date: '2026-03-01', amount: 50, portfolioValueAfter: -20 },
    ];
    const requiredTopUp: WhatIfTopUpResult = {
      topUps: [
        { investmentName: 'Equity', additionalMonthlyAmount: 1200 },
        { investmentName: 'Debt', additionalMonthlyAmount: 800 },
      ],
      unresolvable: false,
    };

    render(
      <WhatIfChart
        requirement={makePoints([100, 100, 100])}
        investing={makePoints([0, 40, -20])}
        markers={markers}
        requiredTopUp={requiredTopUp}
      />,
    );

    expect(screen.getByText(/in equity/i)).toBeInTheDocument();
    expect(screen.getByText(/in debt/i)).toBeInTheDocument();
  });

  it('shows an unresolvable message instead of a top-up suggestion when SIPs alone cannot help', () => {
    const markers: WhatIfGoalMarker[] = [
      { goalId: '1', goalName: 'Car', date: '2026-03-01', amount: 50, portfolioValueAfter: -20 },
    ];
    const requiredTopUp: WhatIfTopUpResult = { topUps: [], unresolvable: true };

    render(
      <WhatIfChart
        requirement={makePoints([100, 100, 100])}
        investing={makePoints([0, 40, -20])}
        markers={markers}
        requiredTopUp={requiredTopUp}
      />,
    );

    expect(screen.getByText(/increasing your sips alone/i)).toBeInTheDocument();
  });
});
