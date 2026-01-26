import React from 'react';
import { render } from '@testing-library/react';
import LandingPage from './index';

// Mock the AddGoalPopup component to avoid testing its internals
jest.mock('../Home/components/AddGoalPopup', () => {
  return function MockAddGoalPopup() {
    return <div data-testid="add-goal-popup">Add Goal Popup</div>;
  };
});

// Mock image imports to avoid path issues in tests
jest.mock('../../assets/image1.png', () => 'image1.png');
jest.mock('../../assets/image2.png', () => 'image2.png');
jest.mock('../../assets/image3.png', () => 'image3.png');
jest.mock('../../assets/image4.png', () => 'image4.png');
jest.mock('../../assets/icon.png', () => 'icon.png');

describe('LandingPage', () => {
  const mockDispatch = jest.fn();

  it('should render main heading', () => {
    const { getByText } = render(<LandingPage dispatch={mockDispatch} />);

    expect(getByText(/Plan your Financial Goals/i)).toBeInTheDocument();
  });

  it('should render call-to-action button', () => {
    const { getByRole } = render(<LandingPage dispatch={mockDispatch} />);

    const button = getByRole('button', { name: /ADD GOAL/i });
    expect(button).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    const { getByText } = render(<LandingPage dispatch={mockDispatch} />);

    expect(getByText(/Start by adding your first Goal/i)).toBeInTheDocument();
  });

  it('should match snapshot of main content structure', () => {
    const { container } = render(<LandingPage dispatch={mockDispatch} />);

    // Snapshot only the main content box to keep it stable
    const mainContent = container.querySelector('[role="main"]') || container.firstChild;
    expect(mainContent).toMatchSnapshot();
  });
});
