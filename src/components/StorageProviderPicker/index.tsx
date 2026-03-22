import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import GoogleDriveIcon from '../GoogleDriveIcon';
import { StorageProviderId, fsaSupported } from '../../util/storage';

interface StorageProviderPickerProps {
  open: boolean;
  mode: 'new' | 'open';
  onSelect: (type: StorageProviderId) => void;
  onCancel: () => void;
}

const StorageProviderPicker: React.FC<StorageProviderPickerProps> = ({
  open,
  mode,
  onSelect,
  onCancel,
}) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
    | string
    | undefined;
  const driveDisabled = !googleClientId;
  const actionLabel = mode === 'new' ? 'New Plan' : 'Open Plan';

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{actionLabel} — Choose Storage Location</DialogTitle>
      <DialogContent>
        {!fsaSupported && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your browser doesn&apos;t support automatic file saving. Local
            Computer will use manual download/upload. For autosave, choose
            Google Drive.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Local Computer */}
          <Card
            variant="outlined"
            sx={{ flex: 1, cursor: 'pointer' }}
          >
            <CardActionArea onClick={() => onSelect('local-file')} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ComputerIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Local Computer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fsaSupported
                    ? 'Save directly to a file on your computer with autosave.'
                    : 'Download / upload JSON files manually.'}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Google Drive */}
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              cursor: driveDisabled ? 'not-allowed' : 'pointer',
              opacity: driveDisabled ? 0.5 : 1,
            }}
          >
            <CardActionArea
              onClick={() => !driveDisabled && onSelect('google-drive')}
              disabled={driveDisabled}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <GoogleDriveIcon
                  sx={{
                    fontSize: 48,
                    color: driveDisabled ? 'text.disabled' : 'primary.main',
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Google Drive
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {driveDisabled
                    ? 'Not configured — set VITE_GOOGLE_CLIENT_ID in .env.local to enable.'
                    : 'Autosave to your Google Drive app folder. Access from any device.'}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StorageProviderPicker;
