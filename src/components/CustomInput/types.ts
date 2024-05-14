export type labelPositionVariant = "left" | "top";
export interface InputProps {
  width?: string;
  height?: string;
  label: string;
  labelPosition: labelPositionVariant;
  placeholder?: string;
  type: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}
