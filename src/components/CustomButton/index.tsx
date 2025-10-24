import { SButton } from "./styles";
import { CustomButtonProps } from "./types";

const CustomButton: React.FC<CustomButtonProps> = ({
  $variant,
  width,
  height,
  disabled,
  onClick,
  children,
  backgroundColor,
  color,
}) => {
  return (
    <SButton
      $variant={$variant}
      width={width}
      height={height}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...(backgroundColor && { backgroundColor }),
        ...(color && { color }),
      }}
    >
      {children}
    </SButton>
  );
};

export default CustomButton;
