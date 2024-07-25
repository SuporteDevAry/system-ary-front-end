import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import CustomButton from "../CustomButton";
import { IModalProps } from "./types";
import { SDialogActions, SDialogContent } from "./styles";

export function Modal({
  open,
  titleText,
  children,
  cancelButton,
  confirmButton,
  variantCancel,
  variantConfirm,
  maxWidth,
  fullWidth,
  onHandleCreate,
  onClose,
}: IModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      // sx={{ "& .MuiDialog-paper": { minHeight: "400px", maxHeight: "90vh" } }} // Customize height
    >
      <DialogTitle>{titleText}</DialogTitle>
      <SDialogContent>
        <DialogContentText>{children}</DialogContentText>
      </SDialogContent>
      <SDialogActions>
        {cancelButton && (
          <CustomButton
            $variant={variantCancel}
            width="90px"
            onClick={handleClose}
          >
            {cancelButton}
          </CustomButton>
        )}
        {confirmButton && (
          <CustomButton
            $variant={variantConfirm}
            width="90px"
            onClick={onHandleCreate}
          >
            {confirmButton}
          </CustomButton>
        )}
      </SDialogActions>
    </Dialog>
  );
}
