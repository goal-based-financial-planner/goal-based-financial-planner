import { ALPHANUMERIC_PATTERN, NUMBER_PATTERN, YEAR_PATTERN } from './constants';

describe('Constants - Regular Expression Patterns', () => {
  describe('ALPHANUMERIC_PATTERN', () => {
    it('should match valid alphanumeric strings with spaces', () => {
      expect(ALPHANUMERIC_PATTERN.test('Hello World')).toBe(true);
      expect(ALPHANUMERIC_PATTERN.test('Test123')).toBe(true);
      expect(ALPHANUMERIC_PATTERN.test('ABC xyz 789')).toBe(true);
      expect(ALPHANUMERIC_PATTERN.test('')).toBe(true); // Empty string matches
    });

    it('should not match strings with special characters', () => {
      expect(ALPHANUMERIC_PATTERN.test('Hello@World')).toBe(false);
      expect(ALPHANUMERIC_PATTERN.test('Test-123')).toBe(false);
      expect(ALPHANUMERIC_PATTERN.test('ABC_xyz')).toBe(false);
      expect(ALPHANUMERIC_PATTERN.test('Test!')).toBe(false);
      expect(ALPHANUMERIC_PATTERN.test('Hello#World')).toBe(false);
    });

    it('should match strings with only letters', () => {
      expect(ALPHANUMERIC_PATTERN.test('HelloWorld')).toBe(true);
      expect(ALPHANUMERIC_PATTERN.test('abc')).toBe(true);
    });

    it('should match strings with only numbers', () => {
      expect(ALPHANUMERIC_PATTERN.test('123456')).toBe(true);
      expect(ALPHANUMERIC_PATTERN.test('0')).toBe(true);
    });

    it('should match strings with only spaces', () => {
      expect(ALPHANUMERIC_PATTERN.test('   ')).toBe(true);
    });
  });

  describe('NUMBER_PATTERN', () => {
    it('should match valid positive integers', () => {
      expect(NUMBER_PATTERN.test('0')).toBe(true);
      expect(NUMBER_PATTERN.test('1')).toBe(true);
      expect(NUMBER_PATTERN.test('123')).toBe(true);
      expect(NUMBER_PATTERN.test('999999')).toBe(true);
    });

    it('should match numbers with leading zeros', () => {
      expect(NUMBER_PATTERN.test('01')).toBe(true);
      expect(NUMBER_PATTERN.test('00')).toBe(true);
      expect(NUMBER_PATTERN.test('007')).toBe(true);
    });

    it('should not match negative numbers', () => {
      expect(NUMBER_PATTERN.test('-1')).toBe(false);
      expect(NUMBER_PATTERN.test('-123')).toBe(false);
    });

    it('should not match decimal numbers', () => {
      expect(NUMBER_PATTERN.test('1.5')).toBe(false);
      expect(NUMBER_PATTERN.test('0.99')).toBe(false);
    });

    it('should not match non-numeric strings', () => {
      expect(NUMBER_PATTERN.test('abc')).toBe(false);
      expect(NUMBER_PATTERN.test('12a')).toBe(false);
      expect(NUMBER_PATTERN.test('a12')).toBe(false);
      expect(NUMBER_PATTERN.test('')).toBe(false);
    });

    it('should not match strings with spaces', () => {
      expect(NUMBER_PATTERN.test('1 2')).toBe(false);
      expect(NUMBER_PATTERN.test(' 123')).toBe(false);
      expect(NUMBER_PATTERN.test('123 ')).toBe(false);
    });
  });

  describe('YEAR_PATTERN', () => {
    it('should match valid 1-4 digit years', () => {
      expect(YEAR_PATTERN.test('1')).toBe(true);
      expect(YEAR_PATTERN.test('99')).toBe(true);
      expect(YEAR_PATTERN.test('999')).toBe(true);
      expect(YEAR_PATTERN.test('2024')).toBe(true);
      expect(YEAR_PATTERN.test('2026')).toBe(true);
      expect(YEAR_PATTERN.test('1900')).toBe(true);
    });

    it('should not match years with more than 4 digits', () => {
      expect(YEAR_PATTERN.test('12345')).toBe(false);
      expect(YEAR_PATTERN.test('99999')).toBe(false);
    });

    it('should not match negative years', () => {
      expect(YEAR_PATTERN.test('-2024')).toBe(false);
      expect(YEAR_PATTERN.test('-1')).toBe(false);
    });

    it('should not match non-numeric strings', () => {
      expect(YEAR_PATTERN.test('abc')).toBe(false);
      expect(YEAR_PATTERN.test('20a4')).toBe(false);
      expect(YEAR_PATTERN.test('')).toBe(false);
    });

    it('should not match years with spaces', () => {
      expect(YEAR_PATTERN.test('20 24')).toBe(false);
      expect(YEAR_PATTERN.test(' 2024')).toBe(false);
      expect(YEAR_PATTERN.test('2024 ')).toBe(false);
    });

    it('should not match decimal numbers', () => {
      expect(YEAR_PATTERN.test('20.24')).toBe(false);
      expect(YEAR_PATTERN.test('1.5')).toBe(false);
    });
  });
});
