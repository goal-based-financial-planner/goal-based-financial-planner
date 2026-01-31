/**
 * DatePicker Component
 *
 * A wrapper around Material-UI's MobileDatePicker that provides a stable API
 * and isolates the third-party dependency. This makes library upgrades easier
 * by containing changes to a single location.
 */

import { MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers/MobileDatePicker';
import { Dayjs } from 'dayjs';
import { forwardRef } from 'react';

export type DatePickerProps = {
  /** Current date value */
  value?: Dayjs | null;
  /** Callback when date changes */
  onChange: (date: Dayjs | null) => void;
  /** Label for the date picker */
  label?: string;
  /** Minimum selectable date */
  minDate?: Dayjs;
  /** Maximum selectable date */
  maxDate?: Dayjs;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Which views to show (default: ['month', 'year']) */
  views?: Array<'year' | 'month' | 'day'>;
  /** Default value when no value is provided */
  defaultValue?: Dayjs;
  /** Date format string */
  format?: string;
  /** Slot props for customizing nested components */
  slotProps?: MobileDatePickerProps<Dayjs>['slotProps'];
};

/**
 * DatePicker component that wraps MUI's MobileDatePicker
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Select Date"
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   minDate={dayjs()}
 * />
 * ```
 */
export const DatePicker = forwardRef<any, DatePickerProps>(
  (
    {
      value,
      onChange,
      label = 'Select Date',
      minDate,
      maxDate,
      disabled = false,
      views = ['month', 'year'],
      defaultValue,
      format,
      slotProps,
    },
    ref
  ) => {
    return (
      <MobileDatePicker
        ref={ref}
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        views={views}
        defaultValue={defaultValue}
        format={format}
        slotProps={slotProps}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
