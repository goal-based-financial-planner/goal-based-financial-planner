import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface AcknowledgmentDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const AcknowledgmentDialog: React.FC<AcknowledgmentDialogProps> = ({
  open,
  message,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Acknowledgment</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          I Understood
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcknowledgmentDialog;
