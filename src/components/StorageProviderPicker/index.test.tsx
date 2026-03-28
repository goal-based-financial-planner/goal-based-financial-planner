import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StorageProviderPicker from './index';

const defaultProps = {
  open: true,
  mode: 'new' as const,
  onSelect: vi.fn(),
  onCancel: vi.fn(),
};

describe('StorageProviderPicker', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('does not render when open is false', () => {
    render(<StorageProviderPicker {...defaultProps} open={false} />);
    expect(screen.queryByText('Local Computer')).not.toBeInTheDocument();
  });

  it('renders "New Plan" title when mode is new', () => {
    render(<StorageProviderPicker {...defaultProps} mode="new" />);
    expect(screen.getByText(/New Plan — Choose Storage Location/i)).toBeInTheDocument();
  });

  it('renders "Open Plan" title when mode is open', () => {
    render(<StorageProviderPicker {...defaultProps} mode="open" />);
    expect(screen.getByText(/Open Plan — Choose Storage Location/i)).toBeInTheDocument();
  });

  it('renders both storage options', () => {
    render(<StorageProviderPicker {...defaultProps} />);
    expect(screen.getByText('Local Computer')).toBeInTheDocument();
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
  });

  it('calls onSelect with "local-file" when Local Computer is clicked', () => {
    render(<StorageProviderPicker {...defaultProps} />);
    fireEvent.click(screen.getByText('Local Computer'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('local-file');
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(<StorageProviderPicker {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  describe('when VITE_GOOGLE_CLIENT_ID is not set', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    });

    it('shows the not-configured message', () => {
      render(<StorageProviderPicker {...defaultProps} />);
      expect(screen.getByText(/Not configured/i)).toBeInTheDocument();
    });

    it('does not call onSelect when the disabled Drive card is clicked', () => {
      render(<StorageProviderPicker {...defaultProps} />);
      fireEvent.click(screen.getByText('Google Drive'));
      expect(defaultProps.onSelect).not.toHaveBeenCalledWith('google-drive');
    });
  });

  describe('when VITE_GOOGLE_CLIENT_ID is set', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id.apps.googleusercontent.com');
    });

    it('shows autosave description', () => {
      render(<StorageProviderPicker {...defaultProps} />);
      expect(screen.getByText(/Autosave to your Google Drive/i)).toBeInTheDocument();
    });

    it('calls onSelect with "google-drive" when the card is clicked', () => {
      render(<StorageProviderPicker {...defaultProps} />);
      fireEvent.click(screen.getByText('Google Drive'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith('google-drive');
    });
  });
});
