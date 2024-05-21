export type labelPositionVariant = "left" | "top";

export interface CustomSelectProps {
  width?: string;
  height?: string;
  label: string;
  labelPosition: labelPositionVariant;
  placeholder?: string;
  name: string;
  value: string;
  selectOptions?: { value: string; label: string }[];
  onSelectChange?: (value: string) => void;
}
