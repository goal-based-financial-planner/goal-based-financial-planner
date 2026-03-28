import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import image1 from '../../assets/image1.png';
import image2 from '../../assets/image2.png';
import image3 from '../../assets/image3.png';
import image4 from '../../assets/image4.png';
import icon from '../../assets/icon.png';
import { StyledBox } from '../../components/StyledBox';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../store/plannerDataReducer';
import AddGoalPopup from '../Home/components/AddGoalPopup';
import StorageProviderPicker from '../../components/StorageProviderPicker';
import { DriveFileInfo, StorageProviderId } from '../../util/storage';
import { StorageProviderContextValue } from '../../context/StorageProviderContext';

const getImageStyle = (position: string, size: number, rotation: number) => ({
  position: 'absolute',
  width: `${size / 16}rem`,
  filter: 'brightness(0.98)',
  opacity: 0.9,
  transform: `rotate(${rotation}deg)`,
  ...(position === 'top-left'
    ? { top: '2%', left: '2%' }
    : position === 'top-right'
      ? { top: '5%', right: '1%' }
      : position === 'bottom-left'
        ? { bottom: '3%', left: '-2%' }
        : { bottom: '-3%', right: '2%' }),
});

interface LandingPageProps {
  dispatch: Dispatch<PlannerDataAction>;
  clearProvider: () => Promise<void>;
  initProvider: StorageProviderContextValue['initProvider'];
  driveFiles: DriveFileInfo[];
  selectDriveFile: (fileId: string) => Promise<import('../../domain/PlannerData').PlannerData | null>;
  deleteDriveFile: (fileId: string) => Promise<void>;
}

const LandingPage = ({
  dispatch,
  clearProvider,
  initProvider,
  driveFiles,
  selectDriveFile,
  deleteDriveFile,
}: LandingPageProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'new' | 'open' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DriveFileInfo | null>(null);
  const [pendingDriveProvider, setPendingDriveProvider] = useState<StorageProviderId | null>(null);
  const [planName, setPlanName] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleProviderSelect = async (type: StorageProviderId) => {
    const mode = pickerMode!;
    setPickerMode(null);

    // For Google Drive new plan, ask for a name first
    if (type === 'google-drive' && mode === 'new') {
      setPlanName('');
      setPendingDriveProvider(type);
      return;
    }

    await _doInitProvider(type, mode);
  };

  const handlePlanNameConfirm = async () => {
    const type = pendingDriveProvider!;
    setPendingDriveProvider(null);
    await _doInitProvider(type, 'new', planName);
  };

  const _doInitProvider = async (type: StorageProviderId, mode: 'new' | 'open', name?: string) => {
    setLoading(true);
    try {
      await initProvider(type, mode, name);
      if (mode === 'new') {
        setIsFormOpen(true);
      } else if (mode === 'open' && type !== 'google-drive') {
        setIsFormOpen(true);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDriveFileSelect = async (file: DriveFileInfo) => {
    setLoading(true);
    try {
      await selectDriveFile(file.id);
      // If the file had no goals, open the add goal form
      setIsFormOpen(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    const file = fileToDelete;
    setFileToDelete(null);
    setLoading(true);
    try {
      await deleteDriveFile(file.id);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Drive file list view ──────────────────────────────────────────────────
  if (driveFiles.length > 0) {
    return (
      <Box sx={containerSx}>
        <Typography variant="h6" gutterBottom>
          Select a plan to open:
        </Typography>
        {loading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <List sx={{ width: '100%', maxWidth: 480, bgcolor: 'background.paper', borderRadius: 2 }}>
            {driveFiles.map((file) => (
              <ListItem
                key={file.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => void handleDriveFileSelect(file)}>
                  <ListItemText
                    primary={file.name}
                    secondary={`Last modified: ${new Date(file.modifiedTime).toLocaleString()}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        <Button sx={{ mt: 2 }} onClick={() => void clearProvider()}>
          Cancel
        </Button>

        <Dialog open={!!fileToDelete} onClose={() => setFileToDelete(null)}>
          <DialogTitle>Delete plan?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              &ldquo;{fileToDelete?.name}&rdquo; will be permanently deleted from Google Drive. This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFileToDelete(null)}>Cancel</Button>
            <Button color="error" onClick={() => void handleDeleteConfirm()}>Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>
      </Box>
    );
  }

  // ── Main landing view ─────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', p: 2 }}>
      <StyledBox
        flexGrow={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#ffffff',
          backgroundImage:
            'radial-gradient(lightgray 10%, transparent 11%),radial-gradient(lightgray 10%, transparent 11%)',
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 3px 3px',
          backgroundRepeat: 'repeat',
        }}
      >
        {!isMobile && (
          <>
            <Paper component="img" src={image1} alt="Reminder" sx={getImageStyle('top-left', 300, -15)} />
            <Paper component="img" src={image2} alt="Checklist" sx={getImageStyle('top-right', 480, 10)} />
            <Paper component="img" src={image3} alt="Today's tasks" sx={getImageStyle('bottom-right', 260, 4)} />
            <Paper component="img" src={image4} alt="Integrations" sx={getImageStyle('bottom-left', 500, -10)} />
          </>
        )}

        <img src={icon} alt="icon" style={{ width: '60px' }} />
        <Typography variant="h2">Plan your Financial Goals</Typography>

        {loading ? (
          <CircularProgress sx={{ mt: 1 }} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              onClick={() => setPickerMode('new')}
              sx={{ border: '1px solid green', backgroundColor: 'green' }}
            >
              NEW PLAN
            </Button>
            <Button
              variant="text"
              size="small"
              color="inherit"
              onClick={() => setPickerMode('open')}
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              Open existing plan
            </Button>
          </Box>
        )}
      </StyledBox>

      <StorageProviderPicker
        open={pickerMode !== null}
        mode={pickerMode ?? 'new'}
        onSelect={(type) => void handleProviderSelect(type)}
        onCancel={() => setPickerMode(null)}
      />

      <Dialog
        open={pendingDriveProvider !== null}
        onClose={() => setPendingDriveProvider(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Name your plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Plan name"
            placeholder="Plan name"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && planName.trim()) void handlePlanNameConfirm(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDriveProvider(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!planName.trim()}
            onClick={() => void handlePlanNameConfirm()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <AddGoalPopup
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        dispatch={dispatch}
        title="Add your first goal"
      />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

const containerSx = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  p: 3,
  bgcolor: 'background.default',
};

export default LandingPage;
