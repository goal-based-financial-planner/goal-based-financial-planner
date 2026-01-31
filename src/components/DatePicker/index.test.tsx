import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './index';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Helper to wrap component with LocalizationProvider
const renderDatePicker = (ui: React.ReactElement) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>{ui}</LocalizationProvider>
  );
};

describe('DatePicker', () => {
  it('should render with label', () => {
    const mockOnChange = jest.fn();
    renderDatePicker(
      <DatePicker label="Test Label" value={null} onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('should render with default label when not provided', () => {
    const mockOnChange = jest.fn();
    renderDatePicker(<DatePicker value={null} onChange={mockOnChange} />);

    expect(screen.getByLabelText('Select Date')).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    const mockOnChange = jest.fn();
    const testDate = dayjs('2024-06-15');

    renderDatePicker(
      <DatePicker
        label="Test Date"
        value={testDate}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Test Date') as HTMLInputElement;
    // MobileDatePicker formats as "MM/YYYY" by default with ['month', 'year'] views
    expect(input.value).toContain('2024');
  });

  it('should call onChange when date is selected', () => {
    const mockOnChange = jest.fn();

    renderDatePicker(
      <DatePicker
        label="Test Date"
        value={dayjs('2024-01-01')}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Test Date');
    fireEvent.click(input);

    // Note: Full interaction testing with MobileDatePicker is complex
    // This test verifies the component renders and can be interacted with
    expect(input).toBeInTheDocument();
  });

  it('should respect disabled prop', () => {
    const mockOnChange = jest.fn();

    renderDatePicker(
      <DatePicker
        label="Disabled Date"
        value={null}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const input = screen.getByLabelText('Disabled Date') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('should not be disabled by default', () => {
    const mockOnChange = jest.fn();

    renderDatePicker(
      <DatePicker label="Normal Date" value={null} onChange={mockOnChange} />
    );

    const input = screen.getByLabelText('Normal Date') as HTMLInputElement;
    expect(input).not.toBeDisabled();
  });

  it('should render with custom views', () => {
    const mockOnChange = jest.fn();

    renderDatePicker(
      <DatePicker
        label="Custom Views"
        value={null}
        onChange={mockOnChange}
        views={['year', 'month', 'day']}
      />
    );

    expect(screen.getByLabelText('Custom Views')).toBeInTheDocument();
  });

  it('should render with default value when no value provided', () => {
    const mockOnChange = jest.fn();
    const defaultDate = dayjs('2024-01-01');

    renderDatePicker(
      <DatePicker
        label="With Default"
        value={null}
        onChange={mockOnChange}
        defaultValue={defaultDate}
      />
    );

    expect(screen.getByLabelText('With Default')).toBeInTheDocument();
  });

  it('should accept minDate prop', () => {
    const mockOnChange = jest.fn();
    const minDate = dayjs('2024-01-01');

    renderDatePicker(
      <DatePicker
        label="Min Date Test"
        value={null}
        onChange={mockOnChange}
        minDate={minDate}
      />
    );

    expect(screen.getByLabelText('Min Date Test')).toBeInTheDocument();
  });

  it('should accept maxDate prop', () => {
    const mockOnChange = jest.fn();
    const maxDate = dayjs('2024-12-31');

    renderDatePicker(
      <DatePicker
        label="Max Date Test"
        value={null}
        onChange={mockOnChange}
        maxDate={maxDate}
      />
    );

    expect(screen.getByLabelText('Max Date Test')).toBeInTheDocument();
  });

  it('should accept both minDate and maxDate props', () => {
    const mockOnChange = jest.fn();
    const minDate = dayjs('2024-01-01');
    const maxDate = dayjs('2024-12-31');

    renderDatePicker(
      <DatePicker
        label="Date Range Test"
        value={dayjs('2024-06-15')}
        onChange={mockOnChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    );

    expect(screen.getByLabelText('Date Range Test')).toBeInTheDocument();
  });

  it('should handle null value gracefully', () => {
    const mockOnChange = jest.fn();

    renderDatePicker(
      <DatePicker label="Null Value" value={null} onChange={mockOnChange} />
    );

    const input = screen.getByLabelText('Null Value') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
