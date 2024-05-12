import { Modal, Stack, Paper } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}
const CustomModal = ({ open, onClose, children }: CustomModalProps) => {
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    setShowModal(open);
  }, [open]);
  return (
    <Modal
      component={Stack}
      open={open}
      alignItems="center"
      justifyContent="center"
      onClose={onClose}
    >
      <Paper
        component={Stack}
        p={3}
        sx={{
          position: "absolute",
          minWidth: {
            xs: "90%",
            sm: null,
            md: 400,
          },
          maxWidth: 400,
          width: {
            xs: "80%",
            md: 400,
          },
        }}
      >
        {children}
      </Paper>
    </Modal>
  );
};

export default CustomModal;
