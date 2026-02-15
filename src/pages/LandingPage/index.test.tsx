import React from 'react';
import { render, screen } from '@testing-library/react';
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
    render(<LandingPage dispatch={mockDispatch} />);

    expect(screen.getByText(/Plan your Financial Goals/i)).toBeInTheDocument();
  });

  it('should render call-to-action button', () => {
    render(<LandingPage dispatch={mockDispatch} />);

    const button = screen.getByRole('button', { name: /ADD GOAL/i });
    expect(button).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<LandingPage dispatch={mockDispatch} />);

    expect(screen.getByText(/Start by adding your first Goal/i)).toBeInTheDocument();
  });

  it('should match snapshot of main content structure', () => {
    const { container } = render(<LandingPage dispatch={mockDispatch} />);

    // Snapshot the entire container
    expect(container).toMatchSnapshot();
  });
});
