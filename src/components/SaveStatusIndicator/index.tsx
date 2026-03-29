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
  compact?: boolean;
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
  compact = false,
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
          {!compact && 'All changes saved'}
        </Box>
      </Tooltip>
    );
  }

  if (saveStatus === 'saving') {
    return (
      <Tooltip title={compact ? `Saving to ${providerLabel[providerId]}…` : ''}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CircularProgress size={14} />
          {!compact && (
            <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
              Saving to {providerLabel[providerId]}…
            </Box>
          )}
        </Box>
      </Tooltip>
    );
  }

  if (saveStatus === 'saved') {
    return (
      <Tooltip title={compact ? `Saved to ${providerLabel[providerId]}` : ''}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
          {!compact && (
            <Box component="span" sx={{ fontSize: 12, color: 'success.main' }}>
              Saved to {providerLabel[providerId]}
            </Box>
          )}
        </Box>
      </Tooltip>
    );
  }

  // error
  return (
    <Chip
      size="small"
      icon={<ErrorOutlineIcon />}
      label={compact ? 'Save failed' : `Save to ${providerLabel[providerId]} failed – click to retry`}
      color="error"
      variant="outlined"
      onClick={onRetry}
      clickable={!!onRetry}
      sx={{ fontSize: 12 }}
    />
  );
};

export default SaveStatusIndicator;
