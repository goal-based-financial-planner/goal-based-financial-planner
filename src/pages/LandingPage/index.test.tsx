import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from './index';

// Mock the AddGoalPopup component to avoid testing its internals
vi.mock('../Home/components/AddGoalPopup', () => ({
  default: function MockAddGoalPopup() {
    return <div data-testid="add-goal-popup">Add Goal Popup</div>;
  },
}));

// Mock StorageProviderPicker
vi.mock('../../components/StorageProviderPicker', () => ({
  default: function MockStorageProviderPicker() {
    return null;
  },
}));

// Mock image imports to avoid path issues in tests
vi.mock('../../assets/image1.png', () => ({ default: 'image1.png' }));
vi.mock('../../assets/image2.png', () => ({ default: 'image2.png' }));
vi.mock('../../assets/image3.png', () => ({ default: 'image3.png' }));
vi.mock('../../assets/image4.png', () => ({ default: 'image4.png' }));
vi.mock('../../assets/icon.png', () => ({ default: 'icon.png' }));

describe('LandingPage', () => {
  const mockDispatch = vi.fn();
  const defaultProps = {
    dispatch: mockDispatch,
    clearProvider: vi.fn().mockResolvedValue(undefined),
    initProvider: vi.fn().mockResolvedValue(null),
    driveFiles: [],
    selectDriveFile: vi.fn().mockResolvedValue(null),
    deleteDriveFile: vi.fn().mockResolvedValue(undefined),
  };

  it('should render main heading', () => {
    render(<LandingPage {...defaultProps} />);

    expect(screen.getByText(/Plan your Financial Goals/i)).toBeInTheDocument();
  });

  it('should render call-to-action button', () => {
    render(<LandingPage {...defaultProps} />);

    const button = screen.getByRole('button', { name: /NEW PLAN/i });
    expect(button).toBeInTheDocument();
  });

  it('should render "Open existing plan" link', () => {
    render(<LandingPage {...defaultProps} />);

    expect(screen.getByText(/Open existing plan/i)).toBeInTheDocument();
  });

  it('should show drive file list when driveFiles is non-empty', () => {
    const driveFiles = [
      { id: 'file-1', name: 'My Plan', modifiedTime: '2026-01-01T00:00:00Z' },
    ];
    render(<LandingPage {...defaultProps} driveFiles={driveFiles} />);

    expect(screen.getByText(/Select a plan to open/i)).toBeInTheDocument();
    expect(screen.getByText('My Plan')).toBeInTheDocument();
  });

  it('should match snapshot of main content structure', () => {
    const { container } = render(<LandingPage {...defaultProps} />);

    // Snapshot the entire container
    expect(container).toMatchSnapshot();
  });
});
