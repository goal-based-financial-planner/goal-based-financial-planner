import React from 'react';
import { Box, Chip, CircularProgress, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import GoogleDriveIcon from '../GoogleDriveIcon';
import { SaveStatus, StorageProviderId } from '../../util/storage';

interface SaveStatusIndicatorProps {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  providerId: StorageProviderId;
  onRetry?: () => void;
}

const providerLabel: Record<StorageProviderId, string> = {
  'local-file': 'Local Computer',
  'google-drive': 'Google Drive',
};

const ProviderIcon: React.FC<{ providerId: StorageProviderId; color?: string }> = ({ providerId, color }) => {
  const sx = { fontSize: 14, color: color ?? 'text.secondary' };
  return providerId === 'google-drive'
    ? <GoogleDriveIcon sx={sx} />
    : <ComputerIcon sx={sx} />;
};

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  saveStatus,
  lastSavedAt,
  providerId,
  onRetry,
}) => {
  if (saveStatus === 'idle') {
    if (!lastSavedAt) {
      return (
        <Tooltip title={`Saving to: ${providerLabel[providerId]}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'default' }}>
            <ProviderIcon providerId={providerId} />
          </Box>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={`Saved to ${providerLabel[providerId]} at ${lastSavedAt.toLocaleTimeString()}`}>
        <Box
          component="span"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: 'text.disabled', cursor: 'default' }}
        >
          <ProviderIcon providerId={providerId} color="text.disabled" />
          All changes saved
        </Box>
      </Tooltip>
    );
  }

  if (saveStatus === 'saving') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CircularProgress size={14} />
        <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          Saving to {providerLabel[providerId]}…
        </Box>
      </Box>
    );
  }

  if (saveStatus === 'saved') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
        <Box component="span" sx={{ fontSize: 12, color: 'success.main' }}>
          Saved to {providerLabel[providerId]}
        </Box>
      </Box>
    );
  }

  // error
  return (
    <Chip
      size="small"
      icon={<ErrorOutlineIcon />}
      label={`Save to ${providerLabel[providerId]} failed – click to retry`}
      color="error"
      variant="outlined"
      onClick={onRetry}
      clickable={!!onRetry}
      sx={{ fontSize: 12 }}
    />
  );
};

export default SaveStatusIndicator;
