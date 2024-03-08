import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

import CustomButton from "../CustomButton";
import { IModalProps } from "./types";

export function Modal({
  open,
  titleText,
  children,
  cancelButton,
  confirmButton,
  variantCancel,
  variantConfirm,
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
          <CustomButton
            variant={variantCancel}
            width="80px"
            onClick={handleClose}
          >
            {cancelButton}
          </CustomButton>
        )}
        {confirmButton && (
          <CustomButton
            variant={variantConfirm}
            width="80px"
            onClick={onHandleCreate}
          >
            {confirmButton}
          </CustomButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
