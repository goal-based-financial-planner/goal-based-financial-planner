import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveStatusIndicator from './index';

describe('SaveStatusIndicator', () => {
  const onRetry = vi.fn();

  afterEach(() => vi.clearAllMocks());

  describe('idle state', () => {
    it('renders provider icon only when never saved (no lastSavedAt)', () => {
      const { container } = render(
        <SaveStatusIndicator saveStatus="idle" lastSavedAt={null} providerId="local-file" />,
      );
      expect(container.firstChild).not.toBeNull();
      expect(screen.queryByText(/All changes saved/i)).not.toBeInTheDocument();
    });

    it('renders "All changes saved" after a successful save', () => {
      render(
        <SaveStatusIndicator saveStatus="idle" lastSavedAt={new Date()} providerId="local-file" />,
      );
      expect(screen.getByText(/All changes saved/i)).toBeInTheDocument();
    });

    it('renders provider icon for google-drive', () => {
      const { container } = render(
        <SaveStatusIndicator saveStatus="idle" lastSavedAt={null} providerId="google-drive" />,
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('saving state', () => {
    it('shows saving text for local-file', () => {
      render(
        <SaveStatusIndicator saveStatus="saving" lastSavedAt={null} providerId="local-file" />,
      );
      expect(screen.getByText(/Saving to Local Computer/i)).toBeInTheDocument();
    });

    it('shows saving text for google-drive', () => {
      render(
        <SaveStatusIndicator saveStatus="saving" lastSavedAt={null} providerId="google-drive" />,
      );
      expect(screen.getByText(/Saving to Google Drive/i)).toBeInTheDocument();
    });
  });

  describe('saved state', () => {
    it('shows saved text for local-file', () => {
      render(
        <SaveStatusIndicator saveStatus="saved" lastSavedAt={new Date()} providerId="local-file" />,
      );
      expect(screen.getByText(/Saved to Local Computer/i)).toBeInTheDocument();
    });

    it('shows saved text for google-drive', () => {
      render(
        <SaveStatusIndicator saveStatus="saved" lastSavedAt={null} providerId="google-drive" />,
      );
      expect(screen.getByText(/Saved to Google Drive/i)).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error chip with retry text for local-file', () => {
      render(
        <SaveStatusIndicator saveStatus="error" lastSavedAt={null} providerId="local-file" onRetry={onRetry} />,
      );
      expect(screen.getByText(/Save to Local Computer failed/i)).toBeInTheDocument();
    });

    it('calls onRetry when error chip is clicked', () => {
      render(
        <SaveStatusIndicator saveStatus="error" lastSavedAt={null} providerId="google-drive" onRetry={onRetry} />,
      );
      fireEvent.click(screen.getByText(/Save to Google Drive failed/i));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
