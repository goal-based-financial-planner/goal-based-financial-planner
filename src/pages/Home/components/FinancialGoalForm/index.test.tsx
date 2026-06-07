import React, { forwardRef } from 'react';
import dayjs from 'dayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import FinancialGoalForm from './index';
import * as plannerDataActions from '../../../../store/plannerDataActions';
import { FinancialGoal } from '../../../../domain/FinancialGoals';
import { GoalType } from '../../../../types/enums';

type DatePickerMockProps = {
  slotProps?: { textField?: { label?: string } };
  onChange?: (val: dayjs.Dayjs) => void;
};

vi.mock('../../../../components/DatePicker', () => ({
  default: forwardRef(function MockDatePicker(props: DatePickerMockProps) {
    const label = props.slotProps?.textField?.label ?? '';
    return (
      <input
        aria-label={label}
        data-testid={`datepicker-${label}`}
        onChange={(e) => {
          props.onChange?.(dayjs(e.target.value));
        }}
      />
    );
  }),
}));

// Mock addFinancialGoal and updateFinancialGoal so we can spy on dispatch calls
vi.mock('../../../../store/plannerDataActions', () => ({
  addFinancialGoal: vi.fn(),
  updateFinancialGoal: vi.fn(),
}));

const mockDispatch = vi.fn();
const mockClose = vi.fn();

function renderForm(props: Partial<React.ComponentProps<typeof FinancialGoalForm>> = {}) {
  return render(
    <FinancialGoalForm
      dispatch={mockDispatch}
      close={mockClose}
      embedded
      {...props}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FinancialGoalForm', () => {
  it('renders goal name field and target amount field', () => {
    renderForm();
    expect(screen.getByLabelText(/Goal Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Amount/i)).toBeInTheDocument();
  });

  it('renders One Time and Recurring radio buttons', () => {
    renderForm();
    expect(screen.getByLabelText('One Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Recurring')).toBeInTheDocument();
  });

  it('shows Start Date and Target Date inputs by default (ONE_TIME)', () => {
    renderForm();
    expect(screen.getByTestId('datepicker-Start Date')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker-Target Date')).toBeInTheDocument();
  });

  it('selecting Recurring hides date inputs and shows Duration section', () => {
    renderForm();
    fireEvent.click(screen.getByLabelText('Recurring'));
    expect(screen.queryByTestId('datepicker-Start Date')).not.toBeInTheDocument();
    expect(screen.queryByTestId('datepicker-Target Date')).not.toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByLabelText('1 year')).toBeInTheDocument();
    expect(screen.getByLabelText('2 years')).toBeInTheDocument();
    expect(screen.getByLabelText('3 years')).toBeInTheDocument();
  });

  it('switching back to One Time shows date inputs again', () => {
    renderForm();
    fireEvent.click(screen.getByLabelText('Recurring'));
    fireEvent.click(screen.getByLabelText('One Time'));
    expect(screen.getByTestId('datepicker-Start Date')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker-Target Date')).toBeInTheDocument();
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('submit with empty form does not call close or dispatch', () => {
    renderForm();
    fireEvent.click(screen.getByText('check'));
    expect(mockClose).not.toHaveBeenCalled();
    expect(plannerDataActions.addFinancialGoal).not.toHaveBeenCalled();
  });

  it('submit with special-char-only goal name does not call close', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Goal Name/i), { target: { value: '@#$' } });
    fireEvent.change(screen.getByLabelText(/Target Amount/i), { target: { value: '100000' } });
    fireEvent.click(screen.getByText('check'));
    expect(mockClose).not.toHaveBeenCalled();
    expect(plannerDataActions.addFinancialGoal).not.toHaveBeenCalled();
  });

  it('submit with non-numeric amount does not call close', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Goal Name/i), { target: { value: 'Education' } });
    fireEvent.change(screen.getByLabelText(/Target Amount/i), { target: { value: 'abc' } });
    // Provide valid dates
    fireEvent.change(screen.getByTestId('datepicker-Start Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByTestId('datepicker-Target Date'), { target: { value: '2029-01-01' } });
    fireEvent.click(screen.getByText('check'));
    expect(mockClose).not.toHaveBeenCalled();
    expect(plannerDataActions.addFinancialGoal).not.toHaveBeenCalled();
  });

  it('valid ONE_TIME submission calls dispatch and close', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Goal Name/i), { target: { value: 'Education' } });
    fireEvent.change(screen.getByLabelText(/Target Amount/i), { target: { value: '100000' } });
    fireEvent.change(screen.getByTestId('datepicker-Start Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByTestId('datepicker-Target Date'), { target: { value: '2029-01-01' } });
    fireEvent.click(screen.getByText('check'));
    expect(plannerDataActions.addFinancialGoal).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('valid RECURRING submission calls dispatch and close', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Goal Name/i), { target: { value: 'Vacation' } });
    fireEvent.change(screen.getByLabelText(/Target Amount/i), { target: { value: '50000' } });
    fireEvent.click(screen.getByLabelText('Recurring'));
    fireEvent.click(screen.getByText('check'));
    expect(plannerDataActions.addFinancialGoal).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('selecting "2 years" duration changes state without error', () => {
    renderForm();
    fireEvent.click(screen.getByLabelText('Recurring'));
    const twoYears = screen.getByLabelText('2 years');
    fireEvent.click(twoYears);
    expect((twoYears as HTMLInputElement).checked).toBe(true);
  });

  it('embedded mode renders card without fixed-position backdrop', () => {
    const { container } = renderForm({ embedded: true });
    // Should not have a StyledBackdrop (fixed overlay) — check no child with fixed position wrapper
    // The card itself should be the outermost meaningful element, not the backdrop div
    const firstChild = container.firstChild as HTMLElement;
    expect(firstChild).not.toBeNull();
    // A MUI Card renders as a Paper which has data-mui-* or just normal div structure
    // Crucially, no element should match the backdrop overlay pattern (it would have style with position:fixed)
    const backdropEl = container.querySelector('[style*="position: fixed"]');
    expect(backdropEl).toBeNull();
  });

  it('non-embedded mode: backdrop click calls close', () => {
    const { container } = render(
      <FinancialGoalForm dispatch={mockDispatch} close={mockClose} />,
    );
    // The StyledBackdrop is the first child — clicking it calls close
    const backdrop = container.firstChild as HTMLElement;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('renders title text and subtitle when title prop is provided', () => {
    renderForm({ title: 'Welcome' });
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your first financial goal to get started.'),
    ).toBeInTheDocument();
  });

  it('does not render subtitle when title prop is omitted', () => {
    renderForm();
    expect(
      screen.queryByText('Enter your first financial goal to get started.'),
    ).not.toBeInTheDocument();
  });
});

describe('Edit mode (initialGoal provided)', () => {
  function makeEditGoal(inflationRate?: number): FinancialGoal {
    const goal = new FinancialGoal(
      'Education',
      GoalType.ONE_TIME,
      '2024-01-01',
      '2030-01-01',
      500000,
      undefined,
      inflationRate,
    );
    goal.id = 'goal-edit-id';
    return goal;
  }

  it('pre-fills goal name field', () => {
    const goal = makeEditGoal();
    renderForm({ initialGoal: goal });
    expect(screen.getByLabelText(/Goal Name/i)).toHaveValue('Education');
  });

  it('pre-fills target amount field', () => {
    const goal = makeEditGoal();
    renderForm({ initialGoal: goal });
    expect(screen.getByLabelText(/Target Amount/i)).toHaveValue('500000');
  });

  it('pre-fills inflation rate field with goal inflation rate', () => {
    const goal = makeEditGoal(8);
    renderForm({ initialGoal: goal });
    expect(screen.getByLabelText(/Inflation/i)).toHaveValue(8);
  });

  it('goal type radio buttons are disabled', () => {
    const goal = makeEditGoal();
    renderForm({ initialGoal: goal });
    expect(screen.getByLabelText('One Time')).toBeDisabled();
    expect(screen.getByLabelText('Recurring')).toBeDisabled();
  });

  it('renders save icon instead of check', () => {
    const goal = makeEditGoal();
    renderForm({ initialGoal: goal });
    expect(screen.getByText('save')).toBeInTheDocument();
    expect(screen.queryByText('check')).not.toBeInTheDocument();
  });

  it('valid submit calls updateFinancialGoal (not addFinancialGoal) and then close', () => {
    const goal = makeEditGoal(8);
    renderForm({ initialGoal: goal });
    fireEvent.click(screen.getByText('save'));
    expect(plannerDataActions.updateFinancialGoal).toHaveBeenCalledTimes(1);
    expect(plannerDataActions.addFinancialGoal).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
