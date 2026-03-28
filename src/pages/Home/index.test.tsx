import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './index';
import * as storage from '../../util/legacyStorage';
import * as reducer from '../../store/plannerDataReducer';
import { PlannerData } from '../../domain/PlannerData';

// Mock child components
vi.mock('../LandingPage', () => ({
  default: function MockLandingPage() {
    return <div data-testid="landing-page">Landing Page</div>;
  },
}));

vi.mock('../Planner', () => ({
  default: function MockPlanner() {
    return <div data-testid="planner-page">Planner Page</div>;
  },
}));

vi.mock('./components/DisclaimerDialog', () => ({
  default: function MockDisclaimerDialog({
    showDialog,
    handleClose,
  }: {
    showDialog: boolean;
    handleClose: () => void;
  }) {
    return showDialog ? (
      <div data-testid="disclaimer-dialog">
        <button onClick={handleClose}>Close Disclaimer</button>
      </div>
    ) : null;
  },
}));

// Mock storage utilities
vi.mock('../../util/legacyStorage');

// Mock StorageProviderContext so Home renders without a real provider
vi.mock('../../context/StorageProviderContext', () => ({
  useStorageProvider: vi.fn(() => ({
    provider: { id: 'local-file', save: vi.fn(), load: vi.fn() },
    saveStatus: 'idle' as const,
    lastSavedAt: null,
    lastError: null,
    initialData: null,
    driveFiles: [],
    selectDriveFile: vi.fn(),
    deleteDriveFile: vi.fn(),
    initProvider: vi.fn(),
    clearProvider: vi.fn(),
    setSaveStatus: vi.fn(),
    setLastSavedAt: vi.fn(),
    setLastError: vi.fn(),
  })),
  StorageProviderContextProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock('../../hooks/useAutosave', () => ({
  useAutosave: vi.fn(() => ({
    saveStatus: 'idle' as const,
    lastSavedAt: null,
    lastError: null,
    triggerManualSave: vi.fn(),
  })),
}));

vi.mock('../../store/plannerDataReducer', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    getInitialData: vi.fn(() => new PlannerData()),
  };
});

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (reducer.getInitialData as ReturnType<typeof vi.fn>).mockReturnValue(
      new PlannerData(),
    );
  });

  it('should render LandingPage when no goals exist', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    );
    render(<Home />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('should render Planner when goals exist', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    );
    const plannerDataWithGoal = { financialGoals: [{}], investmentAllocations: {} } as unknown as PlannerData;
    (reducer.getInitialData as ReturnType<typeof vi.fn>).mockReturnValue(
      plannerDataWithGoal,
    );
    render(<Home />);
    expect(screen.getByTestId('planner-page')).toBeInTheDocument();
  });

  it('should show disclaimer banner when not accepted', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    );
    render(<Home />);
    expect(
      screen.getByText(/This tool provides investment suggestions/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('should hide disclaimer banner when accepted', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    );
    render(<Home />);
    expect(
      screen.queryByText(/This tool provides investment suggestions/i),
    ).not.toBeInTheDocument();
  });

  it('should call setDisclaimerAccepted when Accept button clicked', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    );
    const mockSetDisclaimer = vi.fn();
    (
      storage.setDisclaimerAccepted as ReturnType<typeof vi.fn>
    ).mockImplementation(mockSetDisclaimer);

    render(<Home />);
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    expect(mockSetDisclaimer).toHaveBeenCalledTimes(1);
  });

  it('should open disclaimer dialog when link clicked', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    );
    render(<Home />);

    const disclaimerLink = screen.getByText('disclaimer');
    fireEvent.click(disclaimerLink);

    expect(screen.getByTestId('disclaimer-dialog')).toBeInTheDocument();
  });

  it('should match snapshot with no goals', () => {
    (storage.isDisclaimerAccepted as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    );
    const { container } = render(<Home />);
    expect(container).toMatchSnapshot();
  });
});
