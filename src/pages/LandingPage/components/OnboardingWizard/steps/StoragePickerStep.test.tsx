import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoragePickerStep from './StoragePickerStep';
import { ThemeProvider, createTheme } from '@mui/material';

vi.mock('../../../../../components/GoogleDriveIcon', () => ({
  default: () => <svg data-testid="drive-icon" />,
}));

// Mock fsaSupported — expose as true so Local Computer card renders
vi.mock('../../../../../util/storage', () => ({
  fsaSupported: true,
  StorageProviderId: {},
}));

const theme = createTheme();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const defaultProps = {
  initProvider: vi.fn().mockResolvedValue(null),
  onComplete: vi.fn(),
  onProviderChange: vi.fn(),
};

describe('StoragePickerStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading', () => {
    render(<StoragePickerStep {...defaultProps} />, { wrapper });
    expect(screen.getByText(/Where would you like to save/i)).toBeInTheDocument();
  });

  it('renders Google Drive option', () => {
    render(<StoragePickerStep {...defaultProps} />, { wrapper });
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
  });

  it('shows drive name input when Google Drive is selected', async () => {
    const googleClientId = 'test-client-id';
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', googleClientId);

    render(<StoragePickerStep {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByText('Google Drive'));

    await waitFor(() => {
      expect(screen.getByText('Name your plan')).toBeInTheDocument();
    });

    vi.unstubAllEnvs();
  });

  it('shows loading spinner while initProvider is running', async () => {
    const initProvider = vi.fn(() => new Promise(() => {})); // never resolves
    render(<StoragePickerStep {...defaultProps} initProvider={initProvider} />, { wrapper });

    fireEvent.click(screen.getByText('Local Computer'));

    await waitFor(() => {
      expect(screen.getByText(/Setting up your plan/i)).toBeInTheDocument();
    });
  });

  it('shows error message when initProvider throws', async () => {
    const initProvider = vi.fn().mockRejectedValue(new Error('Storage failed'));
    render(<StoragePickerStep {...defaultProps} initProvider={initProvider} />, { wrapper });

    fireEvent.click(screen.getByText('Local Computer'));

    await waitFor(() => {
      expect(screen.getByText(/Storage failed/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete after successful initProvider', async () => {
    const onComplete = vi.fn();
    const initProvider = vi.fn().mockResolvedValue(null);
    render(<StoragePickerStep {...defaultProps} initProvider={initProvider} onComplete={onComplete} />, { wrapper });

    fireEvent.click(screen.getByText('Local Computer'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('back button in drive name form returns to storage picker', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-id');
    render(<StoragePickerStep {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByText('Google Drive'));
    await waitFor(() => expect(screen.getByText('Name your plan')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    await waitFor(() => expect(screen.getByText(/Where would you like to save/i)).toBeInTheDocument());

    vi.unstubAllEnvs();
  });

  it('initialises with Google Drive name form when initialProvider is google-drive', () => {
    render(
      <StoragePickerStep {...defaultProps} initialProvider="google-drive" initialPlanName="My Plan" />,
      { wrapper },
    );
    expect(screen.getByText('Name your plan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Plan')).toBeInTheDocument();
  });
});
