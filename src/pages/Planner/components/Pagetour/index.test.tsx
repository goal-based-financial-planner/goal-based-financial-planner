import { render, act } from '@testing-library/react';
import PageTour from './index';

type DriverOptions = {
  steps: { element: string; popover: { description: string } }[];
  onDestroyStarted?: () => void;
  showProgress?: boolean;
};

type MockInstance = {
  drive: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  simulateClose: () => void;
  stepCount: number;
};

let lastInstance: MockInstance | null = null;

vi.mock('driver.js', () => ({
  driver: (options: DriverOptions) => {
    const instance: MockInstance = {
      drive: vi.fn(),
      destroy: vi.fn(),
      simulateClose: () => options.onDestroyStarted?.(),
      stepCount: options.steps?.length ?? 0,
    };
    lastInstance = instance;
    return instance;
  },
}));

vi.mock('driver.js/dist/driver.css', () => ({}));

beforeEach(() => {
  vi.useFakeTimers();
  lastInstance = null;
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PageTour', () => {
  it('calls drive() when run=true after delay', () => {
    render(<PageTour run={true} />);
    expect(lastInstance).not.toBeNull();
    expect(lastInstance!.drive).not.toHaveBeenCalled();
    act(() => {
      vi.runAllTimers();
    });
    expect(lastInstance!.drive).toHaveBeenCalledTimes(1);
  });

  it('does not create a driver instance when run=false', () => {
    render(<PageTour run={false} />);
    act(() => {
      vi.runAllTimers();
    });
    expect(lastInstance).toBeNull();
  });

  it('calls onDone when tour is closed', () => {
    const onDone = vi.fn();
    render(<PageTour run={true} onDone={onDone} />);
    act(() => {
      vi.runAllTimers();
    });
    act(() => {
      lastInstance!.simulateClose();
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not call onDone again if closed twice', () => {
    const onDone = vi.fn();
    render(<PageTour run={true} onDone={onDone} />);
    act(() => {
      vi.runAllTimers();
    });
    act(() => {
      lastInstance!.simulateClose();
      lastInstance!.simulateClose();
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('shows all 7 steps on desktop', () => {
    render(<PageTour run={true} />);
    act(() => {
      vi.runAllTimers();
    });
    expect(lastInstance!.stepCount).toBe(7);
  });

  it('shows 6 steps on mobile (desktop-only goal box step excluded)', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 400,
      writable: true,
      configurable: true,
    });
    render(<PageTour run={true} />);
    act(() => {
      vi.runAllTimers();
    });
    expect(lastInstance!.stepCount).toBe(6);
  });
});
