import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Storage key for user's preferred locale
 */
const LOCALE_STORAGE_KEY = 'preferred_locale';

/**
 * Gets the user's preferred locale.
 * Priority:
 * 1. Stored preference in localStorage
 * 2. Browser's navigator.language
 * 3. Fallback to 'en-US'
 */
export const getUserLocale = (): string => {
  // Check for stored preference first
  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (storedLocale) {
    return storedLocale;
  }

  // Use browser's language setting
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  // Fallback
  return 'en-US';
};

/**
 * Sets the user's preferred locale
 * @param locale - The locale string (e.g., 'en-IN', 'en-US', 'hi-IN')
 */
export const setUserLocale = (locale: string): void => {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
};

/**
 * Clears the stored locale preference (will use browser default)
 */
export const clearUserLocale = (): void => {
  localStorage.removeItem(LOCALE_STORAGE_KEY);
};

/**
 * Formats a number according to the user's locale.
 * Examples:
 * - 'en-IN': 10,00,000 (Indian format)
 * - 'en-US': 1,000,000 (US format)
 * - 'de-DE': 1.000.000 (German format)
 *
 * @param num - The number to format
 * @param options - Optional Intl.NumberFormatOptions
 */
export const formatNumber = (
  num: number,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
): string => {
  const locale = getUserLocale();
  return num.toLocaleString(locale, options);
};

/**
 * Formats a number as currency according to the user's locale.
 * Automatically detects currency based on locale.
 *
 * @param num - The number to format
 * @param currencyCode - Optional currency code (defaults based on locale)
 */
export const formatCurrency = (
  num: number,
  currencyCode?: string,
): string => {
  const locale = getUserLocale();

  // Map common locales to their currencies
  const localeCurrencyMap: { [key: string]: string } = {
    'en-IN': 'INR',
    'hi-IN': 'INR',
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'ja-JP': 'JPY',
  };

  const currency = currencyCode || localeCurrencyMap[locale] || 'USD';

  return num.toLocaleString(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
};

/**
 * @deprecated Use formatNumber instead
 * Kept for backward compatibility
 */
export const formatIndianNumber = (
  num: number,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
): string => {
  return formatNumber(num, options);
};

/**
 * @deprecated Use formatCurrency instead
 * Kept for backward compatibility
 */
export const formatIndianCurrency = (num: number): string => {
  return formatCurrency(num, 'INR');
};

export const useNumberFormatter = (num: number) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (isLargeScreen || isSmallScreen) {
    return formatNumber(num);
  }

  return formatNumber(num);
};

/**
 * Available locale options for user selection
 */
export const AVAILABLE_LOCALES = [
  { code: 'en-IN', name: 'India (English)', example: '10,00,000' },
  { code: 'hi-IN', name: 'India (Hindi)', example: '10,00,000' },
  { code: 'en-US', name: 'United States', example: '1,000,000' },
  { code: 'en-GB', name: 'United Kingdom', example: '1,000,000' },
  { code: 'de-DE', name: 'Germany', example: '1.000.000' },
  { code: 'fr-FR', name: 'France', example: '1 000 000' },
  { code: 'ja-JP', name: 'Japan', example: '1,000,000' },
] as const;
