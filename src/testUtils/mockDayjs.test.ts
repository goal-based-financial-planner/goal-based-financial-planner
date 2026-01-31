import { mockTodayDate, createTestDateHelper } from './mockDayjs';
import dayjs from 'dayjs';

describe('mockDayjs utilities', () => {
  afterEach(() => {
    // Always restore real timers after each test
    jest.useRealTimers();
  });

  describe('mockTodayDate', () => {
    it('should mock the current date to a fixed date', () => {
      const cleanup = mockTodayDate('2024-01-15');

      const now = new Date();
      expect(now.getFullYear()).toBe(2024);
      expect(now.getMonth()).toBe(0); // January is 0
      expect(now.getDate()).toBe(15);

      cleanup();
    });

    it('should work with Date objects', () => {
      const fixedDate = new Date('2025-06-20');
      const cleanup = mockTodayDate(fixedDate);

      const now = new Date();
      expect(now.getFullYear()).toBe(2025);
      expect(now.getMonth()).toBe(5); // June is 5
      expect(now.getDate()).toBe(20);

      cleanup();
    });

    it('should affect dayjs() calls', () => {
      const cleanup = mockTodayDate('2024-12-25');

      const today = dayjs();
      expect(today.year()).toBe(2024);
      expect(today.month()).toBe(11); // December is 11
      expect(today.date()).toBe(25);

      cleanup();
    });

    it('should restore original behavior after cleanup', () => {
      const beforeMock = new Date();
      
      const cleanup = mockTodayDate('2020-01-01');
      const duringMock = new Date();
      expect(duringMock.getFullYear()).toBe(2020);

      cleanup();
      
      const afterCleanup = new Date();
      // After cleanup, date should be close to the original time
      expect(afterCleanup.getFullYear()).toBe(beforeMock.getFullYear());
    });

    it('should handle ISO date strings', () => {
      const cleanup = mockTodayDate('2024-03-15T12:30:00Z');

      const now = new Date();
      expect(now.getFullYear()).toBe(2024);
      expect(now.getMonth()).toBe(2); // March is 2
      expect(now.getDate()).toBe(15);

      cleanup();
    });
  });

  describe('createTestDateHelper', () => {
    it('should create helper with default base date', () => {
      const helper = createTestDateHelper();

      const today = helper.today();
      expect(today.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    it('should create helper with custom base date', () => {
      const helper = createTestDateHelper('2025-06-15');

      const today = helper.today();
      expect(today.format('YYYY-MM-DD')).toBe('2025-06-15');
    });

    it('should add days correctly', () => {
      const helper = createTestDateHelper('2024-01-01');

      const future = helper.addDays(10);
      expect(future.format('YYYY-MM-DD')).toBe('2024-01-11');

      const past = helper.addDays(-5);
      expect(past.format('YYYY-MM-DD')).toBe('2023-12-27');
    });

    it('should add months correctly', () => {
      const helper = createTestDateHelper('2024-01-15');

      const future = helper.addMonths(3);
      expect(future.format('YYYY-MM-DD')).toBe('2024-04-15');

      const past = helper.addMonths(-2);
      expect(past.format('YYYY-MM-DD')).toBe('2023-11-15');
    });

    it('should add years correctly', () => {
      const helper = createTestDateHelper('2024-06-15');

      const future = helper.addYears(5);
      expect(future.format('YYYY-MM-DD')).toBe('2029-06-15');

      const past = helper.addYears(-3);
      expect(past.format('YYYY-MM-DD')).toBe('2021-06-15');
    });

    it('should format dates correctly', () => {
      const helper = createTestDateHelper('2024-01-01');

      const date = dayjs('2025-12-25');
      const formatted = helper.format(date);
      expect(formatted).toBe('2025-12-25');
    });

    it('should handle edge cases like month boundaries', () => {
      const helper = createTestDateHelper('2024-01-31');

      // Adding 1 month from Jan 31 should give Feb 29 (2024 is a leap year)
      const nextMonth = helper.addMonths(1);
      expect(nextMonth.month()).toBe(1); // February

      // Adding 1 day from Jan 31 should give Feb 1
      const nextDay = helper.addDays(1);
      expect(nextDay.format('YYYY-MM-DD')).toBe('2024-02-01');
    });

    it('should handle leap years correctly', () => {
      const helper = createTestDateHelper('2024-02-29');

      // 2024 is a leap year, so Feb 29 is valid
      expect(helper.today().format('YYYY-MM-DD')).toBe('2024-02-29');

      // Adding 1 year should give 2025-02-28 (not a leap year)
      const nextYear = helper.addYears(1);
      expect(nextYear.format('YYYY-MM-DD')).toBe('2025-02-28');
    });

    it('should handle zero additions', () => {
      const helper = createTestDateHelper('2024-06-15');

      expect(helper.addDays(0).format('YYYY-MM-DD')).toBe('2024-06-15');
      expect(helper.addMonths(0).format('YYYY-MM-DD')).toBe('2024-06-15');
      expect(helper.addYears(0).format('YYYY-MM-DD')).toBe('2024-06-15');
    });

    it('should be reusable across multiple calls', () => {
      const helper = createTestDateHelper('2024-01-01');

      const date1 = helper.addDays(5);
      const date2 = helper.addDays(10);
      const date3 = helper.today();

      // Each call should be independent and based on the base date
      expect(date1.format('YYYY-MM-DD')).toBe('2024-01-06');
      expect(date2.format('YYYY-MM-DD')).toBe('2024-01-11');
      expect(date3.format('YYYY-MM-DD')).toBe('2024-01-01');
    });
  });
});
