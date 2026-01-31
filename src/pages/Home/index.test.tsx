import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './index';
import * as storage from '../../util/storage';
import * as reducer from '../../store/plannerDataReducer';

// Mock child components
jest.mock('../LandingPage', () => {
  return function MockLandingPage() {
    return <div data-testid="landing-page">Landing Page</div>;
  };
});

jest.mock('../Planner', () => {
  return function MockPlanner() {
    return <div data-testid="planner-page">Planner Page</div>;
  };
});

jest.mock('./components/DisclaimerDialog', () => {
  return function MockDisclaimerDialog({ showDialog, handleClose }: any) {
    return showDialog ? (
      <div data-testid="disclaimer-dialog">
        <button onClick={handleClose}>Close Disclaimer</button>
      </div>
    ) : null;
  };
});

// Mock storage utilities
jest.mock('../../util/storage');
jest.mock('../../store/plannerDataReducer', () => ({
  ...jest.requireActual('../../store/plannerDataReducer'),
  getInitialData: jest.fn(),
  persistPlannerData: jest.fn(),
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Default: no goals
    (reducer.getInitialData as jest.Mock).mockReturnValue({
      financialGoals: [],
      investmentAllocations: {},
    });
  });

  it('should render LandingPage when no goals exist', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(true);
    (reducer.getInitialData as jest.Mock).mockReturnValue({
      financialGoals: [],
      investmentAllocations: {},
    });
    render(<Home />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('should render Planner when goals exist', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(true);
    // Mock initial data with goals
    (reducer.getInitialData as jest.Mock).mockReturnValue({
      financialGoals: [
        {
          name: 'Retirement',
          targetAmount: 1000000,
          targetDate: '2040-01-01',
          inflationRate: 6,
        },
      ],
      investmentAllocations: {
        'Short Term': [],
        'Mid Term': [],
        'Long Term': [],
      },
    });
    render(<Home />);
    expect(screen.getByTestId('planner-page')).toBeInTheDocument();
  });

  it('should show disclaimer banner when not accepted', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(false);
    render(<Home />);
    expect(
      screen.getByText(/This tool provides investment suggestions/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('should hide disclaimer banner when accepted', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(true);
    render(<Home />);
    expect(
      screen.queryByText(/This tool provides investment suggestions/i),
    ).not.toBeInTheDocument();
  });

  it('should call setDisclaimerAccepted when Accept button clicked', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(false);
    const mockSetDisclaimer = jest.fn();
    (storage.setDisclaimerAccepted as jest.Mock).mockImplementation(
      mockSetDisclaimer,
    );

    render(<Home />);
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    expect(mockSetDisclaimer).toHaveBeenCalledTimes(1);
  });

  it('should open disclaimer dialog when link clicked', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(false);
    render(<Home />);

    const disclaimerLink = screen.getByText('disclaimer');
    fireEvent.click(disclaimerLink);

    expect(screen.getByTestId('disclaimer-dialog')).toBeInTheDocument();
  });

  it('should match snapshot with no goals', () => {
    (storage.isDisclaimerAccepted as jest.Mock).mockReturnValue(true);
    const { container } = render(<Home />);
    expect(container).toMatchSnapshot();
  });
});
