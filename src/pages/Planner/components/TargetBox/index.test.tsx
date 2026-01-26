import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TargetBox from './index';
import { TermTypeWiseProgressData } from '../TermwiseProgressBox';
import { TermType } from '../../../../types/enums';

// Mock child components
jest.mock('../../../../components/LiveNumberCounter', () => {
  return function MockLiveCounter({ value }: any) {
    return <div data-testid="live-counter">{value}</div>;
  };
});

jest.mock('../../../Home/components/AddGoalPopup', () => {
  return function MockAddGoalPopup({ isOpen, onClose }: any) {
    return isOpen ? (
      <div data-testid="add-goal-popup">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('../TermwiseProgressBox/termWiseProgressBarChart', () => {
  return function MockTermWiseProgressBarChart() {
    return <div data-testid="bar-chart">Bar Chart</div>;
  };
});

describe('TargetBox', () => {
  const mockDispatch = jest.fn();
  const mockSetShowDrawer = jest.fn();
  const mockProgressData: TermTypeWiseProgressData[] = [
    {
      termType: TermType.SHORT_TERM,
      termTypeWiseData: {
        progressPercent: 50,
        termTypeSum: 100000,
        goalNames: ['House'],
      },
    },
    {
      termType: TermType.LONG_TERM,
      termTypeWiseData: {
        progressPercent: 75,
        termTypeSum: 200000,
        goalNames: ['Retirement'],
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render target amount', () => {
    render(
      <TargetBox
        targetAmount={5000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );
    expect(screen.getByText('Your Target')).toBeInTheDocument();
    expect(screen.getByTestId('live-counter')).toHaveTextContent('5000000');
  });

  it('should open add goal popup when Add Goal button clicked', () => {
    render(
      <TargetBox
        targetAmount={1000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );

    const addButton = screen.getByText('Add Goal');
    fireEvent.click(addButton);

    expect(screen.getByTestId('add-goal-popup')).toBeInTheDocument();
  });

  it('should call setShowDrawer when View Goals clicked', () => {
    render(
      <TargetBox
        targetAmount={1000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );

    const viewButton = screen.getByText('View Goals');
    fireEvent.click(viewButton);

    expect(mockSetShowDrawer).toHaveBeenCalledWith(true);
  });

  it('should toggle expand state when expand icon clicked', () => {
    render(
      <TargetBox
        targetAmount={1000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );

    // Initially chart should not be visible
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();

    // Click expand
    const expandButton = screen.getByRole('button', { name: '' }); // IconButton has no name
    fireEvent.click(expandButton);

    // Chart should be visible
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(
      <TargetBox
        targetAmount={1000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
