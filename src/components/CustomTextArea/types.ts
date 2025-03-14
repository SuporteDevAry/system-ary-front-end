export interface CustomTextAreaProps {
  width?: string;
  height?: string;
  label?: string;
  name?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}
