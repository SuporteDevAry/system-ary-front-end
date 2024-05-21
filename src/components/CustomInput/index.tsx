import React from "react";
import { SContainer, SLabel, SCustomInput } from "./styles";
import { CustomInputProps } from "./types";

export const CustomInput: React.FC<CustomInputProps> = ({
  width,
  height,
  label,
  readOnly,
  labelPosition,
  placeholder,
  value,
  type,
  ...rest
}) => {
  return (
    <SContainer labelPosition={labelPosition}>
      <SLabel>{label}</SLabel>
      <SCustomInput
        width={width}
        height={height}
        readOnly={readOnly}
        value={value}
        type={type}
        {...rest}
      />
    </SContainer>
  );
};
