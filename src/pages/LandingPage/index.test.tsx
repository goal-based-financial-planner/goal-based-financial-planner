import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from './index';

// Mock the AddGoalPopup component to avoid testing its internals
vi.mock('../Home/components/AddGoalPopup', () => ({
  default: function MockAddGoalPopup() {
    return <div data-testid="add-goal-popup">Add Goal Popup</div>;
  },
}));

// Mock image imports to avoid path issues in tests
vi.mock('../../assets/image1.png', () => ({ default: 'image1.png' }));
vi.mock('../../assets/image2.png', () => ({ default: 'image2.png' }));
vi.mock('../../assets/image3.png', () => ({ default: 'image3.png' }));
vi.mock('../../assets/image4.png', () => ({ default: 'image4.png' }));
vi.mock('../../assets/icon.png', () => ({ default: 'icon.png' }));

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
