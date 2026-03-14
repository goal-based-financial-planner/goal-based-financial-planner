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

  it('should render target amount and goal count', () => {
    render(
      <TargetBox
        targetAmount={5000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );
    expect(screen.getByText(/total goal target/i)).toBeInTheDocument();
    expect(screen.getByTestId('live-counter')).toHaveTextContent('5000000');
    // 2 goals across the mock data
    expect(screen.getByText(/across 2 goals/i)).toBeInTheDocument();
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

  it('should call setShowDrawer when Goals button clicked', () => {
    render(
      <TargetBox
        targetAmount={1000000}
        dispatch={mockDispatch}
        termTypeWiseProgressData={mockProgressData}
        setShowDrawer={mockSetShowDrawer}
      />,
    );

    const viewButton = screen.getByRole('button', { name: /goals/i, hidden: true });
    fireEvent.click(viewButton);

    expect(mockSetShowDrawer).toHaveBeenCalledWith(true);
  });

  it('should show "No goals added yet" when there are no goals', () => {
    render(
      <TargetBox
        targetAmount={0}
        dispatch={mockDispatch}
        termTypeWiseProgressData={[]}
        setShowDrawer={mockSetShowDrawer}
      />,
    );

    expect(screen.getByText(/no goals added yet/i)).toBeInTheDocument();
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
