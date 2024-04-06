import { SContainer, SLabel, SCustomInput } from "./styles";
import { InputProps } from "./types";

const CustomInput: React.FC<InputProps> = ({
  width,
  height,
  label,
  readOnly,
  ...rest
}) => {
  return (
    <SContainer>
      <SLabel>{label}</SLabel>
      <SCustomInput
        width={width}
        height={height}
        readOnly={readOnly}
        {...rest}
      />
    </SContainer>
  );
};

export default CustomInput;
