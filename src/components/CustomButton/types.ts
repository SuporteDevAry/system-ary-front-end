import { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success";

export interface CustomButtonProps {
  $variant: ButtonVariant;
  width?: string;
  height?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
