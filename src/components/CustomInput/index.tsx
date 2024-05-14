import { SContainer, SLabel, SCustomInput } from "./styles";
import { InputProps } from "./types";

const CustomInput: React.FC<InputProps> = ({
  width,
  height,
  label,
  readOnly,
  labelPosition,
  ...rest
}) => {
  return (
    <SContainer labelPosition={labelPosition}>
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
