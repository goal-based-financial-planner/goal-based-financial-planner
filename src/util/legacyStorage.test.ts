import {
  isDisclaimerAccepted,
  setDisclaimerAccepted,
} from './legacyStorage';

describe('Storage Adapter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Disclaimer Accepted Flag', () => {
    it('should return false when disclaimer not accepted', () => {
      expect(isDisclaimerAccepted()).toBe(false);
    });

    it('should return true after disclaimer is accepted', () => {
      setDisclaimerAccepted();
      expect(isDisclaimerAccepted()).toBe(true);
    });

    it('should persist disclaimer accepted state', () => {
      setDisclaimerAccepted();
      const stillAccepted = isDisclaimerAccepted();
      expect(stillAccepted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage.clear() correctly', () => {
      setDisclaimerAccepted();
      localStorage.clear();
      expect(isDisclaimerAccepted()).toBe(false);
    });
  });
});
