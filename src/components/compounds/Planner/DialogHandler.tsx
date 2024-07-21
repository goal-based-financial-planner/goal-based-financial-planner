import React from 'react';
import { PlannerState } from '../../../types/enums';
import AcknowledgmentDialog from './AcknowledmentDialog';

interface DialogHandlerProps {
  isDialogOpen: boolean;
  currentDialogStep: PlannerState | null;
  dialogMessage: string;
  onDialogClose: () => void;
  disableIcon: (step: PlannerState | null) => void;
}

const DialogHandler: React.FC<DialogHandlerProps> = ({
  isDialogOpen,
  currentDialogStep,
  dialogMessage,
  onDialogClose,
  disableIcon,
}) => {
  const handleDialogClose = () => {
    onDialogClose();
    disableIcon(currentDialogStep);
  };

  return (
    <AcknowledgmentDialog
      open={isDialogOpen}
      message={dialogMessage}
      onClose={handleDialogClose}
    />
  );
};

export default DialogHandler;
