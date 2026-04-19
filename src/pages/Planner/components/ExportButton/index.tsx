import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
        size="small"
        variant="text"
        onClick={handleOpen}
        disabled={isExporting}
        endIcon={
          !compact && (
            isExporting ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )
          )
        }
        sx={{ minWidth: 0, fontWeight: 600, fontSize: compact ? 11 : undefined }}
      >
        {isExporting ? (
          compact ? <CircularProgress size={14} color="inherit" /> : 'Exporting…'
        ) : (
          compact ? 'Export' : 'Export'
        )}
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
