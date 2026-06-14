import React from "react";
import {
  SContainer,
  SLabel,
  SCustomInput,
  SCustomSelect,
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
  onChange,
  onBlur,
  type,
  radioOptions,
  radioPosition = "inline",
  onRadioChange,
  selectedRadio,
  selectOptions,
  autoComplete = "off",
  inputRef,
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
            onChange={onChange}
            onBlur={onBlur}
            ref={inputRef}
            {...rest}
          />
        </>
      ) : selectOptions ? (
        <>
          <SLabel>{label}</SLabel>
          <SCustomSelect
            width={width}
            height={height}
            value={value}
            ref={inputRef as React.Ref<HTMLSelectElement>}
            {...rest}
            onChange={
              onChange as unknown as React.ChangeEventHandler<HTMLSelectElement>
            }
          >
            <option value=""></option>
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SCustomSelect>
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
            onChange={onChange}
            onBlur={onBlur}
            ref={inputRef}
            {...rest}
          />
        </>
      )}
    </SContainer>
  );
};
