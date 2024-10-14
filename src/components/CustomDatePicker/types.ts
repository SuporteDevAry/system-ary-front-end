export type labelPositionVariant = "left" | "top";
export interface CustomDatePickerProps {
  width?: string;
  height?: string;
  label?: string | React.ReactNode;
  $labelPosition?: labelPositionVariant;
  name?: string;
  value?: string;
  onChange: (newDate: string) => void;
  [x: string]: any;
  disableWeekends?: boolean;
}
