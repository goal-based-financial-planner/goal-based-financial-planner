import { renderHook, act } from '@testing-library/react';
import { useOnboardingWizard } from './useOnboardingWizard';

describe('useOnboardingWizard', () => {
  describe('initial state', () => {
    it('starts on step 1', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      expect(result.current.currentStep).toBe(1);
    });

    it('totalSteps is always 4', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      expect(result.current.totalSteps).toBe(4);
    });

    it('canGoBack is false on step 1', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      expect(result.current.canGoBack).toBe(false);
    });

    it('isLastStep is false on step 1', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      expect(result.current.isLastStep).toBe(false);
    });
  });

  describe('goNext / goBack', () => {
    it('goNext advances step', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      expect(result.current.currentStep).toBe(2);
    });

    it('goBack returns to previous step', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      act(() => result.current.goBack());
      expect(result.current.currentStep).toBe(1);
    });

    it('goBack does not go below step 1', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goBack());
      expect(result.current.currentStep).toBe(1);
    });

    it('canGoBack is true on step 2', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      expect(result.current.canGoBack).toBe(true);
    });

    it('goNext does not advance past totalSteps', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      expect(result.current.currentStep).toBe(4);
    });
  });

  describe('handleStorageSelected', () => {
    it('advances to step 4 (CreateGoal)', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      act(() => result.current.handleStorageSelected());
      expect(result.current.currentStep).toBe(4);
    });
  });

  describe('skip', () => {
    it('calls onComplete', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      const onComplete = vi.fn();
      act(() => result.current.skip(onComplete));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('skip works from any step', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      const onComplete = vi.fn();
      act(() => result.current.skip(onComplete));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleGoalCreated', () => {
    it('calls onComplete', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      const onComplete = vi.fn();
      act(() => result.current.handleGoalCreated(onComplete));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLastStep', () => {
    it('is false on step 3', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      expect(result.current.isLastStep).toBe(false);
    });

    it('is true on step 4', () => {
      const { result } = renderHook(() => useOnboardingWizard());
      act(() => result.current.goNext());
      act(() => result.current.goNext());
      act(() => result.current.handleStorageSelected());
      expect(result.current.isLastStep).toBe(true);
    });
  });
});
