/**
 * Utilities for mocking Day.js "today" date in tests
 */

import dayjs from 'dayjs';

/**
 * Mock the current date for Day.js using Jest's modern fake timers
 * This sets the system time to a fixed date
 *
 * @param fixedDate - The date to use as "today" (ISO string or Date object)
 * @returns Cleanup function to restore original behavior
 *
 * @example
 * const cleanup = mockTodayDate('2024-01-15');
 * // Now Date() and dayjs() use 2024-01-15 as "today"
 * cleanup(); // Restore original behavior
 */
export function mockTodayDate(fixedDate: string | Date): () => void {
  const mockedTime = new Date(fixedDate).getTime();

  // Use Jest's modern fake timers to set system time
  jest.useFakeTimers();
  jest.setSystemTime(mockedTime);

  // Return cleanup function
  return () => {
    jest.useRealTimers();
  };
}

/**
 * Create a test date helper that ensures consistent dates across tests
 * @param baseDate - The base date to use (default: '2024-01-01')
 */
export function createTestDateHelper(baseDate = '2024-01-01') {
  return {
    today: () => dayjs(baseDate),
    addDays: (days: number) => dayjs(baseDate).add(days, 'day'),
    addMonths: (months: number) => dayjs(baseDate).add(months, 'month'),
    addYears: (years: number) => dayjs(baseDate).add(years, 'year'),
    format: (date: dayjs.Dayjs) => date.format('YYYY-MM-DD'),
  };
}
