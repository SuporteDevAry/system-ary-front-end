import { HTMLInputTypeAttribute } from "react";

export interface RadioOption {
  label: string;
  value: string;
}

export type labelPositionVariant = "left" | "top";
export interface CustomInputProps {
  width?: string;
  height?: string;
  label?: string;
  $labelPosition?: labelPositionVariant;
  placeholder?: string;
  type?: HTMLInputTypeAttribute | "number" | undefined;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  maxLength?: number;
  radioOptions?: RadioOption[]; // Adiciona as opções de radio buttons
  radioPosition?: "inline" | "only"; // Define a posição dos radio buttons
  onRadioChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedRadio?: string;
  [x: string]: any;
  inputRef?: React.Ref<HTMLInputElement>;
}
