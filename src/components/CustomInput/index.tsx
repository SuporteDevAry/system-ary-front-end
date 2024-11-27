import React from "react";
import {
  SContainer,
  SLabel,
  SCustomInput,
  SRadioGroup,
  SRadioOption,
} from "./styles";
import { CustomInputProps } from "./types";

export const CustomInput: React.FC<CustomInputProps> = ({
  width,
  height,
  label,
  readOnly,
  $labelPosition,
  placeholder,
  value,
  type,
  radioOptions,
  radioPosition = "inline",
  onRadioChange,
  selectedRadio,
  autoComplete = "off",
  ...rest
}) => {
  return (
    <SContainer $labelPosition={$labelPosition}>
      {radioOptions && radioPosition === "only" ? (
        <>
          {label ? <SLabel>{label}</SLabel> : ""}
          <SRadioGroup>
            {radioOptions.map((option, index) => (
              <SRadioOption key={index}>
                <input
                  type="radio"
                  name={rest.name}
                  value={option.value}
                  checked={selectedRadio === option.value}
                  onChange={onRadioChange}
                />
                <span>{option.label}</span>
              </SRadioOption>
            ))}
          </SRadioGroup>
        </>
      ) : radioOptions && radioPosition === "inline" ? (
        <>
          <SLabel>{label}</SLabel>

          <SRadioGroup>
            {radioOptions.map((option, index) => (
              <SRadioOption key={index}>
                <input
                  type="radio"
                  name={rest.name}
                  value={option.value}
                  checked={selectedRadio === option.value}
                  onChange={onRadioChange}
                />
                <span>{option.label}</span>
              </SRadioOption>
            ))}
          </SRadioGroup>

          <SCustomInput
            width={width}
            height={height}
            readOnly={readOnly}
            value={value}
            type={type}
            placeholder={placeholder}
            {...rest}
          />
        </>
      ) : (
        <>
          <SLabel>{label}</SLabel>
          <SCustomInput
            width={width}
            height={height}
            readOnly={readOnly}
            value={value}
            type={type}
            placeholder={placeholder}
            {...rest}
          />
        </>
      )}
    </SContainer>
  );
};
