import {
  getPlannerData,
  setPlannerData,
  setTourTaken,
  isTourTaken,
  isDisclaimerAccepted,
  setDisclaimerAccepted,
} from './storage';
import { PlannerData } from '../domain/PlannerData';
import { TermType } from '../types/enums';

describe('Storage Adapter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Planner Data', () => {
    it('should return null when no planner data is stored', () => {
      expect(getPlannerData()).toBeNull();
    });

    it('should store and retrieve planner data', () => {
      const plannerData = new PlannerData([], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      setPlannerData(plannerData);
      const retrieved = getPlannerData();

      expect(retrieved).not.toBeNull();
      expect(typeof retrieved).toBe('string');
      
      const parsed = JSON.parse(retrieved!);
      expect(parsed.financialGoals).toEqual([]);
      expect(parsed.investmentAllocations).toBeDefined();
    });

    it('should handle complex planner data', () => {
      const plannerData = new PlannerData([], {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'FD',
            investmentPercentage: 100,
            expectedReturnPercentage: 6,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      setPlannerData(plannerData);
      const retrieved = getPlannerData();
      const parsed = JSON.parse(retrieved!);

      expect(parsed.investmentAllocations[TermType.SHORT_TERM]).toHaveLength(1);
      expect(parsed.investmentAllocations[TermType.SHORT_TERM][0].investmentName).toBe('FD');
    });
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
      
      // Simulate app reload by calling getter again
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
      
      // Simulate app reload
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
      expect(getPlannerData()).toBeNull();
    });

    it('should throw on malformed JSON for boolean flags', () => {
      localStorage.setItem('isTourTaken', 'invalid-json');
      
      // JSON.parse throws on invalid JSON
      expect(() => isTourTaken()).toThrow(SyntaxError);
    });

    it('should overwrite existing planner data', () => {
      const data1 = new PlannerData([], {
        [TermType.SHORT_TERM]: [],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });
      const data2 = new PlannerData([], {
        [TermType.SHORT_TERM]: [
          {
            investmentName: 'Test',
            investmentPercentage: 50,
            expectedReturnPercentage: 10,
          },
        ],
        [TermType.MEDIUM_TERM]: [],
        [TermType.LONG_TERM]: [],
      });

      setPlannerData(data1);
      setPlannerData(data2);
      
      const retrieved = JSON.parse(getPlannerData()!);
      expect(retrieved.investmentAllocations[TermType.SHORT_TERM]).toHaveLength(1);
    });
  });
});
