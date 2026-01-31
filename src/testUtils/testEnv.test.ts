import {
  resetLocalStorage,
  setTestLocale,
  mockLocalStorage,
  getCleanLocalStorageMock,
} from './testEnv';

describe('Test Environment Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('resetLocalStorage', () => {
    it('should clear all localStorage items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      resetLocalStorage();

      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
      expect(localStorage.getItem('key3')).toBeNull();
    });

    it('should work when localStorage is already empty', () => {
      resetLocalStorage();

      // Should not throw and localStorage should still be empty
      expect(localStorage.getItem('any_key')).toBeNull();
    });
  });

  describe('setTestLocale', () => {
    it('should set navigator.language to the specified locale', () => {
      setTestLocale('en-US');
      expect(navigator.language).toBe('en-US');
    });

    it('should remove preferred_locale from localStorage', () => {
      localStorage.setItem('preferred_locale', 'fr-FR');
      expect(localStorage.getItem('preferred_locale')).toBe('fr-FR');

      setTestLocale('en-IN');

      expect(localStorage.getItem('preferred_locale')).toBeNull();
      expect(navigator.language).toBe('en-IN');
    });

    it('should allow changing locale multiple times', () => {
      setTestLocale('en-US');
      expect(navigator.language).toBe('en-US');

      setTestLocale('de-DE');
      expect(navigator.language).toBe('de-DE');

      setTestLocale('ja-JP');
      expect(navigator.language).toBe('ja-JP');
    });

    it('should not affect other localStorage items', () => {
      localStorage.setItem('other_key', 'other_value');
      localStorage.setItem('preferred_locale', 'en-US');

      setTestLocale('en-GB');

      expect(localStorage.getItem('other_key')).toBe('other_value');
      expect(localStorage.getItem('preferred_locale')).toBeNull();
    });
  });

  describe('mockLocalStorage', () => {
    it('should populate localStorage with the provided data', () => {
      mockLocalStorage({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      expect(localStorage.getItem('key1')).toBe('value1');
      expect(localStorage.getItem('key2')).toBe('value2');
      expect(localStorage.getItem('key3')).toBe('value3');
    });

    it('should clear existing localStorage before adding new data', () => {
      localStorage.setItem('existing_key', 'existing_value');

      mockLocalStorage({
        new_key: 'new_value',
      });

      expect(localStorage.getItem('existing_key')).toBeNull();
      expect(localStorage.getItem('new_key')).toBe('new_value');
    });

    it('should handle empty data object', () => {
      localStorage.setItem('existing_key', 'existing_value');

      mockLocalStorage({});

      expect(localStorage.getItem('existing_key')).toBeNull();
    });

    it('should handle numeric values as strings', () => {
      mockLocalStorage({
        count: '42',
        price: '99.99',
      });

      expect(localStorage.getItem('count')).toBe('42');
      expect(localStorage.getItem('price')).toBe('99.99');
    });

    it('should handle complex key names', () => {
      mockLocalStorage({
        'app.user.preferences': 'dark-mode',
        'session_2024_01_26': 'active',
      });

      expect(localStorage.getItem('app.user.preferences')).toBe('dark-mode');
      expect(localStorage.getItem('session_2024_01_26')).toBe('active');
    });
  });

  describe('getCleanLocalStorageMock', () => {
    it('should return a mock with all localStorage methods', () => {
      const mock = getCleanLocalStorageMock();

      expect(mock.getItem).toBeDefined();
      expect(mock.setItem).toBeDefined();
      expect(mock.removeItem).toBeDefined();
      expect(mock.clear).toBeDefined();
      expect(mock.key).toBeDefined();
      expect(mock.length).toBeDefined();
    });

    it('should allow setting and getting items', () => {
      const mock = getCleanLocalStorageMock();

      mock.setItem('test_key', 'test_value');

      expect(mock.getItem('test_key')).toBe('test_value');
      expect(mock.setItem).toHaveBeenCalledWith('test_key', 'test_value');
      expect(mock.getItem).toHaveBeenCalledWith('test_key');
    });

    it('should return null for non-existent keys', () => {
      const mock = getCleanLocalStorageMock();

      expect(mock.getItem('non_existent')).toBeNull();
    });

    it('should allow removing items', () => {
      const mock = getCleanLocalStorageMock();

      mock.setItem('key_to_remove', 'value');
      expect(mock.getItem('key_to_remove')).toBe('value');

      mock.removeItem('key_to_remove');
      expect(mock.getItem('key_to_remove')).toBeNull();
      expect(mock.removeItem).toHaveBeenCalledWith('key_to_remove');
    });

    it('should allow clearing all items', () => {
      const mock = getCleanLocalStorageMock();

      mock.setItem('key1', 'value1');
      mock.setItem('key2', 'value2');
      expect(mock.length).toBe(2);

      mock.clear();
      expect(mock.length).toBe(0);
      expect(mock.getItem('key1')).toBeNull();
      expect(mock.getItem('key2')).toBeNull();
      expect(mock.clear).toHaveBeenCalled();
    });

    it('should track length correctly', () => {
      const mock = getCleanLocalStorageMock();

      expect(mock.length).toBe(0);

      mock.setItem('key1', 'value1');
      expect(mock.length).toBe(1);

      mock.setItem('key2', 'value2');
      expect(mock.length).toBe(2);

      mock.removeItem('key1');
      expect(mock.length).toBe(1);

      mock.clear();
      expect(mock.length).toBe(0);
    });

    it('should support key method for accessing keys by index', () => {
      const mock = getCleanLocalStorageMock();

      mock.setItem('first', 'value1');
      mock.setItem('second', 'value2');

      expect(mock.key(0)).toBe('first');
      expect(mock.key(1)).toBe('second');
      expect(mock.key(2)).toBeNull();
      expect(mock.key).toHaveBeenCalledWith(0);
      expect(mock.key).toHaveBeenCalledWith(1);
    });

    it('should handle multiple mock instances independently', () => {
      const mock1 = getCleanLocalStorageMock();
      const mock2 = getCleanLocalStorageMock();

      mock1.setItem('key', 'value1');
      mock2.setItem('key', 'value2');

      expect(mock1.getItem('key')).toBe('value1');
      expect(mock2.getItem('key')).toBe('value2');
    });

    it('should convert values to strings when setting', () => {
      const mock = getCleanLocalStorageMock();

      // Even though we pass a string, the mock should handle it
      mock.setItem('number', '123');
      expect(mock.getItem('number')).toBe('123');
    });
  });
});
