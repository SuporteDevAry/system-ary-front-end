export interface CustomSearchProps {
  placeholder?: string;
  width?: string;
  height?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}
