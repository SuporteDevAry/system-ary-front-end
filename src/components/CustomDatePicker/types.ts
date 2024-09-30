import { HTMLInputTypeAttribute } from "react";

export interface RadioOption {
  label: string;
  value: string;
}

export type labelPositionVariant = "left" | "top";
export interface CustomDatePickerProps {
  width?: string;
  height?: string;
  label?: string;
  $labelPosition?: labelPositionVariant;
  name?: string;
  value?: string;
  onChange: (newDate: string) => void;
  [x: string]: any;
}
