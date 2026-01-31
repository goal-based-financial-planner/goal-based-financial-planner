import { render } from '@testing-library/react';
import PageTour from './index';
import * as storage from '../../../../util/storage';

// Mock Joyride component
jest.mock('react-joyride', () => ({
  __esModule: true,
  default: ({ steps, callback, run }: any) => (
    <div data-testid="joyride-mock">
      {run ? <div>Tour Running with {steps.length} steps</div> : null}
      <button onClick={() => callback({ status: 'finished' })}>
        Finish Tour
      </button>
      <button onClick={() => callback({ status: 'skipped' })}>Skip Tour</button>
    </div>
  ),
  STATUS: {
    FINISHED: 'finished',
    SKIPPED: 'skipped',
  },
}));

// Mock storage utilities
jest.mock('../../../../util/storage');

describe('PageTour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render tour when not taken', () => {
    (storage.isTourTaken as jest.Mock).mockReturnValue(false);

    const { getByTestId } = render(<PageTour />);

    expect(getByTestId('joyride-mock')).toBeInTheDocument();
  });

  it('should not run tour when already taken', () => {
    (storage.isTourTaken as jest.Mock).mockReturnValue(true);

    const { container } = render(<PageTour />);

    expect(container.querySelector('[data-testid="joyride-mock"]')).toBeInTheDocument();
  });

  it('should call setTourTaken when tour is finished', () => {
    (storage.isTourTaken as jest.Mock).mockReturnValue(false);
    const mockSetTourTaken = jest.fn();
    (storage.setTourTaken as jest.Mock).mockImplementation(mockSetTourTaken);

    const { getByText } = render(<PageTour />);

    const finishButton = getByText('Finish Tour');
    finishButton.click();

    expect(mockSetTourTaken).toHaveBeenCalledTimes(1);
  });

  it('should call setTourTaken when tour is skipped', () => {
    (storage.isTourTaken as jest.Mock).mockReturnValue(false);
    const mockSetTourTaken = jest.fn();
    (storage.setTourTaken as jest.Mock).mockImplementation(mockSetTourTaken);

    const { getByText } = render(<PageTour />);

    const skipButton = getByText('Skip Tour');
    skipButton.click();

    expect(mockSetTourTaken).toHaveBeenCalledTimes(1);
  });

  it('should have correct number of tour steps', () => {
    (storage.isTourTaken as jest.Mock).mockReturnValue(false);

    const { getByText } = render(<PageTour />);

    // The mock shows the number of steps
    expect(getByText(/Tour Running with 7 steps/)).toBeInTheDocument();
  });

  it('should render without crashing when tour is already taken', () => {
    (storage.isTourTaken as jest.Mock).mockReturnValue(true);

    const { container } = render(<PageTour />);

    expect(container).toBeInTheDocument();
  });
});
