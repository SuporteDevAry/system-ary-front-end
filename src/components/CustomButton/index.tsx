import { SButton } from "./styles";
import { CustomButtonProps } from "./types";

const CustomButton: React.FC<CustomButtonProps> = ({
  variant,
  width,
  height,
  disabled,
  onClick,
  children,
}) => {
  return (
    <SButton
      variant={variant}
      width={width}
      height={height}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </SButton>
  );
};

export default CustomButton;
