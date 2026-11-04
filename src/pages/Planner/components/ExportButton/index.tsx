import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';

type ExportButtonProps = {
  onDownloadPdf: () => Promise<void>;
  onPrint: () => void;
  isExporting: boolean;
  error: string | null;
  compact?: boolean;
};

const ExportButton = ({
  onDownloadPdf,
  onPrint,
  isExporting,
  error,
  compact = false,
}: ExportButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadPdf = async () => {
    handleClose();
    await onDownloadPdf();
  };

  const handlePrint = () => {
    handleClose();
    onPrint();
  };

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleOpen}
        disabled={isExporting}
        aria-haspopup="menu"
        startIcon={
          isExporting ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <IosShareIcon sx={{ fontSize: '16px !important' }} />
          )
        }
        sx={{
          height: 38,
          px: compact ? 1.25 : 2,
          fontSize: 13,
          color: 'text.primary',
          backgroundColor: 'background.paper',
          borderColor: 'divider',
          '&:hover': { borderColor: 'text.disabled', backgroundColor: 'background.paper' },
        }}
      >
        {isExporting && !compact ? 'Exporting…' : 'Export'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDownloadPdf} sx={{ gap: 1 }}>
          <PictureAsPdfIcon fontSize="small" />
          Download PDF
        </MenuItem>
        <MenuItem onClick={handlePrint} sx={{ gap: 1 }}>
          <PrintIcon fontSize="small" />
          Print
        </MenuItem>
      </Menu>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 1, fontSize: '12px', py: 0, maxWidth: 280 }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ExportButton;
