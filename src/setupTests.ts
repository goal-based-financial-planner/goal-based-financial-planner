// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Reset/initialize deterministic globals for tests

// Mock localStorage with a clean implementation before each test
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Set stable locale for number formatting in tests
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true,
});

// Ensure consistent timezone (UTC) for date tests
process.env.TZ = 'UTC';
