import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from './index';
import type { PlannerData } from '../../domain/PlannerData';

vi.mock('../Home/components/AddGoalPopup', () => ({
  default: function MockAddGoalPopup({ isOpen }: { isOpen: boolean }) {
    return isOpen ? <div data-testid="add-goal-popup">Add Goal Popup</div> : null;
  },
}));

vi.mock('../../components/StorageProviderPicker', () => ({
  default: function MockStorageProviderPicker({ open, onSelect }: { open: boolean; onSelect: (type: string) => void }) {
    if (!open) return null;
    return (
      <button data-testid="select-local-storage" onClick={() => onSelect('local-file')}>
        Select Local File
      </button>
    );
  },
}));

vi.mock('./components/OnboardingWizard', () => ({
  default: function MockOnboardingWizard() {
    return <div data-testid="onboarding-wizard">Wizard</div>;
  },
}));

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

  it('renders main heading', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/Plan your Financial Goals/i)).toBeInTheDocument();
  });

  it('renders NEW PLAN button', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByRole('button', { name: /NEW PLAN/i })).toBeInTheDocument();
  });

  it('renders Open existing plan link', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/Open existing plan/i)).toBeInTheDocument();
  });

  it('shows drive file list when driveFiles is non-empty', () => {
    const driveFiles = [
      { id: 'file-1', name: 'My Plan', modifiedTime: '2026-01-01T00:00:00Z' },
    ];
    render(<LandingPage {...defaultProps} driveFiles={driveFiles} />);
    expect(screen.getByText(/Select a plan to open/i)).toBeInTheDocument();
    expect(screen.getByText('My Plan')).toBeInTheDocument();
  });

  describe('_doInitProvider', () => {
    it('does not open AddGoalPopup when initProvider returns null (user cancelled)', async () => {
      const initProvider = vi.fn().mockResolvedValue(null);
      render(<LandingPage {...defaultProps} initProvider={initProvider} />);

      await userEvent.click(screen.getByText(/Open existing plan/i));
      await userEvent.click(screen.getByTestId('select-local-storage'));

      await waitFor(() => expect(initProvider).toHaveBeenCalled());
      expect(screen.queryByTestId('add-goal-popup')).not.toBeInTheDocument();
    });

    it('does not open AddGoalPopup when opened file already has goals', async () => {
      const mockDataWithGoals = {
        financialGoals: [{ id: 'g1' }],
        investmentLogs: [],
      } as unknown as PlannerData;
      const initProvider = vi.fn().mockResolvedValue(mockDataWithGoals);
      render(<LandingPage {...defaultProps} initProvider={initProvider} />);

      await userEvent.click(screen.getByText(/Open existing plan/i));
      await userEvent.click(screen.getByTestId('select-local-storage'));

      await waitFor(() => expect(initProvider).toHaveBeenCalled());
      expect(screen.queryByTestId('add-goal-popup')).not.toBeInTheDocument();
    });

    it('opens AddGoalPopup when opened file has no goals', async () => {
      const mockDataNoGoals = {
        financialGoals: [],
        investmentLogs: [],
      } as unknown as PlannerData;
      const initProvider = vi.fn().mockResolvedValue(mockDataNoGoals);
      render(<LandingPage {...defaultProps} initProvider={initProvider} />);

      await userEvent.click(screen.getByText(/Open existing plan/i));
      await userEvent.click(screen.getByTestId('select-local-storage'));

      await waitFor(() =>
        expect(screen.getByTestId('add-goal-popup')).toBeInTheDocument(),
      );
    });
  });
});
