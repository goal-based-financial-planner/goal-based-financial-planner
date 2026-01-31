import { render, screen } from '@testing-library/react';
import TermWiseProgressBarChart, {
  TermTypeWiseProgressData,
} from './termWiseProgressBarChart';
import { TermType } from '../../../../types/enums';

// Mock MUI BarChart
jest.mock('@mui/x-charts/BarChart', () => ({
  BarChart: ({ xAxis, yAxis, series, height, barLabel }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-height">{height}</div>
      <div data-testid="x-axis-data">
        {xAxis[0].data.map((item: string) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div data-testid="series-data">
        {series[0].data.map((value: number, idx: number) => (
          <span key={idx}>{value}</span>
        ))}
      </div>
    </div>
  ),
}));

describe('TermWiseProgressBarChart', () => {
  it('should render financial progress title', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    expect(screen.getByText('Financial Progress')).toBeInTheDocument();
  });

  it('should render bar chart component', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should display correct chart height', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    expect(screen.getByTestId('chart-height')).toHaveTextContent('250');
  });

  it('should render all term types in chart', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 75,
          termTypeSum: 50000,
          goalNames: ['Goal 1'],
        },
      },
      {
        termType: TermType.MEDIUM_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: ['Goal 2'],
        },
      },
      {
        termType: TermType.LONG_TERM,
        termTypeWiseData: {
          progressPercent: 25,
          termTypeSum: 200000,
          goalNames: ['Goal 3'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    const xAxisData = screen.getByTestId('x-axis-data');
    expect(xAxisData).toHaveTextContent('Short Term');
    expect(xAxisData).toHaveTextContent('Medium Term');
    expect(xAxisData).toHaveTextContent('Long Term');
  });

  it('should render progress percentages correctly', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 75,
          termTypeSum: 50000,
          goalNames: ['Goal 1'],
        },
      },
      {
        termType: TermType.MEDIUM_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: ['Goal 2'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    const seriesData = screen.getByTestId('series-data');
    expect(seriesData).toHaveTextContent('75');
    expect(seriesData).toHaveTextContent('50');
  });

  it('should handle zero progress', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 0,
          termTypeSum: 100000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    const seriesData = screen.getByTestId('series-data');
    expect(seriesData).toHaveTextContent('0');
  });

  it('should handle 100% progress', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.LONG_TERM,
        termTypeWiseData: {
          progressPercent: 100,
          termTypeSum: 500000,
          goalNames: ['Retirement'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    const seriesData = screen.getByTestId('series-data');
    expect(seriesData).toHaveTextContent('100');
  });

  it('should handle single term type', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 60,
          termTypeSum: 75000,
          goalNames: ['Emergency Fund'],
        },
      },
    ];

    render(<TermWiseProgressBarChart data={data} />);

    expect(screen.getByText('Short Term')).toBeInTheDocument();
  });

  it('should handle empty data array', () => {
    const data: TermTypeWiseProgressData[] = [];

    const { container } = render(<TermWiseProgressBarChart data={data} />);

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Financial Progress')).toBeInTheDocument();
  });
});
