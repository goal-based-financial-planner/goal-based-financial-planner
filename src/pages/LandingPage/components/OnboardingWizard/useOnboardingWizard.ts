import { useState, useCallback } from 'react';

export type WizardPath = 'new' | 'open' | null;

export type UseOnboardingWizardReturn = {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  isLastStep: boolean;
  goNext: () => void;
  goBack: () => void;
  skip: (onComplete: () => void) => void;
  handleStorageSelected: () => void;
  handleGoalCreated: (onComplete: () => void) => void;
};

// Fixed 4-step flow: Welcome → Concepts → StoragePicker → CreateGoal
const TOTAL_STEPS = 4;

export function useOnboardingWizard(): UseOnboardingWizardReturn {
  const [currentStep, setCurrentStep] = useState(1);

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const skip = useCallback((onComplete: () => void) => {
    onComplete();
  }, []);

  const handleStorageSelected = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const handleGoalCreated = useCallback((onComplete: () => void) => {
    onComplete();
  }, []);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    canGoBack: currentStep > 1,
    isLastStep: currentStep === TOTAL_STEPS,
    goNext,
    goBack,
    skip,
    handleStorageSelected,
    handleGoalCreated,
  };
}
