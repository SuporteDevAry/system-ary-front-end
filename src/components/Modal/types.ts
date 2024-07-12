import React from "react";
import { ButtonVariant } from "../CustomButton/types";

export interface IModalProps {
  titleText: string;
  children: React.ReactNode;
  cancelButton?: string;
  confirmButton?: string;
  open: boolean;
  onClose: () => void;
  onHandleCreate: () => void;
  variantCancel: ButtonVariant;
  variantConfirm: ButtonVariant;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}
