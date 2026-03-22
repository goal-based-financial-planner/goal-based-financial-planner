import {
  setTourTaken,
  isTourTaken,
  isDisclaimerAccepted,
  setDisclaimerAccepted,
} from './legacyStorage';

// Note: getPlannerData and setPlannerData have been removed from this module.
// Plan data is now managed by the StorageProvider system in src/util/storage/.

describe('Storage Adapter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Tour Taken Flag', () => {
    it('should return false when tour not taken', () => {
      expect(isTourTaken()).toBe(false);
    });

    it('should return true after tour is marked taken', () => {
      setTourTaken();
      expect(isTourTaken()).toBe(true);
    });

    it('should persist tour taken state', () => {
      setTourTaken();
      const stillTaken = isTourTaken();
      expect(stillTaken).toBe(true);
    });
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
      setTourTaken();
      setDisclaimerAccepted();

      localStorage.clear();

      expect(isTourTaken()).toBe(false);
      expect(isDisclaimerAccepted()).toBe(false);
    });

    it('should throw on malformed JSON for boolean flags', () => {
      localStorage.setItem('isTourTaken', 'invalid-json');
      expect(() => isTourTaken()).toThrow(SyntaxError);
    });
  });
});
