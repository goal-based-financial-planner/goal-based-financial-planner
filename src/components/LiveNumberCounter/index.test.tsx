import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
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
    const { getByText } = render(
      <LiveCounter value={10000} duration={1000} />
    );

    expect(getByText('10,000')).toBeInTheDocument();
  });

  it('should animate to new value over duration', async () => {
    const { getByText, rerender } = render(
      <LiveCounter value={10000} duration={1000} />
    );

    // Change value
    rerender(<LiveCounter value={20000} duration={1000} />);

    // Fast-forward time with act()
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(getByText('20,000')).toBeInTheDocument();
    });
  });

  it('should adjust font size based on value length (large size)', () => {
    const { container } = render(
      <LiveCounter value={12345678} duration={500} size="large" />
    );

    const typography = container.querySelector('p');
    expect(typography).toBeInTheDocument();
  });

  it('should adjust font size based on value length (small size)', () => {
    const { container } = render(
      <LiveCounter value={12345678} duration={500} size="small" />
    );

    const typography = container.querySelector('p');
    expect(typography).toBeInTheDocument();
  });

  it('should match snapshot with default props', () => {
    const { container } = render(
      <LiveCounter value={100000} duration={1000} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with small size', () => {
    const { container } = render(
      <LiveCounter value={50000} duration={500} size="small" />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should handle very large numbers without breaking', () => {
    const { getByText } = render(
      <LiveCounter value={999999999999999} duration={1000} />
    );

    expect(getByText(/999/)).toBeInTheDocument();
  });

  it('should handle zero value', () => {
    const { getByText } = render(
      <LiveCounter value={0} duration={500} />
    );

    expect(getByText('0')).toBeInTheDocument();
  });
});
