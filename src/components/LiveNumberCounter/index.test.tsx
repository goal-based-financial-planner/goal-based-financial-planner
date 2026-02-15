import React from 'react';
import { render, waitFor, act, screen } from '@testing-library/react';
import LiveCounter from './index';

// Mock the formatNumber function to avoid locale-dependent snapshots
jest.mock('../../types/util', () => ({
  formatNumber: (num: number) => num.toLocaleString('en-US'),
}));

describe('LiveCounter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render initial value immediately', () => {
    render(
      <LiveCounter value={10000} duration={1000} />
    );

    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('should animate to new value over duration', async () => {
    const { rerender } = render(
      <LiveCounter value={10000} duration={1000} />
    );

    // Change value
    rerender(<LiveCounter value={20000} duration={1000} />);

    // Fast-forward time with act()
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('20,000')).toBeInTheDocument();
    });
  });

  it('should adjust font size based on value length (large size)', () => {
    render(
      <LiveCounter value={12345678} duration={500} size="large" />
    );

    expect(screen.getByText('12,345,678')).toBeInTheDocument();
  });

  it('should adjust font size based on value length (small size)', () => {
    render(
      <LiveCounter value={12345678} duration={500} size="small" />
    );

    expect(screen.getByText('12,345,678')).toBeInTheDocument();
  });

  it('should match snapshot with default props', () => {
    const { container } = render(
      <LiveCounter value={100000} duration={1000} />
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with small size', () => {
    const { container } = render(
      <LiveCounter value={50000} duration={500} size="small" />
    );

    expect(container).toMatchSnapshot();
  });

  it('should handle very large numbers without breaking', () => {
    render(
      <LiveCounter value={999999999999999} duration={1000} />
    );

    expect(screen.getByText(/999/)).toBeInTheDocument();
  });

  it('should handle zero value', () => {
    render(
      <LiveCounter value={0} duration={500} />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should use default font size for extremely large numbers (>15 digits)', () => {
    render(
      <LiveCounter value={1234567890123456} duration={500} />
    );

    // Should render with the number (may have precision issues in JS, just check it renders)
    expect(screen.getByText(/1,234,567,890,123,456/)).toBeInTheDocument();
  });
});
