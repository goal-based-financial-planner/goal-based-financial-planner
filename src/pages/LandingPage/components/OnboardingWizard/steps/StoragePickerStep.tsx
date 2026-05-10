import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import GoogleDriveIcon from '../../../../../components/GoogleDriveIcon';
import { StorageProviderId, fsaSupported } from '../../../../../util/storage';
import { StorageProviderContextValue } from '../../../../../context/StorageProviderContext';

type StoragePickerStepProps = {
  initProvider: StorageProviderContextValue['initProvider'];
  onComplete: () => void;
  initialProvider?: StorageProviderId | null;
  initialPlanName?: string;
  onProviderChange?: (p: StorageProviderId, name?: string) => void;
};

const StoragePickerStep: React.FC<StoragePickerStepProps> = ({
  initProvider,
  onComplete,
  initialProvider,
  initialPlanName = '',
  onProviderChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const driveDisabled = !googleClientId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDrive, setPendingDrive] = useState(initialProvider === 'google-drive');
  const [planName, setPlanName] = useState(initialPlanName);

  const handleSelect = async (type: StorageProviderId) => {
    onProviderChange?.(type);
    if (type === 'google-drive') {
      setPendingDrive(true);
      return;
    }
    await doInit(type);
  };

  const handleDriveConfirm = async () => {
    setPendingDrive(false);
    onProviderChange?.('google-drive', planName);
    await doInit('google-drive', planName);
  };

  const doInit = async (type: StorageProviderId, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      await initProvider(type, 'new', name);
      onComplete();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Setting up your plan…</Typography>
      </Box>
    );
  }

  if (pendingDrive) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Name your plan
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Plan name"
          placeholder="My financial plan"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && planName.trim()) void handleDriveConfirm(); }}
          sx={{ mt: 1, mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={() => setPendingDrive(false)} color="inherit">Back</Button>
          <Button
            variant="contained"
            disabled={!planName.trim()}
            onClick={() => void handleDriveConfirm()}
          >
            Create
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Where would you like to save your plan?
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
        {!isMobile && (
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardActionArea onClick={() => void handleSelect('local-file')} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ComputerIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>Local Computer</Typography>
                <Typography variant="body2" color="text.secondary">
                  {fsaSupported
                    ? 'Save directly to a file on your computer with autosave.'
                    : 'Download / upload JSON files manually.'}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        )}

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            cursor: driveDisabled ? 'not-allowed' : 'pointer',
            opacity: driveDisabled ? 0.5 : 1,
          }}
        >
          <CardActionArea
            onClick={() => !driveDisabled && void handleSelect('google-drive')}
            disabled={driveDisabled}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <GoogleDriveIcon
                sx={{ fontSize: 48, color: driveDisabled ? 'text.disabled' : 'primary.main', mb: 1 }}
              />
              <Typography variant="h6" gutterBottom>Google Drive</Typography>
              <Typography variant="body2" color="text.secondary">
                {driveDisabled
                  ? 'Not configured — set VITE_GOOGLE_CLIENT_ID in .env.local to enable.'
                  : 'Autosave to your Google Drive. Access from any device.'}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
};

export default StoragePickerStep;
