/**
 * Test environment utilities for deterministic tests
 */

/**
 * Reset localStorage to a clean state
 */
export function resetLocalStorage(): void {
  localStorage.clear();
}

/**
 * Set a specific locale for testing
 * @param locale - The locale string (e.g., 'en-US', 'en-IN')
 */
export function setTestLocale(locale: string): void {
  Object.defineProperty(navigator, 'language', {
    value: locale,
    configurable: true,
  });
  // Also clear any stored locale preference
  localStorage.removeItem('preferred_locale');
}

/**
 * Mock localStorage with specific data
 * @param data - Key-value pairs to populate localStorage
 */
export function mockLocalStorage(data: Record<string, string>): void {
  resetLocalStorage();
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

/**
 * Get a clean localStorage mock for testing
 */
export function getCleanLocalStorageMock() {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
}
