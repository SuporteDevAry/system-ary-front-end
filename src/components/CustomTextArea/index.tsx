import React from "react";
import { SContainer, SText, STextArea } from "./styles";
import { CustomTextAreaProps } from "./types";

export const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  width,
  height,
  label,
  value,
  name,
  onChange,
  ...rest
}) => {
  return (
    <SContainer>
      {label && <SText>{label}</SText>}
      <STextArea
        name={name}
        value={value}
        width={width}
        height={height}
        onChange={onChange}
        {...rest}
      />
    </SContainer>
  );
};
