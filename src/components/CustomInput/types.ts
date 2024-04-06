export interface InputProps {
  width?: string;
  height?: string;
  label: string;
  placeholder?: string;
  type: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}
