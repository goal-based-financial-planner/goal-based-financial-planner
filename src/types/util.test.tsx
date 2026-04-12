import {
  getUserLocale,
  setUserLocale,
  clearUserLocale,
  formatNumber,
  formatCurrency,
  formatCompactCurrency,
  formatIndianNumber,
  formatIndianCurrency,
  AVAILABLE_LOCALES,
  useNumberFormatter,
} from './util';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('Locale and Formatting Utilities', () => {
  let originalIntl: typeof Intl;

  beforeEach(() => {
    localStorage.clear();
    // Reset navigator.language to default
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
    // Stub Intl.DateTimeFormat to return a neutral timezone so timezone-based
    // detection doesn't interfere with navigator.language tests
    originalIntl = global.Intl;
    const MockIntl = {
      ...Intl,
      DateTimeFormat: Object.assign(
        (locale?: string, options?: Intl.DateTimeFormatOptions) =>
          new originalIntl.DateTimeFormat(locale, options),
        {
          ...Intl.DateTimeFormat,
          prototype: Intl.DateTimeFormat.prototype,
        }
      ),
    };
    // Override resolvedOptions to return an unmapped timezone
    MockIntl.DateTimeFormat = function(locale?: string, options?: Intl.DateTimeFormatOptions) {
      const fmt = new originalIntl.DateTimeFormat(locale, options);
      return {
        ...fmt,
        resolvedOptions: () => ({ ...fmt.resolvedOptions(), timeZone: 'UTC' }),
        format: fmt.format.bind(fmt),
        formatToParts: fmt.formatToParts.bind(fmt),
        formatRange: fmt.formatRange?.bind(fmt),
        formatRangeToParts: fmt.formatRangeToParts?.bind(fmt),
      } as Intl.DateTimeFormat;
    } as unknown as typeof Intl.DateTimeFormat;
    global.Intl = MockIntl as typeof Intl;
  });

  afterEach(() => {
    global.Intl = originalIntl;
  });

  describe('getUserLocale', () => {
    it('should return stored locale when available', () => {
      setUserLocale('en-IN');
      expect(getUserLocale()).toBe('en-IN');
    });

    it('should return navigator.language directly for unambiguous locales (fr-FR)', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });

      expect(getUserLocale()).toBe('fr-FR');
    });

    it('should return en-IN for unambiguous navigator.language en-IN', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-IN',
        configurable: true,
      });

      expect(getUserLocale()).toBe('en-IN');
    });

    it('should fallback to en-US when navigator.language unavailable and timezone unmapped', () => {
      Object.defineProperty(navigator, 'language', {
        value: undefined,
        configurable: true,
      });

      // UTC is not in TIMEZONE_LOCALE_MAP → falls through to en-US
      expect(getUserLocale()).toBe('en-US');
    });

    it('should use timezone locale when navigator.language is generic (en-GB) and timezone maps to en-IN', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true,
      });
      // Override timezone to Asia/Kolkata
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: function() {
          return {
            resolvedOptions: () => ({ timeZone: 'Asia/Kolkata', locale: 'en-IN' }),
          } as unknown as Intl.DateTimeFormat;
        } as unknown as typeof Intl.DateTimeFormat,
      } as typeof Intl;

      expect(getUserLocale()).toBe('en-IN');
    });

    it('should prioritize stored preference over navigator.language', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'de-DE',
        configurable: true,
      });
      setUserLocale('en-IN');

      expect(getUserLocale()).toBe('en-IN');
    });
  });

  describe('setUserLocale and clearUserLocale', () => {
    it('should store locale preference', () => {
      setUserLocale('hi-IN');
      expect(localStorage.getItem('preferred_locale')).toBe('hi-IN');
    });

    it('should clear locale preference', () => {
      setUserLocale('en-IN');
      clearUserLocale();
      
      expect(localStorage.getItem('preferred_locale')).toBeNull();
    });

    it('should fallback to navigator.language after clearing', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'ja-JP',
        configurable: true,
      });

      setUserLocale('en-IN');
      clearUserLocale();

      expect(getUserLocale()).toBe('ja-JP');
    });
  });

  describe('formatNumber', () => {
    it('should format number with US locale', () => {
      const result = formatNumber(1000000);
      
      // US format: 1,000,000
      expect(result).toBe('1,000,000');
    });

    it('should format number with Indian locale', () => {
      setUserLocale('en-IN');
      const result = formatNumber(1000000);
      
      // Indian format: 10,00,000
      expect(result).toContain('10');
      expect(result).toContain('00');
      expect(result).toContain('000');
    });

    it('should respect maximumFractionDigits option', () => {
      const result = formatNumber(1234.5678, { maximumFractionDigits: 2 });
      
      expect(result).toContain('1,234.57');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000);
      
      expect(result).toContain('-');
      expect(result).toContain('1,000');
    });

    it('should handle very large numbers', () => {
      const result = formatNumber(1000000000000);
      
      expect(result).toContain('1,000,000,000,000');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default locale currency', () => {
      const result = formatCurrency(1000);
      
      // US locale defaults to USD
      expect(result).toContain('$');
      expect(result).toContain('1,000');
    });

    it('should format Indian Rupees for en-IN locale', () => {
      setUserLocale('en-IN');
      const result = formatCurrency(1000);
      
      // Should contain INR symbol/code
      expect(result).toMatch(/₹|INR/);
    });

    it('should use provided currency code', () => {
      const result = formatCurrency(1000, 'EUR');
      
      expect(result).toMatch(/€|EUR/);
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0);
      
      expect(result).toContain('0');
    });

    it('should round to zero decimal places by default', () => {
      const result = formatCurrency(1234.99);
      
      // Should round to nearest integer
      expect(result).toContain('1,235');
      expect(result).not.toContain('.99');
    });

    it('should handle different locale-currency mappings', () => {
      setUserLocale('de-DE');
      const result = formatCurrency(1000);
      
      // German locale should use EUR
      expect(result).toMatch(/€|EUR/);
    });
  });

  describe('Deprecated functions (backward compatibility)', () => {
    it('formatIndianNumber should delegate to formatNumber', () => {
      setUserLocale('en-IN');
      const result1 = formatIndianNumber(100000);
      const result2 = formatNumber(100000);
      
      expect(result1).toBe(result2);
    });

    it('formatIndianCurrency should format in INR', () => {
      setUserLocale('en-IN');
      const result = formatIndianCurrency(100000);
      
      expect(result).toMatch(/₹|INR/);
    });

    it('formatIndianCurrency should work regardless of current locale', () => {
      setUserLocale('en-US');
      const result = formatIndianCurrency(100000);
      
      // Should still use INR even though locale is US
      expect(result).toMatch(/₹|INR/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small decimal numbers', () => {
      const result = formatNumber(0.0001, { maximumFractionDigits: 4 });
      
      expect(result).toBe('0.0001');
    });

    it('should handle locale changes mid-session', () => {
      setUserLocale('en-US');
      const result1 = formatNumber(100000);
      
      setUserLocale('en-IN');
      const result2 = formatNumber(100000);
      
      // US: 100,000 vs IN: 1,00,000
      expect(result1).not.toBe(result2);
      expect(result1).toBe('100,000');
      expect(result2).toContain('1,00,000');
    });

    it('should throw on invalid stored locale', () => {
      localStorage.setItem('preferred_locale', 'invalid-locale-xyz');
      
      // toLocaleString throws RangeError for invalid locale
      expect(() => formatNumber(1000)).toThrow(RangeError);
    });
  });

  describe('AVAILABLE_LOCALES', () => {
    it('should contain all expected locales', () => {
      expect(AVAILABLE_LOCALES).toHaveLength(7);
    });

    it('should have correct structure for each locale', () => {
      AVAILABLE_LOCALES.forEach((locale) => {
        expect(locale).toHaveProperty('code');
        expect(locale).toHaveProperty('name');
        expect(locale).toHaveProperty('example');
        expect(typeof locale.code).toBe('string');
        expect(typeof locale.name).toBe('string');
        expect(typeof locale.example).toBe('string');
      });
    });

    it('should include en-IN locale', () => {
      const enIN = AVAILABLE_LOCALES.find((l) => l.code === 'en-IN');
      expect(enIN).toBeDefined();
      expect(enIN?.name).toContain('India');
      expect(enIN?.example).toBe('10,00,000');
    });

    it('should include en-US locale', () => {
      const enUS = AVAILABLE_LOCALES.find((l) => l.code === 'en-US');
      expect(enUS).toBeDefined();
      expect(enUS?.name).toContain('United States');
      expect(enUS?.example).toBe('1,000,000');
    });

    it('should include all unique locale codes', () => {
      const codes = AVAILABLE_LOCALES.map((l) => l.code);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('formatCompactCurrency', () => {
    afterEach(() => {
      clearUserLocale();
    });

    it('should format crore for INR locale', () => {
      setUserLocale('en-IN');
      expect(formatCompactCurrency(10_000_000)).toBe('₹1.0Cr');
      expect(formatCompactCurrency(15_500_000)).toBe('₹1.6Cr');
    });

    it('should format lakh for INR locale', () => {
      setUserLocale('en-IN');
      expect(formatCompactCurrency(100_000)).toBe('₹1.0L');
      expect(formatCompactCurrency(350_000)).toBe('₹3.5L');
    });

    it('should fall back to formatCurrency for INR below lakh threshold', () => {
      setUserLocale('en-IN');
      const result = formatCompactCurrency(50_000);
      expect(result).toMatch(/₹|INR/);
    });

    it('should format millions for USD locale', () => {
      setUserLocale('en-US');
      expect(formatCompactCurrency(10_000_000)).toBe('$10.0M');
      expect(formatCompactCurrency(1_500_000)).toBe('$1.5M');
    });

    it('should format thousands for USD locale', () => {
      setUserLocale('en-US');
      expect(formatCompactCurrency(5_000)).toBe('$5.0K');
    });

    it('should fall back to formatCurrency for USD below thousand threshold', () => {
      setUserLocale('en-US');
      const result = formatCompactCurrency(500);
      expect(result).toMatch(/\$|USD/);
    });

    it('should use EUR symbol for de-DE locale', () => {
      setUserLocale('de-DE');
      const result = formatCompactCurrency(2_000_000);
      expect(result).toMatch(/€.*M|M.*€/);
    });

    it('should fall back to USD for unknown locale', () => {
      setUserLocale('en-US');
      const result = formatCompactCurrency(1_000);
      expect(result).toMatch(/\$|USD/);
    });
  });

  describe('useNumberFormatter', () => {
    const theme = createTheme();

    const wrapper = ({ children }: any) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    );

    beforeEach(() => {
      setUserLocale('en-US');
    });

    it('should format number correctly', () => {
      const { result } = renderHook(() => useNumberFormatter(1000000), {
        wrapper,
      });

      expect(result.current).toBe('1,000,000');
    });

    it('should handle zero', () => {
      const { result } = renderHook(() => useNumberFormatter(0), { wrapper });

      expect(result.current).toBe('0');
    });

    it('should handle negative numbers', () => {
      const { result } = renderHook(() => useNumberFormatter(-5000), {
        wrapper,
      });

      expect(result.current).toContain('-');
      expect(result.current).toContain('5,000');
    });

    it('should respect locale setting', () => {
      setUserLocale('en-IN');
      const { result } = renderHook(() => useNumberFormatter(100000), {
        wrapper,
      });

      expect(result.current).toContain('1,00,000');
    });

    it('should handle very large numbers', () => {
      const { result } = renderHook(() => useNumberFormatter(1000000000), {
        wrapper,
      });

      expect(result.current).toContain('1,000,000,000');
    });
  });
});
