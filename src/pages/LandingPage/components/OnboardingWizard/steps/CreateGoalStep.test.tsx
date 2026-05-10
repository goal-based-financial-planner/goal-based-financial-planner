import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateGoalStep from './CreateGoalStep';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

vi.mock('../../../../Home/components/FinancialGoalForm', () => ({
  default: ({ title }: { title?: string }) => (
    <div data-testid="financial-goal-form">{title}</div>
  ),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
);

describe('CreateGoalStep', () => {
  const defaultProps = {
    dispatch: vi.fn(),
    onComplete: vi.fn(),
  };

  it('renders the heading', () => {
    render(<CreateGoalStep {...defaultProps} />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Add your first goal' })).toBeInTheDocument();
  });

  it('renders the helper text', () => {
    render(<CreateGoalStep {...defaultProps} />, { wrapper });
    expect(screen.getByText(/You can add more goals later/i)).toBeInTheDocument();
  });

  it('renders FinancialGoalForm with correct title', () => {
    render(<CreateGoalStep {...defaultProps} />, { wrapper });
    expect(screen.getByTestId('financial-goal-form')).toBeInTheDocument();
    expect(screen.getByTestId('financial-goal-form')).toHaveTextContent('Add your first goal');
  });
});
