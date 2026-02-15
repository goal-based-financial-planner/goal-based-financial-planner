import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentPieChart from './index';
import { InvestmentChoiceType } from '../../../../domain/InvestmentOptions';

// Mock MUI PieChart
jest.mock('@mui/x-charts', () => ({
  PieChart: ({ series, colors }: any) => (
    <div data-testid="pie-chart">
      <div data-testid="chart-colors">{JSON.stringify(colors)}</div>
      <div data-testid="chart-data">{JSON.stringify(series[0].data)}</div>
    </div>
  ),
}));

describe('InvestmentPieChart', () => {
  const mockAllocations: InvestmentChoiceType[] = [
    {
      investmentName: 'Large Cap Equity',
      investmentPercentage: 40,
      expectedReturnPercentage: 12,
    },
    {
      investmentName: 'Mid Cap Equity',
      investmentPercentage: 30,
      expectedReturnPercentage: 14,
    },
    {
      investmentName: 'Gold',
      investmentPercentage: 30,
      expectedReturnPercentage: 8,
    },
  ];

  it('should render pie chart', () => {
    render(
      <InvestmentPieChart allocations={mockAllocations} />,
    );
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should transform allocations into chart data', () => {
    render(
      <InvestmentPieChart allocations={mockAllocations} />,
    );
    const chartData = screen.getByTestId('chart-data');
    expect(chartData.textContent).toContain('Large Cap Equity');
    expect(chartData.textContent).toContain('"value":40');
  });

  it('should aggregate duplicate investment names', () => {
    const duplicateAllocations: InvestmentChoiceType[] = [
      {
        investmentName: 'Gold',
        investmentPercentage: 20,
        expectedReturnPercentage: 8,
      },
      {
        investmentName: 'Gold',
        investmentPercentage: 10,
        expectedReturnPercentage: 8,
      },
    ];
    render(
      <InvestmentPieChart allocations={duplicateAllocations} />,
    );
    const chartData = screen.getByTestId('chart-data');
    // Should aggregate to 30%
    expect(chartData.textContent).toContain('"value":30');
  });

  it('should handle empty allocations', () => {
    render(<InvestmentPieChart allocations={[]} />);
    const chartData = screen.getByTestId('chart-data');
    expect(chartData.textContent).toBe('[]');
  });

  it('should match snapshot', () => {
    const { container } = render(
      <InvestmentPieChart allocations={mockAllocations} />,
    );
    expect(container).toMatchSnapshot();
  });
});
