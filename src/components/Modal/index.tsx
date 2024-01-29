import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import React from "react";
// import Typography from '@mui/material/Typography';

interface IModalProps {
  titleText: string;
  children: React.ReactNode;
  cancelButton?: string;
  confirmButton?: string;
  open: boolean;
  onClose: () => void;
  onHandleCreate: () => void;
}

export function Modal({
  open,
  titleText,
  children,
  cancelButton,
  confirmButton,
  onHandleCreate,
  onClose,
}: IModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{titleText}</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {cancelButton && (
          <Button autoFocus onClick={handleClose}>
            {cancelButton}
          </Button>
        )}
        {confirmButton && (
          <Button onClick={onHandleCreate} autoFocus>
            {confirmButton}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
