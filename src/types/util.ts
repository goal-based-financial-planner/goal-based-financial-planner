import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Storage key for user's preferred locale
 */
const LOCALE_STORAGE_KEY = 'preferred_locale';

/**
 * Maps IANA timezone identifiers to locale strings for currency detection.
 * Used as a secondary signal when navigator.language is ambiguous (e.g. en-GB
 * on a device physically located in India).
 */
const TIMEZONE_LOCALE_MAP: Record<string, string> = {
  'Asia/Kolkata': 'en-IN',
  'Asia/Calcutta': 'en-IN',
  'Asia/Tokyo': 'ja-JP',
  'America/New_York': 'en-US',
  'America/Chicago': 'en-US',
  'America/Los_Angeles': 'en-US',
  'Europe/London': 'en-GB',
  'Europe/Berlin': 'de-DE',
  'Europe/Paris': 'fr-FR',
};

/**
 * Locales whose navigator.language value already carries an unambiguous
 * currency region (e.g. 'en-IN' → INR, 'hi-IN' → INR). For these we trust
 * navigator.language directly. For generic locales like 'en-GB' or 'en-US'
 * we cross-check with the system timezone before committing.
 */
const UNAMBIGUOUS_LOCALES = new Set(['en-IN', 'hi-IN', 'ja-JP', 'de-DE', 'fr-FR']);

/**
 * Gets the user's preferred locale.
 * Priority:
 * 1. Stored preference in localStorage
 * 2. navigator.language — if it carries an unambiguous currency region, use it
 * 3. System timezone (Intl.DateTimeFormat) — more reliable than browser language
 *    for determining currency when the browser is set to a generic English locale
 * 4. navigator.language as-is
 * 5. Fallback to 'en-US'
 */
export const getUserLocale = (): string => {
  // Check for stored preference first
  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (storedLocale) {
    return storedLocale;
  }

  const browserLocale =
    typeof navigator !== 'undefined' ? navigator.language : undefined;

  // If the browser reports an unambiguous locale (e.g. en-IN), trust it directly
  if (browserLocale && UNAMBIGUOUS_LOCALES.has(browserLocale)) {
    return browserLocale;
  }

  // For generic locales (en-GB, en-US, en, …) use the system timezone as a
  // stronger signal for the user's actual currency region
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzLocale = TIMEZONE_LOCALE_MAP[tz];
    if (tzLocale) {
      return tzLocale;
    }
  } catch {
    // Intl not available — fall through
  }

  // Fall back to whatever navigator.language reported
  if (browserLocale) {
    return browserLocale;
  }

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

/**
 * Formats a number as a compact currency string suitable for chart axis labels.
 * Uses locale-appropriate magnitude suffixes:
 * - INR: ₹10.5Cr (crore = 10M), ₹3.5L (lakh = 100K)
 * - Others (USD, EUR, GBP, JPY, ...): $10.5M, $3.5K
 * Falls back to formatCurrency for values below the compact threshold.
 *
 * @param num - The number to format
 */
export const formatCompactCurrency = (num: number): string => {
  const locale = getUserLocale();
  const localeCurrencyMap: { [key: string]: string } = {
    'en-IN': 'INR',
    'hi-IN': 'INR',
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'ja-JP': 'JPY',
  };
  const currency = localeCurrencyMap[locale] || 'USD';

  if (currency === 'INR') {
    if (num >= 10_000_000) {
      return `₹${(num / 10_000_000).toFixed(1)}Cr`;
    }
    if (num >= 100_000) {
      return `₹${(num / 100_000).toFixed(1)}L`;
    }
    return formatCurrency(num, 'INR');
  }

  // For all other currencies: extract the symbol from a zero-amount format
  const symbol = (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    .replace(/[\d,.\s]/g, '')
    .trim();

  if (num >= 1_000_000) {
    return `${symbol}${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${symbol}${(num / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(num, currency);
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
