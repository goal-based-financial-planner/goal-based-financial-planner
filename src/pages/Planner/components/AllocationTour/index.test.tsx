import { render } from '@testing-library/react';
import AllocationTour from './index';

// ---- types for the mock ----
type DriverOptions = {
  showProgress?: boolean;
  steps?: { element: string; popover: { description: string } }[];
  onDestroyStarted?: () => void;
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

describe('AllocationTour', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    lastInstance = null;
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders null — no DOM output', () => {
    const { container } = render(<AllocationTour run={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not create a driver instance when run=false', () => {
    render(<AllocationTour run={false} />);
    vi.runAllTimers();
    expect(lastInstance).toBeNull();
  });

  it('creates a driver instance and calls drive() after delay when run=true', () => {
    render(<AllocationTour run={true} />);
    expect(lastInstance).not.toBeNull();
    expect(lastInstance!.drive).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(lastInstance!.drive).toHaveBeenCalledTimes(1);
  });

  it('has 4 steps covering the allocation modal elements', () => {
    render(<AllocationTour run={true} />);
    expect(lastInstance!.stepCount).toBe(4);
  });

  it('calls onDone when tour is closed by user', () => {
    const onDone = vi.fn();
    render(<AllocationTour run={true} onDone={onDone} />);
    vi.runAllTimers();
    lastInstance!.simulateClose();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not call onDone twice (double-close guard)', () => {
    const onDone = vi.fn();
    render(<AllocationTour run={true} onDone={onDone} />);
    vi.runAllTimers();
    lastInstance!.simulateClose();
    lastInstance!.simulateClose();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('cleans up and destroys driver on unmount', () => {
    const { unmount } = render(<AllocationTour run={true} />);
    unmount();
    expect(lastInstance!.destroy).toHaveBeenCalled();
  });

  it('does not call drive() after unmount (timer cancelled)', () => {
    const { unmount } = render(<AllocationTour run={true} />);
    unmount();
    vi.runAllTimers();
    expect(lastInstance!.drive).not.toHaveBeenCalled();
  });
});
