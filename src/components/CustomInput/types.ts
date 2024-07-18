import { HTMLInputTypeAttribute } from "react";

export type labelPositionVariant = "left" | "top";
export interface CustomInputProps {
  width?: string;
  height?: string;
  label?: string;
  labelPosition?: labelPositionVariant;
  placeholder?: string;
  type?: HTMLInputTypeAttribute | "number" | undefined;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  maxLength?: number;
}
