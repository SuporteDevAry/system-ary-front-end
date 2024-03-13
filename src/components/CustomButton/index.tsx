import { CustomButtonProps, SButton } from "./styles";

const CustomButton: React.FC<CustomButtonProps> = ({
  variant,
  width,
  height,
  disabled,
  onClick,
  children,
}) => {
  //console.log(variant, width, height);
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
