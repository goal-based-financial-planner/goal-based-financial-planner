import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import OnboardingWizard from './index';

vi.mock('./steps/WelcomeStep', () => ({ default: () => <div>WelcomeStep</div> }));
vi.mock('./steps/ConceptsStep', () => ({ default: () => <div>ConceptsStep</div> }));
vi.mock('./steps/StoragePickerStep', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div>
      StoragePickerStep
      <button onClick={onComplete}>storage-done</button>
    </div>
  ),
}));
vi.mock('./steps/CreateGoalStep', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div>
      CreateGoalStep
      <button onClick={onComplete}>goal-done</button>
    </div>
  ),
}));

vi.mock('../../../../util/storage', () => ({
  fsaSupported: true,
  StorageProviderId: {},
}));

const theme = createTheme();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const defaultProps = {
  initProvider: vi.fn().mockResolvedValue(null),
  dispatch: vi.fn(),
  onComplete: vi.fn(),
  onNewPlanCreated: vi.fn(),
};

describe('OnboardingWizard shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders WelcomeStep on step 1', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    expect(screen.getByText('WelcomeStep')).toBeInTheDocument();
  });

  it('shows "Step 1 of 4" initially', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  it('Skip button is visible on step 1', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('Back button is not accessible on step 1', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('Next advances to step 2 (ConceptsStep)', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('ConceptsStep')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
  });

  it('Back returns from step 2 to step 1', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('WelcomeStep')).toBeInTheDocument();
  });

  it('step 3 shows StoragePickerStep and no Next button', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('StoragePickerStep')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('completing storage step advances to CreateGoalStep (step 4)', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByText('storage-done'));
    expect(screen.getByText('CreateGoalStep')).toBeInTheDocument();
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
  });

  it('completing goal creation calls onNewPlanCreated', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByText('storage-done'));
    fireEvent.click(screen.getByText('goal-done'));
    expect(defaultProps.onNewPlanCreated).toHaveBeenCalledTimes(1);
    expect(defaultProps.onComplete).not.toHaveBeenCalled();
  });

  it('Skip button calls onComplete (not onNewPlanCreated)', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(defaultProps.onComplete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onNewPlanCreated).not.toHaveBeenCalled();
  });

  it('progress bar reflects current step', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    const progressBar = document.querySelector('[role="progressbar"]');
    // Step 1 of 4 → (0/3)*100 = 0%
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 2 of 4 → (1/3)*100 ≈ 33%
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
  });

  it('does not include PathChoiceStep or "Open existing plan" option', () => {
    render(<OnboardingWizard {...defaultProps} />, { wrapper });
    // Navigate through all steps
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.queryByText(/Open existing plan/i)).not.toBeInTheDocument();
    expect(screen.queryByText('PathChoiceStep')).not.toBeInTheDocument();
  });
});
