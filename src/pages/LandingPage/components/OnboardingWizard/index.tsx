import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  LinearProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';
import { StorageProviderContextValue } from '../../../../context/StorageProviderContext';
import { StorageProviderId } from '../../../../util/storage';
import { useOnboardingWizard } from './useOnboardingWizard';
import WelcomeStep from './steps/WelcomeStep';
import ConceptsStep from './steps/ConceptsStep';
import StoragePickerStep from './steps/StoragePickerStep';
import CreateGoalStep from './steps/CreateGoalStep';

export type OnboardingWizardProps = {
  initProvider: StorageProviderContextValue['initProvider'];
  dispatch: Dispatch<PlannerDataAction>;
  onComplete: () => void;
  onNewPlanCreated: () => void;
};

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initProvider,
  dispatch,
  onComplete,
  onNewPlanCreated,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Lifted storage selection state so it survives back navigation
  const [savedProvider, setSavedProvider] = useState<StorageProviderId | null>(null);
  const [savedPlanName, setSavedPlanName] = useState('');

  const {
    currentStep,
    totalSteps,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    skip,
    handleStorageSelected,
    handleGoalCreated,
  } = useOnboardingWizard();

  const handleSkip = () => skip(onComplete);

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <ConceptsStep />;
      case 3:
        return (
          <StoragePickerStep
            initProvider={initProvider}
            onComplete={handleStorageSelected}
            initialProvider={savedProvider}
            initialPlanName={savedPlanName}
            onProviderChange={(p, name) => { setSavedProvider(p); setSavedPlanName(name ?? ''); }}
          />
        );
      case 4:
        return (
          <CreateGoalStep
            dispatch={dispatch}
            onComplete={() => handleGoalCreated(onNewPlanCreated)}
          />
        );
      default:
        return null;
    }
  };

  // StoragePickerStep (step 3) and CreateGoalStep (step 4) handle their own primary action;
  // only show the Next button on steps 1 and 2.
  const showNextButton = !isLastStep && currentStep < 3;

  return (
    <Dialog
      open
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      onClose={handleSkip}
      aria-label="Onboarding wizard"
      disableEscapeKeyDown={false}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2.5,
          pb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Step {currentStep} of {totalSteps}
        </Typography>
        <Button size="small" color="inherit" onClick={handleSkip} sx={{ color: 'text.secondary' }}>
          Skip
        </Button>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mx: 3, borderRadius: 1 }}
      />

      {/* Step content */}
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {renderStep()}
      </DialogContent>

      {/* Footer nav */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: 3,
          pb: 2.5,
          pt: 1,
        }}
      >
        <Button
          onClick={goBack}
          disabled={!canGoBack}
          variant="text"
          color="inherit"
          sx={{ visibility: canGoBack ? 'visible' : 'hidden' }}
        >
          ← Back
        </Button>
        {showNextButton && (
          <Button variant="contained" onClick={goNext}>
            Next →
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default OnboardingWizard;
