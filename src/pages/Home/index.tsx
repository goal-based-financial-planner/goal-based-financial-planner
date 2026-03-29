import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import { PlannerDataActionType } from '../../store/plannerDataActions';
import { PlannerData } from '../../domain/PlannerData';
import LandingPage from '../LandingPage';
import Planner from '../Planner';
import { Alert, Box, Button, Divider, Link, Snackbar, useMediaQuery, useTheme } from '@mui/material';
import {
  isDisclaimerAccepted,
  setDisclaimerAccepted,
} from '../../util/legacyStorage';
import DisclaimerDialog from './components/DisclaimerDialog';
import { useStorageProvider } from '../../context/StorageProviderContext';
import { useAutosave } from '../../hooks/useAutosave';
import SaveStatusIndicator from '../../components/SaveStatusIndicator';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    provider,
    initialData,
    clearProvider,
    driveFiles,
    selectDriveFile,
    deleteDriveFile,
    initProvider,
  } = useStorageProvider();

  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  // Sync loaded file data into the reducer; reset to empty when provider is cleared
  useEffect(() => {
    if (initialData) {
      dispatch({ type: PlannerDataActionType.INITIALIZE, payload: initialData });
    } else if (!provider) {
      dispatch({ type: PlannerDataActionType.INITIALIZE, payload: new PlannerData() });
    }
  }, [initialData, provider]);

  const { saveStatus, lastSavedAt, lastError, triggerManualSave } = useAutosave(
    plannerData,
    provider,
  );

  const [showDisclaimer, setShowDisclaimer] = React.useState(
    !isDisclaimerAccepted(),
  );
  const [showDisclaimerDialog, setShowDisclaimerDialog] = React.useState(false);

  // Ctrl/Cmd + S manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerManualSave]);

  const saveControls = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
      <SaveStatusIndicator
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        providerId={provider?.id ?? 'local-file'}
        onRetry={triggerManualSave}
        compact={isMobile}
      />
      {!isMobile && (
        <>
          <Button
            size="small"
            variant="text"
            onClick={triggerManualSave}
            disabled={saveStatus === 'saving'}
            sx={{ minWidth: 0, fontWeight: 600 }}
          >
            Save
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        </>
      )}
      <Button
        size="small"
        variant="text"
        onClick={() => void clearProvider()}
        sx={{ minWidth: 0, color: 'text.secondary', fontSize: isMobile ? 11 : undefined }}
      >
        {isMobile ? 'Close' : 'Close Plan'}
      </Button>
    </Box>
  );

  return (
    <>
      {plannerData.financialGoals?.length > 0 ? (
        <Planner
          plannerData={plannerData}
          dispatch={dispatch}
          headerRight={saveControls}
        />
      ) : (
        <LandingPage
          dispatch={dispatch}
          clearProvider={clearProvider}
          initProvider={initProvider}
          driveFiles={driveFiles}
          selectDriveFile={selectDriveFile}
          deleteDriveFile={deleteDriveFile}
        />
      )}

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showDisclaimer}
        sx={{
          maxWidth: '100%',
          width: { xs: '100%', sm: '80%' },
          left: '50%',
          transform: 'translateX(-50%)',
          px: '24px',
          boxSizing: 'border-box',
        }}
      >
        <Alert
          severity="success"
          sx={{ display: 'flex', alignItems: 'center' }}
          action={
            <Button
              variant="contained"
              onClick={() => {
                setShowDisclaimer(false);
                setDisclaimerAccepted();
              }}
            >
              Accept
            </Button>
          }
        >
          This tool provides investment suggestions for informational purposes
          only and does not constitute financial advice. Please read our{' '}
          <Link href="#" onClick={() => setShowDisclaimerDialog(true)}>
            disclaimer
          </Link>{' '}
          for details.
        </Alert>
      </Snackbar>
      <DisclaimerDialog
        showDialog={showDisclaimerDialog}
        handleClose={() => setShowDisclaimerDialog(false)}
      />

      {/* Save error snackbar */}
      {saveStatus === 'error' && lastError && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={triggerManualSave}>
                Retry
              </Button>
            }
          >
            {lastError.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default Home;
