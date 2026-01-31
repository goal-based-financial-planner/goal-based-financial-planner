import { render, screen } from '@testing-library/react';
import TermWiseProgressBox, { TermTypeWiseProgressData } from './index';
import { TermType } from '../../../../types/enums';

describe('TermWiseProgressBox', () => {
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

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('Financial Progress')).toBeInTheDocument();
  });

  it('should display term type', () => {
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

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('Short Term')).toBeInTheDocument();
  });

  it('should display goal names as chips', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: ['Goal 1', 'Goal 2'],
        },
      },
    ];

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('Goal 1')).toBeInTheDocument();
    expect(screen.getByText('Goal 2')).toBeInTheDocument();
  });

  it('should show achievement message for 100% progress', () => {
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

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('🎉 Goals Acheived')).toBeInTheDocument();
  });

  it('should render multiple term types', () => {
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

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('Short Term')).toBeInTheDocument();
    expect(screen.getByText('Medium Term')).toBeInTheDocument();
    expect(screen.getByText('Long Term')).toBeInTheDocument();
  });

  it('should handle empty goal names array', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 50,
          termTypeSum: 100000,
          goalNames: [],
        },
      },
    ];

    const { container } = render(<TermWiseProgressBox data={data} />);

    expect(container).toBeInTheDocument();
  });

  it('should render progress bar for incomplete progress', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 65,
          termTypeSum: 75000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    const { container } = render(<TermWiseProgressBox data={data} />);

    // Progress bar should be rendered
    const progressBar = container.querySelector('.MuiLinearProgress-root');
    expect(progressBar).toBeInTheDocument();
  });

  it('should handle zero progress', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.MEDIUM_TERM,
        termTypeWiseData: {
          progressPercent: 0,
          termTypeSum: 100000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('Medium Term')).toBeInTheDocument();
  });

  it('should format term type sum correctly', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.LONG_TERM,
        termTypeWiseData: {
          progressPercent: 40,
          termTypeSum: 1000000,
          goalNames: ['Goal 1'],
        },
      },
    ];

    render(<TermWiseProgressBox data={data} />);

    // The formatNumber function should format this as "1,000,000"
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });

  it('should render with single term type data', () => {
    const data: TermTypeWiseProgressData[] = [
      {
        termType: TermType.SHORT_TERM,
        termTypeWiseData: {
          progressPercent: 80,
          termTypeSum: 50000,
          goalNames: ['Emergency Fund'],
        },
      },
    ];

    render(<TermWiseProgressBox data={data} />);

    expect(screen.getByText('Short Term')).toBeInTheDocument();
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
  });
});
